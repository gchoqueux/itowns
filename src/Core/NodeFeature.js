import * as THREE from 'three';
// import Coordinates from 'Core/Geographic/Coordinates';

export class Node extends THREE.EventDispatcher {
    constructor(layer) {
        super();
        this.layer = layer;
        this.source = layer.source;
    }
}

function assignLayer(object, layer) {
    if (object) {
        object.layer = layer;
        if (object.material) {
            object.material.transparent = layer.opacity < 1.0;
            object.material.opacity = layer.opacity;
            object.material.wireframe = layer.wireframe;

            if (layer.size) {
                object.material.size = layer.size;
            }
            if (layer.linewidth) {
                object.material.linewidth = layer.linewidth;
            }
        }
        object.layers.set(layer.threejsLayer);
        for (const c of object.children) {
            assignLayer(c, layer);
        }
        return object;
    }
}

// const coord = new Coordinates('EPSG:4326', 0, 0, 0);

class NodeFeature extends Node {
    constructor(layer, extent) {
        super(layer);
        this.extent = extent;
    }
    load() {
        return this.source.fetcher(this.source.urlFromExtent(this.extent))
            .then((f) => {
                this.layer.sourceToLayer.filteringExtent = !this.source.isFileSource ? this.extent.as(this.source.projection) : undefined;
                this.layer.sourceToLayer.extentSource = this.extent;
                this.layer.sourceToLayer.crsOut = this.layer.projection;
                return this.source.parser(f, this.layer.sourceToLayer);
            })
            .then(p => this.layer.convert(p, this.extent, this.layer))
            .then((mesh) => {
                assignLayer(mesh, this.layer);
                if (this.layer.onMeshCreated) {
                    this.layer.onMeshCreated(mesh);
                }
                return mesh;
            });
        // if (this.source.extentInsideLimit(this.extent) &&
        //     (this.source.isFileSource == undefined || this.extent.isPointInside(this.source.extent.center(coord)))) {
        // } else {
        //     return Promise.resolve();
        // }
    }
}

export default NodeFeature;

