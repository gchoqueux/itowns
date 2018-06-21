import * as THREE from 'three';
import LayeredMaterial from '../Renderer/LayeredMaterial';
import OGCWebServiceHelper, { SIZE_TEXTURE_TILE } from '../Provider/OGCWebServiceHelper';
import { is4326 } from './Geographic/Coordinates';

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

    this.material = params.material && params.material.isMaterial ? params.material : new LayeredMaterial(params.material);

    this.frustumCulled = false;

    this.updateGeometricError();

    // Layer

    this.layerUpdateState = {};

    this.setDisplayed(false); // TODO: this.material.visible = false;
    this.material.uuid = this.id;
}

TileMesh.prototype = Object.create(THREE.Mesh.prototype);
TileMesh.prototype.constructor = TileMesh;

TileMesh.prototype.updateMatrixWorld = function updateMatrixWorld(force) {
    THREE.Mesh.prototype.updateMatrixWorld.call(this, force);
    this.OBB().update();
};

// TODO: remove it, after working around the hack TileDebug.js#L124-L140
TileMesh.prototype.setDisplayed = function setDisplayed(show) {
    this.material.visible = show;
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

TileMesh.prototype.getCoordsForLayer = function getCoordsForLayer(layer) {
    if (layer.protocol.indexOf('wmts') == 0) {
        OGCWebServiceHelper.computeTileMatrixSetCoordinates(this, layer.options.tileMatrixSet);
        return this.wmtsCoords[layer.options.tileMatrixSet];
    } else if (layer.protocol == 'wms' && this.extent.crs() != layer.projection) {
        if (layer.projection == 'EPSG:3857') {
            const tilematrixset = 'PM';
            OGCWebServiceHelper.computeTileMatrixSetCoordinates(this, tilematrixset);
            return this.wmtsCoords[tilematrixset];
        } else {
            throw new Error('unsupported projection wms for this viewer');
        }
    } else if (layer.protocol == 'tms' || layer.protocol == 'xyz') {
        // Special globe case: use the P(seudo)M(ercator) coordinates
        if (is4326(this.extent.crs()) &&
                (layer.extent.crs() == 'EPSG:3857' || is4326(layer.extent.crs()))) {
            OGCWebServiceHelper.computeTileMatrixSetCoordinates(this, 'PM');
            return this.wmtsCoords.PM;
        } else {
            return OGCWebServiceHelper.computeTMSCoordinates(this, layer.extent, layer.origin);
        }
    } else {
        return [this.extent];
    }
};

TileMesh.prototype.getZoomForLayer = function getZoomForLayer(layer) {
    if (layer.protocol.indexOf('wmts') == 0) {
        OGCWebServiceHelper.computeTileMatrixSetCoordinates(this, layer.options.tileMatrixSet);
        return this.wmtsCoords[layer.options.tileMatrixSet][0].zoom;
    } else {
        return this.level;
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
