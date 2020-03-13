import * as THREE from 'three';
import { ELEVATION_MODES } from 'Renderer/LayeredMaterial';
import { checkNodeElevationTextureValidity, insertSignificantValuesFromParent } from 'Parser/XbilParser';
import CRS from 'Core/Geographic/Crs';
import { Node } from 'Core/NodeFeature';

export const EMPTY_TEXTURE_ZOOM = -1;
const emptyTexture = new THREE.Texture();
emptyTexture.extent = { zoom: EMPTY_TEXTURE_ZOOM };

const pitch = new THREE.Vector4(0, 0, 1, 1);

function defineLayerProperty(layer, property, initValue, defaultValue) {
    let _value = initValue !== undefined ? initValue : defaultValue;
    Object.defineProperty(layer, property, {
        get: () => _value,
        set: (value) => {
            if (_value !== value) {
                _value = value;
            }
        },
    });
}

class MaterialLayer extends Node {
    constructor(material, layer, extents) {
        super(extents, layer);
        this.extents = extents;
        this.id = layer.id; // TODO remove me
        this.crs = layer.parent.tileMatrixSets.indexOf(CRS.formatToTms(layer.projection));
        if (this.crs == -1) {
            console.error('Unknown crs:', layer.projection);
        }

        // Define color properties
        let _valueOpacity = layer.opacity !== undefined ? layer.opacity : true;
        Object.defineProperty(this, 'opacity', {
            get: () => _valueOpacity,
            set: (value) => {
                if (_valueOpacity !== value) {
                    if (value === 0 || _valueOpacity === 0) {
                        this.material.layersNeedUpdate = true;
                    }
                    _valueOpacity = value;
                }
            },
        });

        let _valueVisibility = layer.visible !== undefined ? layer.visible : true;
        Object.defineProperty(this, 'visible', {
            get: () => _valueVisibility,
            set: (value) => {
                if (_valueVisibility !== value) {
                    this.material.layersNeedUpdate = true;
                    _valueVisibility = value;
                }
            },
        });

        defineLayerProperty(this, 'effect', layer.fx, 0);

        const defaultEle = {
            bias: 0,
            scale: 1,
            mode: ELEVATION_MODES.DATA,
            zmin: 0,
            zmax: Infinity,
        };

        let scaleFactor = 1.0;

        // Define elevation properties
        if (layer.useRgbaTextureElevation) {
            defaultEle.mode = ELEVATION_MODES.RGBA;
            defaultEle.zmax = 5000;
            throw new Error('Restore this feature');
        } else if (layer.useColorTextureElevation) {
            scaleFactor = layer.colorTextureElevationMaxZ - layer.colorTextureElevationMinZ;
            defaultEle.mode = ELEVATION_MODES.COLOR;
            defaultEle.bias = layer.colorTextureElevationMinZ;
        }

        defineLayerProperty(this, 'bias', layer.bias, defaultEle.bias);
        defineLayerProperty(this, 'scale', layer.scale * scaleFactor, defaultEle.scale * scaleFactor);
        defineLayerProperty(this, 'mode', layer.mode, defaultEle.mode);
        defineLayerProperty(this, 'zmin', layer.zmin, defaultEle.zmin);
        defineLayerProperty(this, 'zmax', layer.zmax, defaultEle.zmax);

        this.textures = new Array(this.extents.length).fill(emptyTexture);
        this.offsetScales = new Array(this.extents.length).fill().map(() => new THREE.Vector4());
        this.material = material;

        // move to Layer, All parameters are constant
        this.opt.buildExtent = true;
        this.opt.crsIn = this.source.projection;
        this.opt.crsOut = this.layer.projection;
        // Sprites: Use with ColorLayer move to color layer
        this.opt.sprites = this.layer.sprites || this.source.sprites;
        // move default value to layer
        this.opt.symbolToCircle = this.layer.symbolToCircle || false;
    }

    initFromParent(parent) {
        if (parent && parent.level > this.level) {
            let index = 0;
            for (const c of this.extents) {
                for (const texture of parent.textures) {
                    if (c.isInside(texture.extent)) {
                        this.setTexture(index++, texture);
                        break;
                    }
                }
            }

            if (__DEBUG__) {
                if (index != this.extents.length) {
                    console.error(`non-coherent result ${index} vs ${this.extents.length}.`, this.extents);
                }
            }
        }
    }

    replaceNoDataValueFromParent(parent, nodatavalue) {
        const dataElevation = this.textures[0].image.data;
        const parentTexture = parent && parent.textures[0];
        if (dataElevation && parentTexture && parentTexture.extent.zoom > -1 && !checkNodeElevationTextureValidity(dataElevation, nodatavalue)) {
            const extent = this.textures[0].extent;
            extent.offsetToParent(parentTexture.extent, pitch);
            insertSignificantValuesFromParent(dataElevation, parentTexture.image.data, nodatavalue, pitch);
        }
    }

    get level() {
        return this.textures.some(t => t.extent.zoom == EMPTY_TEXTURE_ZOOM) ?
            EMPTY_TEXTURE_ZOOM : this.textures[0].extent.zoom;
    }

    dispose() {
        // TODO: WARNING  verify if textures to dispose aren't attached with ancestor
        for (var i = this.textures.length - 1; i >= 0; i--) {
            this.textures[i].dispose();
            this.textures[i] = emptyTexture;
        }
    }

    setTexture(index, texture) {
        this.textures[index].dispose();
        this.textures[index] = texture;
        this.extents[index].offsetToParent(texture.extent, this.offsetScales[index]);
        this.material.layersNeedUpdate = true;
    }

    // maybe force zoom to load in MaterialLayer properties
    load() {
        const p = [];
        for (let i = 0, max = this.extents.length; i < max; i++) {
            const extent = this.extents[i];
            if (this.source.extentInsideLimit(extent)) {
                p.push(this.source.fetchFromExtent(extent)
                    .then(f => this.source.parser(f, this.opt))
                    .then(p => this.layer.convert(p, extent, this.layer))
                    .then(texture => this.setTexture(i, texture)));
            }
        }

        return Promise.all(p);
    }
}

export default MaterialLayer;
