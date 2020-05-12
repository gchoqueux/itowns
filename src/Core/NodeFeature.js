import * as THREE from 'three';

export class Node extends THREE.EventDispatcher {
    constructor(layer) {
        super();
        this.layer = layer;
        this.source = layer.source;
    }
}

// Future node for geometry
const NodeFeature = {};

export default NodeFeature;

