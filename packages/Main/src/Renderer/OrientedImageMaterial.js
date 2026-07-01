import * as THREE from 'three';
import Capabilities from 'Core/System/Capabilities';
import { NodeMaterial } from 'three/webgpu';
import {
    Fn, If,
    uniform, uniformArray, texture, varying,
    vec2, vec3, vec4, float, int,
    mix, clamp, min, max, pow, length, dot, atan2,
    select,
    positionLocal, normalView, modelViewMatrix,
} from 'three/tsl';

const ndcToTextureMatrix = new THREE.Matrix4(
    1, 0, 0, 1,
    0, 1, 0, 1,
    0, 0, 2, 0,
    0, 0, 0, 2);

const noMask = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1, THREE.RGBAFormat, THREE.UnsignedByteType);
noMask.needsUpdate = true;
const noTexture = new THREE.DataTexture(new Uint8Array([0, 0, 0, 0]), 1, 1, THREE.RGBAFormat, THREE.UnsignedByteType);
noTexture.needsUpdate = true;

/**
 * OrientedImageMaterial is a custom shader material used to do projective texture mapping.<br/>
 *
 * This Material is designed to project many textures simultaneously.
 * Each projected texture setting is stored as an {@link OrientedImageCamera}.<br/>
 * <br/>
 * All cameras settings, like distorsion, can be specified in a configuration file.
 * See [CameraCalibrationParser]{@link module:CameraCalibrationParser.parse}
 * used to parse a configuration file and create an array of camera.<br/>
 * <br/>
 * The current implementation supports the following distortion models : <br/>
 *  - no distortion (polynom==vec3(0),l1l2==vec2(0))<br/>
 *  - radial distortion (polynom!=vec3(0),l1l2==vec2(0)) (see <b>15.2.2 Radial Model</b> in [MicMac doc](https://github.com/micmacIGN/Documentation/blob/master/DocMicMac.pdf)) </br>
 *  - equilinear fish eye distortion (polynom!=vec3(0),l1l2 != vec2(0)) (see <b>15.3.4 Fish eye models</b> in [MicMac doc](https://github.com/micmacIGN/Documentation/blob/master/DocMicMac.pdf)) </br>
 * (Note: radial decentric parameters P1 are P2 not supported and assumed to be 0).<br/>
 * <br/>
 * To get a more comprehensive support of camera Micmac models, you can consider using [three-photogrammetric-camera]{@link https://github.com/mbredif/three-photogrammetric-camera} instead.
 */
class OrientedImageMaterial extends NodeMaterial {
    /**
     * @param { OrientedImageCamera[]} cameras - Array of {@link OrientedImageCamera}. Each camera will project a texture.
     * [CameraCalibrationParser]{@link module:CameraCalibrationParser.parse} can used to create this array of camera from a configuration file.
     * @param {object} [options={}] - Object with one or more properties defining the material's appearance.
     * Any property of the material (including any property inherited from
     * [THREE.Material]{@link https://threejs.org/docs/#api/en/materials/Material} and
     * [THREE.ShaderMaterial]{@link https://threejs.org/docs/#api/en/materials/ShaderMaterial}) can be passed in here.
     * @param {number} [options.side=THREE.DoubleSide] - We override default
     * [THREE.Material.side]{@link https://threejs.org/docs/#api/en/materials/Material.side} from FrontSide to DoubleSide.
     * @param {boolean} [options.transparent=true] - We override default
     * [THREE.Material.transparent]{@link https://threejs.org/docs/#api/en/materials/Material.transparent} from false to true.
     * @param {number} [options.opacity=0.1] - We override default
     * [THREE.Material.opacity]{@link https://threejs.org/docs/#api/en/materials/Material.opacity} from 1 to 0.1.
     * @param {number} [options.alphaBorder=20] - Part of the texture that is blended, when texture crosses each other.
     * For example, 10 means a border as large as 1 / 10 of the size of the texture is used to blend colors.
     * @param {number} [options.debugAlphaBorder=0] - Set this option to 1 to see influence of alphaBorder option.
     */
    constructor(cameras, options = {}) {
        super();

        if (__DEBUG__) { this.name = 'OrientedImageMaterial'; }

        this.side = options.side ?? THREE.DoubleSide;
        this.transparent = options.transparent ?? true;
        this.opacity = options.opacity ?? 1;

        const count = Math.min(
            options.OrientedImagesCount ?? cameras.length,
            Capabilities.getMaxTextureUnitsCount() - 1,
        );

        if (count < cameras.length) {
            console.warn(`OrientedImageMaterial: GPU limit reached, using only first ${count} cameras.`);
        }

        this._count = count;
        this.cameras = cameras;

        const useDistortion = cameras.some(cam => cam.distortion.pps !== null);
        const useBaseMaterial = !!options.useBaseMaterial;

        this.alphaBorder = options.alphaBorder ?? 20;
        const debugAlphaBorder = options.debugAlphaBorder ?? 0;

        // Build per-camera arrays (texture + mask + matrix + distortion params)
        const textures = [];
        const masks = [];
        const textureMatrices = [];
        const distortionSizes = [];
        const distortionPps = [];
        const distortionPolynom = [];
        const distortionL1l2 = [];

        this.group = new THREE.Group();
        for (let i = 0; i < count; ++i) {
            textures[i] = noTexture;
            masks[i] = noMask;
            textureMatrices[i] = new THREE.Matrix4();
            const d = cameras[i].distortion;
            distortionSizes[i] = d.size ?? new THREE.Vector2(1, 1);
            distortionPps[i] = d.pps ?? new THREE.Vector2(0, 0);
            distortionPolynom[i] = d.polynom ?? new THREE.Vector4(0, 0, 0, 1e9);
            distortionL1l2[i] = d.l1l2 ?? new THREE.Vector3(0, 0, 1);
            cameras[i].needsUpdate = true;
            this.group.add(cameras[i]);
        }

        // TSL uniform nodes
        this._texNode = textures.map(t => uniform(t));
        this._maskNode = masks.map(m => uniform(m));
        this._matNode = textureMatrices.map(m => uniform(m));
        this._distSizeNode = uniformArray(distortionSizes, 'vec2');
        this._distPpsNode = uniformArray(distortionPps, 'vec2');
        this._distPolynomNode = uniformArray(distortionPolynom, 'vec4');
        this._distL1l2Node = uniformArray(distortionL1l2, 'vec3');
        this._alphaBorderNode = uniform(this.alphaBorder, 'float');
        this._opacityNode = uniform(this.opacity, 'float');
        this._boostLightNode = uniform(false, 'bool');
        this._noProjectiveOpacityNode = uniform(0.75, 'float');
        this._lightDirectionNode = uniform(new THREE.Vector3(0.5, 0.5, -0.5));
        this._ambientColorNode = uniform(new THREE.Color(0.1, 0.1, 0.1));

        this._buildNodeGraph(count, useDistortion, useBaseMaterial, debugAlphaBorder);
    }

    _buildNodeGraph(count, useDistortion, useBaseMaterial, debugAlphaBorder) {
        const alphaBorder = this._alphaBorderNode;
        const opacityN = this._opacityNode;
        const boostLight = this._boostLightNode;
        const lightDir = this._lightDirectionNode;
        const ambientColor = this._ambientColorNode;
        const noProjectiveOpacity = this._noProjectiveOpacityNode;

        // Compute the projective coords for each camera in the vertex shader
        // and pass as varyings (vec4 per camera)
        const projCoords = [];
        for (let i = 0; i < count; i++) {
            const mat = this._matNode[i];
            // textureMatrix * viewCamera.matrixWorld * localPosition
            const worldPos = modelViewMatrix.inverse().mul(vec4(positionLocal, 1.0));
            const coord = mat.mul(worldPos);
            projCoords.push(varying(coord, `vProjCoord_${i}`));
        }

        // Fragment: accumulate color from each projected texture
        const colorFn = Fn(() => {
            let color;
            if (useBaseMaterial) {
                const nDotL = max(float(0.1), dot(normalView, lightDir.normalize()));
                color = vec4(ambientColor.add(nDotL), float(0.0)).toVar();
            } else {
                color = vec4(0.0).toVar();
            }

            // Blend cameras in reverse order (matching original shader)
            for (let i = count - 1; i >= 0; i--) {
                const coords = projCoords[i];
                const texN = this._texNode[i];
                const maskN = this._maskNode[i];
                const distSize = this._distSizeNode.element(int(i));
                const pps = this._distPpsNode.element(int(i));
                const polynom = this._distPolynomNode.element(int(i));
                const l1l2 = this._distL1l2Node.element(int(i));

                const p = coords.xyz.div(coords.w).toVar();

                // Only process if p.z is inside the frustum (|p.z| < 1)
                If(p.z.mul(p.z).lessThan(float(1.0)), () => {
                    let pxy = p.xy.toVar();

                    if (useDistortion) {
                        // Apply distortion
                        pxy.assign(pxy.mul(distSize));
                        // Check if l1l2 is (0,0) for radial vs fish-eye
                        If(l1l2.x.equal(float(0.0)).and(l1l2.y.equal(float(0.0))), () => {
                            // Radial model
                            const v = pxy.sub(pps);
                            const v2 = dot(v, v);
                            If(v2.greaterThan(polynom.w), () => {
                                pxy.assign(vec2(-1.0));
                            }).Else(() => {
                                pxy.addAssign(v.mul(v2.mul(
                                    polynom.x.add(v2.mul(polynom.y.add(v2.mul(polynom.z)))),
                                )));
                            });
                        }).Else(() => {
                            // Fish-eye (equilinear) model
                            const AB = pxy.sub(pps).div(l1l2.z);
                            const R = length(AB);
                            const lambda = atan2(R, float(1.0)).div(R);
                            const ab = AB.mul(lambda).toVar();
                            const rho2 = dot(ab, ab);
                            const r357 = float(1.0).add(rho2.mul(
                                polynom.x.add(rho2.mul(polynom.y.add(rho2.mul(polynom.z)))),
                            ));
                            pxy.assign(pps.add(l1l2.z.mul(
                                ab.mul(r357).add(vec2(dot(l1l2.xy, ab), l1l2.y.mul(ab.x))),
                            )));
                        });
                        pxy.assign(pxy.div(distSize));
                    }

                    // Alpha border fade
                    const d2 = clamp(alphaBorder.mul(min(pxy, vec2(1.0).sub(pxy))), vec2(0.0), vec2(1.0));
                    const dMin = min(d2.x, d2.y);
                    const maskVal = texture(maskN, pxy).r;
                    const d = dMin.mul(maskVal);

                    If(d.greaterThan(float(0.0)), () => {
                        if (debugAlphaBorder) {
                            const r = texture(texN, pxy).rgb;
                            const blended = vec4(r.x.mul(d), r.y, r.z, float(1.0));
                            if (useBaseMaterial) {
                                const newA = min(float(1.0), blended.a.add(color.a));
                                color.rgb.assign(blended.a.equal(float(1.0))
                                    ? blended.rgb
                                    : mix(color, blended, blended.a).rgb);
                                color.a.assign(newA);
                            } else {
                                color.rgb.addAssign(blended.rgb.mul(blended.a));
                                color.a.addAssign(blended.a);
                            }
                        } else {
                            const col = texture(texN, pxy).toVar();
                            col.a.mulAssign(d);
                            const finalCol = select(boostLight, vec4(pow(col.rgb, vec3(0.5)), col.a), col);
                            if (useBaseMaterial) {
                                const newA = min(float(1.0), finalCol.a.add(color.a));
                                color.rgb.assign(finalCol.a.equal(float(1.0))
                                    ? finalCol.rgb
                                    : mix(color, finalCol, finalCol.a).rgb);
                                color.a.assign(newA);
                            } else {
                                color.rgb.addAssign(finalCol.rgb.mul(finalCol.a));
                                color.a.addAssign(finalCol.a);
                            }
                        }
                    });
                });
            }

            if (useBaseMaterial) {
                const finalAlpha = select(color.a.lessThan(float(1.0)), max(noProjectiveOpacity, color.a), float(1.0));
                return vec4(color.rgb, finalAlpha.mul(opacityN));
            } else {
                return vec4(color.rgb.div(max(color.a, float(0.0001))), opacityN);
            }
        })();

        this.outputNode = colorFn;
    }

    /**
     * Set new textures and new position/orientation of the camera set.
     * @param {THREE.Texture} textures - Array of [THREE.Texture]{@link https://threejs.org/docs/#api/en/textures/Texture}.
     * @param {object} feature - New position / orientation of the set of cameras
     * @param {THREE.Vector3} feature.position - New position.
     * @param {THREE.Quaternion} feature.quaternion - New orientation.
     * @param {Array} camerasNames - camera names of panoramic feature
     */
    setTextures(textures, feature, camerasNames) {
        if (!textures) { return; }
        this.group.position.copy(feature.position);
        this.group.quaternion.copy(feature.quaternion);

        for (let i = 0; i < textures.length && i < this._count; ++i) {
            // Dispose old texture (if not noTexture)
            if (this._texNode[i].value !== noTexture) {
                this._texNode[i].value.dispose();
            }
            this._texNode[i].value = textures[i];

            if (camerasNames) {
                const currentCamera = this.group.children[i];
                if (camerasNames[i] != currentCamera.name) {
                    const camera = this.cameras.find(cam => cam.name === camerasNames[i]);
                    this._maskNode[i].value = camera.maskTexture || noMask;
                    this._maskNode[i].value.needsUpdate = true;
                    const d = camera.distortion;
                    this._distSizeNode.value[i] = d.size ?? new THREE.Vector2(1, 1);
                    this._distPpsNode.value[i] = d.pps ?? new THREE.Vector2(0, 0);
                    this._distPolynomNode.value[i] = d.polynom ?? new THREE.Vector4(0, 0, 0, 1e9);
                    this._distL1l2Node.value[i] = d.l1l2 ?? new THREE.Vector3(0, 0, 1);
                    this.group.children[i] = camera;
                    camera.parent = this.group;
                }
            }
            this.group.children[i].needsUpdate = true;
        }
        this.group.updateMatrixWorld(true);
    }

    updateUniforms(viewCamera) {
        for (let i = 0; i < this.group.children.length; ++i) {
            const camera = this.group.children[i];
            if (camera.needsUpdate) {
                camera.textureMatrixWorldInverse.multiplyMatrices(ndcToTextureMatrix, camera.projectionMatrix);
                camera.textureMatrixWorldInverse.multiply(camera.matrixWorldInverse);
                camera.needsUpdate = false;
            }
            this._matNode[i].value.multiplyMatrices(camera.textureMatrixWorldInverse, viewCamera.matrixWorld);
        }
    }
}

export default OrientedImageMaterial;
