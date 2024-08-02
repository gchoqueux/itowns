import * as THREE from 'three';
import Layer from 'Layer/Layer';
import Picking from 'Core/Picking';
import { CACHE_POLICIES } from 'Core/Scheduler/Cache';
import ObjectRemovalHelper from 'Process/ObjectRemovalHelper';
import { UniformsGroup, Uniform, Color } from 'three';
import Capabilities from 'Core/System/Capabilities';
import CRS from 'Core/Geographic/Crs';
import { ELEVATION_MODES } from 'Renderer/LayeredMaterial';

export const colorLayerEffects = {
    noEffect: 0,
    removeLightColor: 1,
    removeWhiteColor: 2,
    customEffect: 3,
};

const defaultStructLayer = {
    //  0
    bias: 0.0,
    zmin: -Infinity,
    zmax: Infinity,
    scale: 1.0,
    //  1
    mode: ELEVATION_MODES.DATA,
    opacity: 1.0,
    crs: 0,
    effect_parameter: 0,
    //  2
    effect_type: colorLayerEffects.noEffect,
    transparent: false,
};

const keys = Object.keys(defaultStructLayer);

class uniformRasterLayer extends THREE.Matrix4 {
    constructor(layer = defaultStructLayer) {
        super();
        this.set(layer);
    }
    set(layer, tileMatrixSets) {
        keys.forEach((key, id) => {
            const uniform = this.elements;
            if (key == 'crs') {
                const crs = tileMatrixSets ? tileMatrixSets.indexOf(CRS.formatToTms(layer.crs)) : 0;
                Object.defineProperty(uniform, `${id}`, {
                    get() {
                        return crs;
                    },
                });
            } else if (key == 'transparent') {
                Object.defineProperty(uniform, `${id}`, {
                    get() {
                        return layer[key] == true ? 1 : 0;
                    },
                });
            } else if (key == 'scale') {
                Object.defineProperty(uniform, `${id}`, {
                    get() {
                        return layer.scale * layer.scaleFactor;
                    },
                });
            } else {
                const l = layer[key] ? layer : defaultStructLayer;
                Object.defineProperty(uniform, `${id}`, {
                    get() {
                        return l[key];
                    },
                });
            }
        });
    }
}


// Max sampler color count to LayeredMaterial
// Because there's a statement limitation to unroll, in getColorAtIdUv method
const maxSamplersColorCount = 15;
const samplersElevationCount = 1;

function getMaxColorSamplerUnitsCount() {
    const maxSamplerUnitsCount = Capabilities.getMaxTextureUnitsCount();
    return Math.min(maxSamplerUnitsCount - samplersElevationCount, maxSamplersColorCount);
}

let nbSamplers;

/**
 * Fires when the opacity of the layer has changed.
 * @event GeometryLayer#opacity-property-changed
 */

/**
 * @property {boolean} isGeometryLayer - Used to checkout whether this layer is
 * a GeometryLayer. Default is true. You should not change this, as it is used
 * internally for optimisation.
 * @property {number} [zoom.max=Infinity] - this is the maximum zoom beyond which it'll be hidden.
 * The `max` is constant and the value is `Infinity` because there's no maximum display level after which it is hidden.
 * This property is used only if the layer is attached to [TiledGeometryLayer]{@link TiledGeometryLayer}.
 * @property {number} [zoom.min=0] - this is the minimum zoom from which it'll be visible.
 * This property is used only if the layer is attached to [TiledGeometryLayer]{@link TiledGeometryLayer}.
 */
class GeometryLayer extends Layer {
    /**
     * A layer usually managing a geometry to display on a view. For example, it
     * can be a layer of buildings extruded from a a WFS stream.
     *
     * @constructor
     * @extends Layer
     *
     * @param {string} id - The id of the layer, that should be unique. It is
     * not mandatory, but an error will be emitted if this layer is added a
     * {@link View} that already has a layer going by that id.
     * @param {THREE.Object3D} object3d - The object3D used to contain the
     * geometry of the GeometryLayer. It is usually a `THREE.Group`, but it can
     * be anything inheriting from a `THREE.Object3D`.
     * @param {Object} [config] - Optional configuration, all elements in it
     * will be merged as is in the layer. For example, if the configuration
     * contains three elements `name, protocol, extent`, these elements will be
     * available using `layer.name` or something else depending on the property
     * name.
     * @param {Source} [config.source] - Description and options of the source.
     *
     * @throws {Error} `object3d` must be a valid `THREE.Object3d`.
     *
     * @example
     * // Create a GeometryLayer
     * const geometry = new GeometryLayer('buildings', new THREE.Object3D(), {
     *      source: {
     *          url: 'http://server.geo/wfs?',
     *          protocol: 'wfs',
     *          format: 'application/json'
     *      },
     * });
     *
     * // Add the layer
     * view.addLayer(geometry);
     */
    constructor(id, object3d, config = {}) {
        config.cacheLifeTime = config.cacheLifeTime ?? CACHE_POLICIES.GEOMETRY;

        // Remove this part when Object.assign(this, config) will be removed from Layer Constructor
        const visible = config.visible;
        delete config.visible;
        super(id, config);

        this.isGeometryLayer = true;

        if (!object3d || !object3d.isObject3D) {
            throw new Error(`Missing/Invalid object3d parameter (must be a
                three.js Object3D instance)`);
        }

        if (object3d.type === 'Group' && object3d.name === '') {
            object3d.name = id;
        }

        Object.defineProperty(this, 'object3d', {
            value: object3d,
            writable: false,
            configurable: true,
        });

        this.wireframe = false;

        this.attachedLayers = [];
        this.visible = visible ?? true;
        Object.defineProperty(this.zoom, 'max', {
            value: Infinity,
            writable: false,
        });

        // Feature options
        this.filteringExtent = !this.source.isFileSource;
        this.structure = '3d';

        this.geometryLayerUG = new UniformsGroup();
        this.geometryLayerUG.setName('geometryLayerData');

        const opacityUniform = new Uniform(1.0);
        const diffuseUniform = new Uniform(new Color(0.04, 0.23, 0.35));
        const overlayColor = new Uniform(new Color(1.0, 0.3, 0.0));
        const outlineWidth = new Uniform(0.008);
        const outlineColors = [new Uniform(new THREE.Vector3(1.0, 0.0, 0.0)), new Uniform(new THREE.Vector3(1.0, 0.5, 0.0))];
        const lightPosition = new Uniform(new THREE.Vector3(-0.5, 0.0, 1.0));
        const lightingEnabled = new Uniform(false);
        const fogDistance = new Uniform(1000000000);
        const fogColor = new Uniform(new THREE.Color(0.76, 0.85, 1.0));

        this.geometryLayerUG.add(opacityUniform);   // opacity
        this.geometryLayerUG.add(diffuseUniform);   // diffuse
        this.geometryLayerUG.add(overlayColor);     // overlayColor
        this.geometryLayerUG.add(outlineWidth);     // outlineWidth
        this.geometryLayerUG.add(outlineColors);    // outlineColors
        this.geometryLayerUG.add(lightPosition);    // lightPosition
        this.geometryLayerUG.add(lightingEnabled);  // lightingEnabled

        // Misc properties
        this.geometryLayerUG.add(fogDistance);      // fogDistance
        this.geometryLayerUG.add(fogColor);         // fogColor

        Object.defineProperty(this, 'opacity', {
            get: () => opacityUniform.value,
            set: (value) => {
                if (opacityUniform.value != value) {
                    opacityUniform.value = value;
                }
            },
        });

        Object.defineProperty(this, 'lightingEnabled', {
            get: () => lightingEnabled.value,
            set: (value) => {
                if (lightingEnabled.value != value) {
                    lightingEnabled.value = value;
                }
            },
        });

        Object.defineProperty(this, 'fogDistance', {
            get: () => fogDistance.value,
            set: (value) => {
                if (fogDistance.value != value) {
                    fogDistance.value = value;
                }
            },
        });

        Object.defineProperty(this, 'diffuse', {
            get: () => diffuseUniform.value,
        });

        Object.defineProperty(this, 'lightPosition', {
            get: () => lightPosition.value,
        });

        nbSamplers = nbSamplers || [samplersElevationCount, getMaxColorSamplerUnitsCount()];

        const NUM_VS_TEXTURES = nbSamplers[0];
        const NUM_FS_TEXTURES = nbSamplers[1];

        this.rasterLayerUG = new UniformsGroup();
        this.rasterLayerUG.setName('RasterLayerData');

        const data = [];

        for (let i = 0; i < NUM_VS_TEXTURES + NUM_FS_TEXTURES; i++) {
            data.push(new Uniform(new uniformRasterLayer()));
        }

        this.rasterLayerUG.add(data);
    }

    get visible() {
        return this.object3d.visible;
    }

    set visible(value) {
        if (this.object3d.visible !== value) {
            const event = { type: 'visible-property-changed', previous: {}, new: {} };
            event.previous.visible = this.object3d.visible;
            event.new.visible = value;
            this.dispatchEvent(event);
            this.object3d.visible = value;
        }
    }

    // Attached layers expect to receive the visual representation of a
    // layer (= THREE object with a material).  So if a layer's update
    // function don't process this kind of object, the layer must provide a
    // getObjectToUpdateForAttachedLayers function that returns the correct
    // object to update for attached layer.
    // See 3dtilesLayer or PotreeLayer for examples.
    // eslint-disable-next-line arrow-body-style
    getObjectToUpdateForAttachedLayers(obj) {
        if (obj.parent && obj.material) {
            return {
                element: obj,
                parent: obj.parent,
            };
        }
    }

    // Placeholder
    // eslint-disable-next-line
    postUpdate() {}

    // Placeholder
    // eslint-disable-next-line
    culling() {
        return true;
    }

    /**
     * Attach another layer to this one. Layers attached to a GeometryLayer will
     * be available in `geometryLayer.attachedLayers`.
     *
     * @param {Layer} layer - The layer to attach, that must have an `update`
     * method.
     */
    attach(layer) {
        if (!layer.update) {
            throw new Error(`Missing 'update' function -> can't attach layer
                ${layer.id}`);
        }
        this.attachedLayers.push(layer);
        // To traverse GeometryLayer object3d attached
        layer.parent = this;
        if (layer.isRasterLayer) {
            if (layer.isColorLayer) {
                const id = Math.max(this.attachedLayers.filter(l => l.isColorLayer).length - 1, 0) + 1;
                this.rasterLayerUG.uniforms[0][id].value.set(layer, this.tileMatrixSets);
            } else {
                this.rasterLayerUG.uniforms[0][0].value.set(layer, this.tileMatrixSets);
            }
        }
    }

    /**
     * Detach a layer attached to this one. See {@link attach} to learn how to
     * attach a layer.
     *
     * @param {Layer} layer - The layer to detach.
     *
     * @return {boolean} Confirmation of the detachment of the layer.
     */
    detach(layer) {
        const count = this.attachedLayers.length;
        this.attachedLayers = this.attachedLayers.filter(attached => attached.id != layer.id);
        layer.parent = undefined;
        return this.attachedLayers.length < count;
    }

    /**
     * All layer's 3D objects are removed from the scene and disposed from the video device.
     * @param {boolean} [clearCache=false] Whether to clear the layer cache or not
     */
    delete(clearCache) {
        if (clearCache) {
            this.cache.clear();
        }

        // if Layer is attached
        if (this.parent) {
            ObjectRemovalHelper.removeChildrenAndCleanupRecursively(this, this.parent.object3d);
        }

        if (this.object3d.parent) {
            this.object3d.parent.remove(this.object3d);
        }
        ObjectRemovalHelper.removeChildrenAndCleanupRecursively(this, this.object3d);
    }

    /**
     * Picking method for this layer. It uses the {@link Picking#pickObjectsAt}
     * method.
     *
     * @param {View} view - The view instance.
     * @param {Object} coordinates - The coordinates to pick in the view. It
     * should have at least `x` and `y` properties.
     * @param {number} radius - Radius of the picking circle.
     * @param {Array} target - target to push result.
     *
     * @return {Array} An array containing all targets picked under the
     * specified coordinates.
     */
    pickObjectsAt(view, coordinates, radius = this.options.defaultPickingRadius, target = []) {
        return Picking.pickObjectsAt(view, coordinates, radius, this.object3d, target);
    }
}

export default GeometryLayer;
