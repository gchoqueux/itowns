import * as THREE from 'three';
import { ELEVATION_MODES } from 'Renderer/LayeredMaterial';
import { computeMinMaxElevation, checkNodeElevationTextureValidity, insertSignificantValuesFromParent } from 'Parser/XbilParser';
import CRS from 'Core/Geographic/Crs';
import { Node } from 'Core/NodeFeature';

const SIZE_TEXTURE_TILE = 256;

export const EMPTY_TEXTURE_ZOOM = -1;

const emptyTexture = new THREE.Texture();
emptyTexture.extent = { zoom: EMPTY_TEXTURE_ZOOM };

const pitch = new THREE.Vector4(0, 0, 1, 1);

class RasterNodeLayer extends Node {
    constructor(material, layer, size) {
        super(layer);
        // move to mesh
        this.crs = layer.parent.tileMatrixSets.indexOf(CRS.formatToTms(layer.projection));
        if (this.crs == -1) {
            console.error('Unknown crs:', layer.projection);
        }

        this._handlerCBEvent = () => { this.material.layersNeedUpdate = true; };
        layer.addEventListener('visible-property-changed', this._handlerCBEvent);

        this.textures = new Array(size).fill(emptyTexture);
        this.offsetScales = new Array(size).fill().map(() => new THREE.Vector4());
        this.material = material;
    }

    get opacity() {
        return this.layer.opacity;
    }

    get visible() {
        return this.layer.visible;
    }

    dispose() {
        this.layer.removeEventListener('visible-property-changed', this._handlerCBEvent);
        // TODO: WARNING  verify if textures to dispose aren't attached with ancestor
        for (var i = this.textures.length - 1; i >= 0; i--) {
            this.textures[i].dispose();
            this.textures[i] = emptyTexture;
        }
    }

    // FIX ME: no true level
    get level() {
        return this.textures.some(t => t.extent.zoom == EMPTY_TEXTURE_ZOOM) ?
            EMPTY_TEXTURE_ZOOM : this.textures[0].extent.zoom;
    }

    setTexture(index, texture) {
        this.textures[index].dispose();
        this.textures[index] = texture;
        this.material.layersNeedUpdate = true;
        this.dispatchEvent({ type: 'texture' });
        return texture;
    }

    afterFetch(f) { return f; }
}

class RasterColorNodeLayer extends RasterNodeLayer {
    constructor(material, layer, extents) {
        super(material, layer, extents.length);
        // Lors de la creation on pourrait verifier si les extents existes dans la sources....
        this.extents = extents;
        this.effect = layer.fx;
        this.maxZoom = extents[0].zoom;
        this.loadZoom = this.maxZoom;
    }

    init(parent) {
        if (parent && parent.level > this.level) {
            let index = 0;
            for (const extent of this.extents) {
                for (const texture of parent.textures) {
                    if (extent.isInside(texture.extent)) {
                        extent.offsetToParent(texture.extent, this.offsetScales[index]);
                        this.setTexture(index, texture);
                        break;
                    }
                }
                index++;
            }

            if (__DEBUG__) {
                if (index != this.extents.length) {
                    console.error(`non-coherent result ${index} vs ${this.extents.length}.`, this.extents);
                }
            }
        }
    }
    load() {
        const p = [];
        for (let i = 0, max = this.extents.length; i < max; i++) {
            const extent = this.extents[i].tiledExtentParent(this.loadZoom);
            if (this.source.extentInsideLimit(extent)) {
                let cacheTexture = this.layer.getDataFromCache(extent);
                if (!cacheTexture) {
                    cacheTexture = this.source.fetchFromExtent(extent)
                        .then(f => this.afterFetch(f))
                        .then(f => this.source.parser(f, this.layer.sourceToLayer))
                        .then(p => this.layer.convert(p, extent, this.layer));
                    this.layer.setDataToCache(cacheTexture, extent);
                }
                if (cacheTexture) {
                    cacheTexture.then((texture) => {
                        this.extents[i].offsetToParent(texture.extent, this.offsetScales[i]);
                        return this.setTexture(i, texture);
                    });
                    p.push(cacheTexture);
                }
            }
        }
        return Promise.all(p);
    }
}

export class RasterElevationNodeLayer extends RasterColorNodeLayer {
    constructor(material, layer, extents, parent) {
        super(material, layer, extents, parent);
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

        this.bias = layer.bias || defaultEle.bias;
        this.scale = (layer.scale || defaultEle.scale) * scaleFactor;
        this.mode = layer.mode || defaultEle.mode;
        this.zmin = layer.zmin || defaultEle.zmin;
        this.zmax = layer.zmax || defaultEle.zmax;
    }

    // move to onFetch of source!!
    // Or in convert texture because it's only use to fill
    afterFetch(f) {
        // replaceNoDataValueFromParent
        if (this.layer.noDataValue != undefined &&
            f.image.data &&
            this.textures[0].extent.zoom > EMPTY_TEXTURE_ZOOM &&
            !checkNodeElevationTextureValidity(f.image.data, this.layer.noDataValue)) {
            f.extent.offsetToParent(this.textures[0].extent, pitch);
            insertSignificantValuesFromParent(f.image.data, this.textures[0].image.data, this.layer.noDataValue, pitch);
        }
        return f;
    }
    getMinMaxElevation() {
        // If the texture resolution has a poor precision for this node, we don't
        // extract min-max from the texture (too few information), we instead chose
        // to use parent's min-max.
        if (this.layer.useColorTextureElevation) {
            return {
                min: this.layer.colorTextureElevationMinZ,
                max: this.layer.colorTextureElevationMaxZ,
            };
        } else if (this.textures[0].image && this.textures[0].image.data) {
            const pitch = this.offsetScales[0];
            const { min, max } = computeMinMaxElevation(this.textures[0].image.data,
                SIZE_TEXTURE_TILE,
                SIZE_TEXTURE_TILE,
                pitch);
            return {
                min: !min ? 0 : min,
                max: !max ? 0 : max,
            };
        }
        return { min: 0, max: 0 };
    }
}

export default RasterColorNodeLayer;
