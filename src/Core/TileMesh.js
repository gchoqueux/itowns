import * as THREE from 'three';
import LayeredMaterial from '../Renderer/LayeredMaterial';
import { SIZE_TEXTURE_TILE } from '../Provider/OGCWebServiceHelper';

function TileMesh(geometry, params) {
    // Constructor
    THREE.Mesh.call(this);

    this.matrixAutoUpdate = false;
    this.rotationAutoUpdate = false;

    if (!params.extent) {
        throw new Error('params.extent is mandatory to build a TileMesh');
    }

    this.level = params.level || 0;
    this.extent = params.extent;

    this.geometry = geometry;

    this.obb = this.geometry.OBB.clone();

    this.boundingSphere = new THREE.Sphere();
    this.OBB().box3D.getBoundingSphere(this.boundingSphere);

    params.material = params.material || {};
    params.material.objectId = this.id;
    this.material = params.material.isMaterial ? params.material : new LayeredMaterial(params.material);

    this.frustumCulled = false;

    this.updateGeometricError();

    // Layer
    this.layerUpdateState = {};
}

TileMesh.prototype = Object.create(THREE.Mesh.prototype);
TileMesh.prototype.constructor = TileMesh;

TileMesh.prototype.updateMatrixWorld = function updateMatrixWorld(force) {
    THREE.Mesh.prototype.updateMatrixWorld.call(this, force);
    this.OBB().update();
};

TileMesh.prototype.setBBoxZ = function setBBoxZ(min, max) {
    if (min == undefined && max == undefined) {
        return;
    }
    if (Math.floor(min) !== Math.floor(this.obb.z.min) || Math.floor(max) !== Math.floor(this.obb.z.max)) {
        this.OBB().updateZ(min, max);
        this.OBB().box3D.getBoundingSphere(this.boundingSphere);
        this.updateGeometricError();
    }
};

TileMesh.prototype.updateGeometricError = function updateGeometricError() {
    // The geometric error is calculated to have a correct texture display.
    // For the projection of a texture's texel to be less than or equal to one pixel
    this.geometricError = this.boundingSphere.radius / SIZE_TEXTURE_TILE;
};

TileMesh.prototype.OBB = function OBB() {
    return this.obb;
};

TileMesh.prototype.removeLayer = function removeLayer(idLayer) {
    if (this.layerUpdateState && this.layerUpdateState[idLayer]) {
        delete this.layerUpdateState[idLayer];
    }
};

/**
 * Search for a common ancestor between this tile and another one. It goes
 * through parents on each side until one is found.
 *
 * @param {TileMesh} tile
 *
 * @return {TileMesh} the resulting common ancestor
 */
TileMesh.prototype.findCommonAncestor = function findCommonAncestor(tile) {
    if (!tile) {
        return undefined;
    }
    if (tile.level == this.level) {
        if (tile.id == this.id) {
            return tile;
        } else if (tile.level != 0) {
            return this.parent.findCommonAncestor(tile.parent);
        } else {
            return undefined;
        }
    } else if (tile.level < this.level) {
        return this.parent.findCommonAncestor(tile);
    } else {
        return this.findCommonAncestor(tile.parent);
    }
};

export default TileMesh;
