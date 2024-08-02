import * as THREE from 'three';
import TileVS from 'Renderer/Shader/TileVS.glsl';
import TileFS from 'Renderer/Shader/TileFS.glsl';
import ShaderUtils from 'Renderer/Shader/ShaderUtils';
import Capabilities from 'Core/System/Capabilities';
import RenderMode from 'Renderer/RenderMode';
import CommonMaterial from 'Renderer/CommonMaterial';

const identityOffsetScale = new THREE.Vector4(0.0, 0.0, 1.0, 1.0);
const defaultTex = new THREE.Texture();

// from three.js packDepthToRGBA
const UnpackDownscale = 255 / 256; // 0..1 -> fraction (excluding 1)
const bitSh = new THREE.Vector4(
    UnpackDownscale / (256.0 * 256.0 * 256.0),
    UnpackDownscale / (256.0 * 256.0),
    UnpackDownscale / 256.0,
    UnpackDownscale);

export function unpack1K(color, factor) {
    return factor ? bitSh.dot(color) * factor : bitSh.dot(color);
}

// Max sampler color count to LayeredMaterial
// Because there's a statement limitation to unroll, in getColorAtIdUv method
const maxSamplersColorCount = 15;
const samplersElevationCount = 1;

export function getMaxColorSamplerUnitsCount() {
    const maxSamplerUnitsCount = Capabilities.getMaxTextureUnitsCount();
    return Math.min(maxSamplerUnitsCount - samplersElevationCount, maxSamplersColorCount);
}

export const colorLayerEffects = {
    noEffect: 0,
    removeLightColor: 1,
    removeWhiteColor: 2,
    customEffect: 3,
};

function updateLayersUniforms(uniforms, olayers, max) {
    // prepare convenient access to elevation or color uniforms
    const textures = uniforms.textures.value;
    const offsetScales = uniforms.offsetScales.value;
    const textureOffset = uniforms.textureOffset.value;
    const textureCount = uniforms.textureCount || { value: 0 };

    // flatten the 2d array [i,j] -> layers[_layerIds[i]].textures[j]
    let count = 0;
    let id = 0;
    for (const layer of olayers) {
        // textureOffset property is added to RasterTile
        textureOffset[id] = count;

        for (let i = 0, il = layer.textures.length; i < il; ++i, ++count) {
            if (count < max) {
                offsetScales[count] = layer.offsetScales[i];
                textures[count] = layer.textures[i];
            }
        }
        id++;
    }
    if (count > max) {
        console.warn(`LayeredMaterial: Not enough texture units (${max} < ${count}), excess textures have been discarded.`);
    }
    textureCount.value = count;

    // WebGL 2.0 doesn't support the undefined uniforms.
    // So the undefined uniforms are defined by default value.
    for (let i = count; i < textures.length; i++) {
        textures[i] = defaultTex;
        offsetScales[i] = identityOffsetScale;
    }
}

export const ELEVATION_MODES = {
    RGBA: 0,
    COLOR: 1,
    DATA: 2,
};

let nbSamplers;
const fragmentShader = [];
class LayeredMaterial extends THREE.ShaderMaterial {
    #_visible = true;
    constructor(options = {}, crsCount) {
        super(options);

        nbSamplers = nbSamplers || [samplersElevationCount, getMaxColorSamplerUnitsCount()];

        this.defines.NUM_VS_TEXTURES = nbSamplers[0];
        this.defines.NUM_FS_TEXTURES = nbSamplers[1];
        // TODO: We do not use the fog from the scene, is this a desired
        // behavior?
        this.defines.USE_FOG = 1;
        this.defines.NUM_CRS = crsCount;
        this.defines.COUNT = 0;

        CommonMaterial.setDefineMapping(this, 'ELEVATION', ELEVATION_MODES);
        CommonMaterial.setDefineMapping(this, 'MODE', RenderMode.MODES);
        CommonMaterial.setDefineProperty(this, 'mode', 'MODE', RenderMode.MODES.FINAL);


        this.vertexShader = TileVS;
        // three loop unrolling of ShaderMaterial only supports integer bounds,
        // see https://github.com/mrdoob/three.js/issues/28020
        fragmentShader[crsCount] = fragmentShader[crsCount] || ShaderUtils.unrollLoops(TileFS, this.defines);
        this.fragmentShader = fragmentShader[crsCount];

        if (__DEBUG__) {
            this.defines.DEBUG = 1;
            CommonMaterial.setUniformProperty(this, 'showOutline', true);
        }

        CommonMaterial.setUniformProperty(this, 'overlayAlpha', 0);
        CommonMaterial.setUniformProperty(this, 'objectId', 0);
        CommonMaterial.setUniformProperty(this, 'geoidHeight', 0.0);

        // LayeredMaterialLayers
        this.layers = [];
        this.elevationLayerIds = [];
        this.colorLayerIds = [];

        // elevation layer uniforms, to be updated using updateUniforms()
        // this.uniforms.elevationLayers = new THREE.Uniform(new Array(nbSamplers[0]).fill(defaultStructLayer));
        this.uniforms.elevationTextures = new THREE.Uniform(new Array(nbSamplers[0]).fill(defaultTex));
        this.uniforms.elevationOffsetScales = new THREE.Uniform(new Array(nbSamplers[0]).fill(identityOffsetScale));
        this.uniforms.elevationTextureCount = new THREE.Uniform(0);
        this.uniforms.elevationTextureOffset = new THREE.Uniform(new Array(nbSamplers[0]).fill(0));

        // color layer uniforms, to be updated using updateUniforms()
        this.uniforms.colorTextures = new THREE.Uniform(new Array(nbSamplers[1]).fill(defaultTex));
        this.uniforms.colorOffsetScales = new THREE.Uniform(new Array(nbSamplers[1]).fill(identityOffsetScale));
        this.uniforms.colorTextureOffset = new THREE.Uniform(new Array(16).fill(0));

        this.uniforms.layerCount = new THREE.Uniform(0);

        // can't do an ES6 setter/getter here
        Object.defineProperty(this, 'visible', {
            // Knowing the visibility of a `LayeredMaterial` is useful. For example in a
            // `GlobeView`, if you zoom in, "parent" tiles seems hidden; in fact, there
            // are not, it is only their material (so `LayeredMaterial`) that is set to
            // not visible.

            // Adding an event when changing this property can be useful to hide others
            // things, like in `TileDebug`, or in later PR to come (#1303 for example).
            //
            // TODO : verify if there is a better mechanism to avoid this event
            get() { return this.#_visible; },
            set(v) {
                if (this.#_visible != v) {
                    this.#_visible = v;
                    this.dispatchEvent({ type: v ? 'shown' : 'hidden' });
                }
            },
        });
    }

    getUniformByType(type) {
        return {
            textures: this.uniforms[`${type}Textures`],
            offsetScales: this.uniforms[`${type}OffsetScales`],
            textureOffset: this.uniforms[`${type}TextureOffset`],
            textureCount: this.uniforms[`${type}TextureCount`],
        };
    }

    updateLayersUniforms() {
        const colorlayers = this.layers.filter(l => this.colorLayerIds.includes(l.id) && l.visible && l.opacity > 0);
        colorlayers.sort((a, b) => this.colorLayerIds.indexOf(a.id) - this.colorLayerIds.indexOf(b.id));
        updateLayersUniforms(this.getUniformByType('color'), colorlayers, this.defines.NUM_FS_TEXTURES);

        if (this.elevationLayerIds.some(id => this.getLayer(id)) ||
            (this.uniforms.elevationTextureCount.value && !this.elevationLayerIds.length)) {
            const elevationLayer = this.getElevationLayer() ? [this.getElevationLayer()] : [];
            updateLayersUniforms(this.getUniformByType('elevation'), elevationLayer, this.defines.NUM_VS_TEXTURES);
        }
        this.layersNeedUpdate = false;
    }

    dispose() {
        this.dispatchEvent({ type: 'dispose' });
        this.layers.forEach(l => l.dispose(true));
        this.layers.length = 0;
        this.layersNeedUpdate = true;
    }

    // TODO: rename to setColorLayerIds and add setElevationLayerIds ?
    setSequence(sequenceLayer) {
        this.colorLayerIds = sequenceLayer;
        this.layersNeedUpdate = true;
    }

    setSequenceElevation(layerId) {
        this.elevationLayerIds[0] = layerId;
        this.layersNeedUpdate = true;
    }

    removeLayer(layerId) {
        const index = this.layers.findIndex(l => l.id === layerId);
        if (index > -1) {
            this.layers[index].dispose();
            this.layers.splice(index, 1);
            const idSeq = this.colorLayerIds.indexOf(layerId);
            if (idSeq > -1) {
                this.colorLayerIds.splice(idSeq, 1);
            } else {
                this.elevationLayerIds = [];
            }
        }
    }

    addLayer(rasterNode) {
        if (rasterNode.layer.id in this.layers) {
            console.warn('The "{layer.id}" layer was already present in the material, overwritting.');
        }
        this.layers.push(rasterNode);
        if (rasterNode.layer.isColorLayer) {
            this.uniforms.layerCount.value++;
        }
    }

    getLayer(id) {
        return this.layers.find(l => l.id === id);
    }

    getLayers(ids) {
        return this.layers.filter(l => ids.includes(l.id));
    }

    getElevationLayer() {
        return this.layers.find(l => l.id === this.elevationLayerIds[0]);
    }

    setElevationScale(scale) {
        if (this.elevationLayerIds.length) {
            this.getElevationLayer().scale = scale;
        }
    }
}

export default LayeredMaterial;
