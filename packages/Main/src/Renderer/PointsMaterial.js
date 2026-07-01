import * as THREE from 'three';
import { PointsNodeMaterial } from 'three/webgpu';
import {
    Fn, If,
    uniform, attribute, texture,
    vec2, vec3, vec4, float, int,
    positionLocal,
    max, abs, pow,
} from 'three/tsl';
import CommonMaterial from 'Renderer/CommonMaterial';
import Gradients from 'Utils/Gradients';

export const PNTS_MODE = {
    COLOR: 0,
    INTENSITY: 1,
    CLASSIFICATION: 2,
    ELEVATION: 3,
    RETURN_NUMBER: 4,
    RETURN_TYPE: 5,
    RETURN_COUNT: 6,
    POINT_SOURCE_ID: 7,
    SCAN_ANGLE: 8,
    NORMAL: 9,
};

export const PNTS_SHAPE = {
    CIRCLE: 0,
    SQUARE: 1,
};

export const PNTS_SIZE_MODE = {
    VALUE: 0,
    ATTENUATED: 1,
};

const white = new THREE.Color(1.0,  1.0,  1.0);

/**
 * Every lidar point can have a classification assigned to it that defines
 * the type of object that has reflected the laser pulse. Lidar points can be
 * classified into a number of categories including bare earth or ground,
 * top of canopy, and water. The different classes are defined using numeric
 * integer codes in the files.
 *
 * @typedef {object} Classification
 * @property {boolean} visible - category visibility,
 * @property {string} name - category name,
 * @property {THREE.Color} color - category color,
 * @property {number} opacity - category opacity,
 */

export const ClassificationScheme = {
    DEFAULT: {
        0: { visible: true, name: 'never classified', color: new THREE.Color(0.5,  0.5,  0.5), opacity: 1.0 },
        1: { visible: true, name: 'unclassified', color: new THREE.Color(0.5,  0.5,  0.5), opacity: 1.0 },
        2: { visible: true, name: 'ground', color: new THREE.Color(0.63, 0.32, 0.18), opacity: 1.0 },
        3: { visible: true, name: 'low vegetation', color: new THREE.Color(0.0,  1.0,  0.0), opacity: 1.0 },
        4: { visible: true, name: 'medium vegetation', color: new THREE.Color(0.0,  0.8,  0.0), opacity: 1.0 },
        5: { visible: true, name: 'high vegetation', color: new THREE.Color(0.0,  0.6,  0.0), opacity: 1.0 },
        6: { visible: true, name: 'building', color: new THREE.Color(1.0,  0.66, 0.0), opacity: 1.0 },
        7: { visible: true, name: 'low point(noise)', color: new THREE.Color(1.0,  0.0,  1.0), opacity: 1.0 },
        8: { visible: true, name: 'key-point', color: new THREE.Color(1.0,  0.0,  0.0), opacity: 1.0 },
        9: { visible: true, name: 'water', color: new THREE.Color(0.0,  0.0,  1.0), opacity: 1.0 },
        10: { visible: true, name: 'rail', color: new THREE.Color(0.8,  0.8,  1.0), opacity: 1.0 },
        11: { visible: true, name: 'road Surface', color: new THREE.Color(0.4,  0.4,  0.7), opacity: 1.0 },
        12: { visible: true, name: 'overlap', color: new THREE.Color(1.0,  1.0,  0.0), opacity: 1.0 },
        DEFAULT: { visible: true, name: 'default', color: new THREE.Color(0.3, 0.6, 0.6), opacity: 1.0 },
    },
};

const DiscreteScheme = {
    DEFAULT: {
        0: { visible: true, name: '0', color: new THREE.Color('rgb(67, 99, 216)'), opacity: 1.0 },
        1: { visible: true, name: '1', color: new THREE.Color('rgb(60, 180, 75);'), opacity: 1.0 },
        2: { visible: true, name: '2', color: new THREE.Color('rgb(255, 255, 25)'), opacity: 1.0 },
        3: { visible: true, name: '3', color: new THREE.Color('rgb(145, 30, 180)'), opacity: 1.0 },
        4: { visible: true, name: '4', color: new THREE.Color('rgb(245, 130, 49)'), opacity: 1.0 },
        5: { visible: true, name: '5', color: new THREE.Color('rgb(230, 25, 75)'), opacity: 1.0 },
        6: { visible: true, name: '6', color: new THREE.Color('rgb(66, 212, 244)'), opacity: 1.0 },
        7: { visible: true, name: '7', color: new THREE.Color('rgb(240, 50, 230)'), opacity: 1.0 },
        DEFAULT: { visible: true, name: 'default', color: white, opacity: 1.0 },
    },
};

// Taken from Potree. Copyright (c) 2011-2020, Markus Schütz All rights reserved.
// https://github.com/potree/potree/blob/develop/src/materials/PointCloudMaterial.js
function generateGradientTexture(gradient) {
    const size = 64;

    // create canvas
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;

    // get context
    const context = canvas.getContext('2d');

    // draw gradient
    context.rect(0, 0, size, size);
    const ctxGradient = context.createLinearGradient(0, 0, size, size);

    for (let i = 0; i < gradient.length; i++) {
        const step = gradient[i];

        ctxGradient.addColorStop(step[0], `#${step[1].getHexString()}`);
    }

    context.fillStyle = ctxGradient;
    context.fill();

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    texture.minFilter = THREE.LinearFilter;
    texture.wrap = THREE.RepeatWrapping;
    texture.repeat = 2;

    return texture;
}

function recomputeTexture(scheme, texture, nbClass) {
    const data = texture.image.data;
    const width = texture.image.width;
    if (!nbClass) { nbClass = Object.keys(scheme).length; }

    texture.userData.transparent = false;
    for (let i = 0; i < width; i++) {
        let color;
        let opacity;

        if (scheme[i]) {
            color = scheme[i].color;
            opacity = scheme[i].opacity;
        } else if (scheme[i % nbClass]) {
            color = scheme[i % nbClass].color;
            opacity = scheme[i % nbClass].opacity;
        } else if (scheme.DEFAULT) {
            color = scheme.DEFAULT.color;
            opacity = scheme.DEFAULT.opacity;
        } else {
            color = white;
            opacity = 1.0;
        }

        const j = 4 * i;
        data[j + 0] = parseInt(255 * color.r, 10);
        data[j + 1] = parseInt(255 * color.g, 10);
        data[j + 2] = parseInt(255 * color.b, 10);
        data[j + 3] = parseInt(255 * opacity, 10);

        if (opacity < 1.0) {
            texture.userData.transparent = true;
        }
    }
    texture.needsUpdate = true;
}

class PointsMaterial extends PointsNodeMaterial {
    /**
     * @class      PointsMaterial
     * @param      {object}  [options={}]  The options
     * @param      {number}  [options.size=1] point size
     * @param      {number}  [options.mode=PNTS_MODE.COLOR]  display mode.
     * @param      {number}  [options.shape=PNTS_SHAPE.CIRCLE]  rendered points shape.
     * @param      {THREE.Vector4}  [options.overlayColor=new THREE.Vector4(0, 0, 0, 0)]  overlay color.
     * @param      {Scheme}  [options.classificationScheme]  LUT for point classification colorization.
     * @param      {Scheme}  [options.discreteScheme]  LUT for other discret point values colorization.
     * @param      {string}  [options.gradient]  Descrition of the gradient to use for continuous point values.
     *                          (Default value will be the 'SPECTRAL' gradient from Utils/Gradients)
     * @param      {number}  [options.sizeMode=PNTS_SIZE_MODE.VALUE]  point cloud size mode. Only 'VALUE' or 'ATTENUATED' are possible. VALUE use constant size, ATTENUATED compute size depending on distance from point to camera.
     * @param      {number}  [options.minAttenuatedSize=3]  minimum scale used by 'ATTENUATED' size mode
     * @param      {number}  [options.maxAttenuatedSize=10]  maximum scale used by 'ATTENUATED' size mode
     *
     * @property {object} options - options for the PointsMaterial.
     * @property {THREE.Vector2}  [options.intensityRange=new THREE.Vector2(1, 65536)]  intensity range (default value will be [1, 65536] if not defined at Layer level).
     * @property {THREE.Vector2}  [options.elevationRange=new THREE.Vector2(0, 1000)]  elevation range (default value will be [0, 1000] if not defined at Layer level).
     * @property {THREE.Vector2}  [options.angleRange=new THREE.Vector2(-90, 90)]  scan angle range (default value will be [-90, 90] if not defined at Layer level).
     * @property {Scheme}  classificationScheme - Color scheme for point classification values.
     * @property {Scheme}  discreteScheme - Color scheme for all other discrete values.
     * @property {object}  gradients - Descriptions of all available gradients.
     * @property {object}  gradient - Description of the gradient to use for display.
     * @property {THREE.CanvasTexture}  gradientTexture - The texture generate from the choosen gradient.
     *
     * @example
     * // change color category classification
     * const pointMaterial = new PointsMaterial();
     * pointMaterial.classification[3].color.setStyle('red');
     * pointMaterial.recomputeClassification();
     */
    constructor(options = {}) {
        const gradients = {
            ...options.gradient,
            ...Gradients,
        };
        options.gradient = Object.values(gradients)[0];

        const {
            intensityRange = new THREE.Vector2(1, 65536),
            elevationRange = new THREE.Vector2(0, 1000),
            angleRange = new THREE.Vector2(-90, 90),
            classificationScheme = ClassificationScheme.DEFAULT,
            discreteScheme = DiscreteScheme.DEFAULT,
            size = 1,
            mode = PNTS_MODE.COLOR,
            shape = PNTS_SHAPE.CIRCLE,
            sizeMode = PNTS_SIZE_MODE.ATTENUATED,
            minAttenuatedSize = 3,
            maxAttenuatedSize = 10,
            gradient,
            gamma = 1.0,
            scale = 0.05 * 0.5 / Math.tan(1.0 / 2.0),
            ambientBoost = 0.0,
        } = options;

        super({
            fog: true,
            transparent: true,
            vertexColors: true,
        });
        if (__DEBUG__) { this.name = 'PointsMaterial'; }

        // ---- TSL uniforms ----
        this._modeNode = uniform(mode, 'int');
        this._shapeNode = uniform(shape, 'int');
        this._pickingNode = uniform(false, 'bool');
        this._opacityUnif = uniform(1.0, 'float');
        this._intensityRangeNode = uniform(intensityRange);
        this._elevationRangeNode = uniform(elevationRange);
        this._angleRangeNode = uniform(angleRange);
        this._sizeNode = uniform(size, 'float');
        this._scaleNode = uniform(scale, 'float');
        this._sizeMode = sizeMode;
        this._sizeUnif = uniform(size, 'float');
        this._minAttenuatedSizeNode = uniform(minAttenuatedSize, 'float');
        this._maxAttenuatedSizeNode = uniform(maxAttenuatedSize, 'float');
        this._gammaNode = uniform(gamma, 'float');
        this._ambientBoostNode = uniform(ambientBoost, 'float');

        this.gradients = gradients;
        this.gradientTexture = new THREE.CanvasTexture(document.createElement('canvas'));

        // Classification / discrete / visibility lookup textures
        const classData = new Uint8Array(256 * 4);
        this._classificationTex = new THREE.DataTexture(classData, 256, 1, THREE.RGBAFormat);
        this._classificationTex.needsUpdate = true;
        this._classificationTex.magFilter = THREE.NearestFilter;

        const lutData = new Uint8Array(256 * 4);
        this._discreteTex = new THREE.DataTexture(lutData, 256, 1, THREE.RGBAFormat);
        this._discreteTex.needsUpdate = true;
        this._discreteTex.magFilter = THREE.NearestFilter;

        const visiData = new Uint8Array(256);
        this._visibilityTex = new THREE.DataTexture(visiData, 256, 1, THREE.RedFormat);
        this._visibilityTex.needsUpdate = true;
        this._visibilityTex.magFilter = THREE.NearestFilter;

        // Expose via CommonMaterial-compatible accessors
        CommonMaterial.setDefineMapping(this, 'PNTS_MODE', PNTS_MODE);
        CommonMaterial.setDefineMapping(this, 'PNTS_SHAPE', PNTS_SHAPE);
        CommonMaterial.setDefineMapping(this, 'PNTS_SIZE_MODE', PNTS_SIZE_MODE);

        this.classificationScheme = classificationScheme;
        this.discreteScheme = discreteScheme;

        this.recomputeClassification();
        this.recomputeDiscreteTexture();
        this.recomputeVisibilityTexture();

        this.gradient = gradient;

        // Build TSL node graph
        this._buildNodeGraph();

        if (__DEBUG__) {
            this.defines.DEBUG = 1;
        }
    }

    _buildNodeGraph() {
        const modeN = this._modeNode;
        const pickingN = this._pickingNode;
        const gammaNode = this._gammaNode;
        const ambientBoostNode = this._ambientBoostNode;
        const intRange = this._intensityRangeNode;
        const elevRange = this._elevationRangeNode;
        const angleRange = this._angleRangeNode;

        const classTexNode = uniform(this._classificationTex);
        const discreteTexNode = uniform(this._discreteTex);
        const gradTexNode = uniform(this.gradientTexture);
        const visiTexNode = uniform(this._visibilityTex);

        // Point attributes
        const intensityAttr = attribute('intensity', 'float');
        const classificationAttr = attribute('classification', 'float');
        const pointSourceIDAttr = attribute('pointSourceID', 'float');
        const returnNumberAttr = attribute('returnNumber', 'float');
        const numberOfReturnsAttr = attribute('numberOfReturns', 'float');
        const scanAngleAttr = attribute('scanAngle', 'float');
        const uniqueIdAttr = attribute('unique_id', 'vec4');

        // -- Color computation (vertex stage) --
        const classUV = vec2(classificationAttr.div(255.0), 0.5);

        const colorComputeFn = Fn(() => {
            const c = vec4(1.0).toVar();

            If(pickingN, () => {
                c.assign(uniqueIdAttr);
            }).Else(() => {
                // CLASSIFICATION
                If(modeN.equal(int(PNTS_MODE.CLASSIFICATION)), () => {
                    c.assign(texture(classTexNode, classUV));
                // NORMAL
                }).ElseIf(modeN.equal(int(PNTS_MODE.NORMAL)), () => {
                    // normal attribute is not always present — use positionLocal as fallback
                    c.rgb.assign(abs(positionLocal).normalize());
                // COLOR
                }).ElseIf(modeN.equal(int(PNTS_MODE.COLOR)), () => {
                    // vertexColors are handled by PointsNodeMaterial automatically
                // RETURN_NUMBER
                }).ElseIf(modeN.equal(int(PNTS_MODE.RETURN_NUMBER)), () => {
                    c.assign(texture(discreteTexNode, vec2(returnNumberAttr.div(255.0), 0.5)));
                // RETURN_TYPE
                }).ElseIf(modeN.equal(int(PNTS_MODE.RETURN_TYPE)), () => {
                    const rtype = float(0.0).toVar();
                    If(returnNumberAttr.greaterThan(numberOfReturnsAttr), () => { rtype.assign(float(4.0)); })
                        .ElseIf(returnNumberAttr.equal(float(1.0)), () => {
                            If(numberOfReturnsAttr.equal(float(1.0)), () => { rtype.assign(float(0.0)); })
                                .Else(() => { rtype.assign(float(1.0)); });
                        }).Else(() => {
                            If(returnNumberAttr.equal(numberOfReturnsAttr), () => { rtype.assign(float(3.0)); })
                                .Else(() => { rtype.assign(float(2.0)); });
                        });
                    c.assign(texture(discreteTexNode, vec2(rtype.div(255.0), 0.5)));
                // RETURN_COUNT
                }).ElseIf(modeN.equal(int(PNTS_MODE.RETURN_COUNT)), () => {
                    c.assign(texture(discreteTexNode, vec2(numberOfReturnsAttr.div(255.0), 0.5)));
                // POINT_SOURCE_ID
                }).ElseIf(modeN.equal(int(PNTS_MODE.POINT_SOURCE_ID)), () => {
                    c.assign(texture(discreteTexNode, vec2(pointSourceIDAttr.mod(8.0).div(255.0), 0.5)));
                // SCAN_ANGLE
                }).ElseIf(modeN.equal(int(PNTS_MODE.SCAN_ANGLE)), () => {
                    const ai = angleRange.x.sub(scanAngleAttr).div(angleRange.x.sub(angleRange.y));
                    c.assign(texture(gradTexNode, vec2(ai, float(1.0).sub(ai))));
                // INTENSITY
                }).ElseIf(modeN.equal(int(PNTS_MODE.INTENSITY)), () => {
                    const ii = intensityAttr.sub(intRange.x).div(intRange.y.sub(intRange.x));
                    c.assign(texture(gradTexNode, vec2(ii, float(1.0).sub(ii))));
                // ELEVATION
                }).ElseIf(modeN.equal(int(PNTS_MODE.ELEVATION)), () => {
                    const zi = positionLocal.z.sub(elevRange.x).div(elevRange.y.sub(elevRange.x));
                    c.assign(texture(gradTexNode, vec2(zi, float(1.0).sub(zi))));
                });

                // Visibility mask
                const visiVal = texture(visiTexNode, classUV).r;
                If(visiVal.lessThan(float(0.5)), () => { c.a.assign(float(0.0)); });
            });

            return c;
        })();

        this.colorNode = colorComputeFn;

        // Shape-based discard is handled by PointsNodeMaterial sizeNode;
        // gl_PointCoord is not directly available in TSL for custom discard yet.

        // Gamma correction and ambient boost via opacityNode
        this.outputNode = Fn(() => {
            const col = this.colorNode.toVar();
            col.rgb.assign(pow(max(col.rgb, vec3(ambientBoostNode)), vec3(float(1.0).div(gammaNode))));
            return col;
        })();
    }

    /** Expose classificationTexture for backward compat */
    get classificationTexture() { return this._classificationTex; }
    /** Expose discreteTexture for backward compat */
    get discreteTexture() { return this._discreteTex; }
    /** Expose visibilityTexture for backward compat */
    get visibilityTexture() { return this._visibilityTex; }

    get uniforms() { return this._uniforms ??= {}; }

    /**
     * Copy the parameters from the passed material into this material.
     * @override
     * @param {THREE.PointsMaterial} source
     * @returns {this}
     */
    copy(source) {
        THREE.Material.prototype.copy.call(this, source);

        // Parameters of THREE.PointsMaterial
        if (source.color) { this.color.copy(source.color); }
        this.map = source.map;
        this.alphaMap = source.alphaMap;
        this.size = source.size;
        this.sizeAttenuation = source.sizeAttenuation;
        this.fog = source.fog;

        return this;
    }

    /** @returns {THREE.Color} */
    get color() {
        return this._colorUnif ??= new THREE.Color(1, 1, 1);
    }

    /** @param {THREE.Color} color */
    set color(color) {
        this.color.copy(color);
    }

    /** @returns {THREE.Texture | null} */
    get map() {
        return this._map ?? null;
    }

    /** @param {THREE.Texture | null} map */
    set map(map) {
        this._map = map;
    }

    /** @returns {THREE.Texture | null} */
    get alphaMap() {
        return this._alphaMap ?? null;
    }

    /** @param {THREE.Texture | null} map */
    set alphaMap(map) {
        this._alphaMap = map;
    }

    /** @returns {number} */
    get size() {
        return this._sizeNode?.value ?? 1;
    }

    /** @param {number} size */
    set size(size) {
        if (this._sizeNode) { this._sizeNode.value = size; }
    }

    /** @returns {boolean} */
    get sizeAttenuation() {
        return this._sizeMode !== PNTS_SIZE_MODE.VALUE;
    }

    /** @param {boolean} value */
    set sizeAttenuation(value) {
        this._sizeMode = value ?
            PNTS_SIZE_MODE.ATTENUATED :
            PNTS_SIZE_MODE.VALUE;
    }

    /** @returns {number} */
    get gamma() {
        return this._gammaNode?.value ?? 1.0;
    }

    /** @param {number} gamma */
    set gamma(gamma) {
        if (this._gammaNode) { this._gammaNode.value = gamma; }
    }

    /** @returns {number} */
    get ambientBoost() {
        return this._ambientBoostNode?.value ?? 0.0;
    }

    /** @param {number} ambientBoost */
    set ambientBoost(ambientBoost) {
        if (this._ambientBoostNode) { this._ambientBoostNode.value = ambientBoost; }
    }

    recomputeClassification() {
        recomputeTexture(this.classificationScheme, this.classificationTexture, 256);
        this.dispatchEvent({
            type: 'material_property_changed',
            target: this,
        });
    }

    recomputeDiscreteTexture() {
        recomputeTexture(this.discreteScheme, this.discreteTexture);
        this.dispatchEvent({
            type: 'material_property_changed',
            target: this,
        });
    }

    recomputeVisibilityTexture() {
        const tex = this.visibilityTexture;
        const scheme = this.classificationScheme;

        const data = tex.image.data;
        const width = tex.image.width;

        tex.userData.transparent = false;
        for (let i = 0; i < width; i++) {
            let visible;

            if (scheme[i]) {
                visible = scheme[i].visible;
            } else if (scheme.DEFAULT) {
                visible = scheme.DEFAULT.visible;
            } else {
                visible = true;
            }

            data[i] = visible ? 255 : 0;

            if (!visible) {
                tex.userData.transparent = true;
            }
        }
        tex.needsUpdate = true;

        this.dispatchEvent({
            type: 'material_property_changed',
            target: this,
        });
    }

    enablePicking(picking) {
        if (this._pickingNode) { this._pickingNode.value = picking; }
        this.blending = picking ? THREE.NoBlending : THREE.NormalBlending;
    }

    set gradient(value) {
        this.gradientTexture = generateGradientTexture(value);
    }
}

export default PointsMaterial;
