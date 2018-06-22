import { Mesh, Sphere } from 'three';
import { SIZE_TEXTURE_TILE } from '../Provider/OGCWebServiceHelper';

/**
 * A TileMesh is a THREE.Mesh with a geometricError and an OBB
 * The objectId property of the material is the with the id of the TileMesh
 * @constructor
 * @param {TileGeometry} geometry - the tile geometry
 * @param {THREE.Material} material - a THREE.Material compatible with THREE.Mesh
 * @param {Extent} extent - the tile extent
 * @param {?number} level - the tile level (default = 0)
 */
class TileMesh extends Mesh {
    constructor(geometry, material, extent, level = 0) {
        super(geometry, material);

        if (!extent) {
            throw new Error('extent is mandatory to build a TileMesh');
        }
        this.extent = extent;
        this.level = level;
        this.material.objectId = this.id;

        this.obb = this.geometry.OBB.clone();
        this.boundingSphere = new Sphere();
        this.obb.box3D.getBoundingSphere(this.boundingSphere);
        this.updateGeometricError();

        this.frustumCulled = false;
        this.matrixAutoUpdate = false;
        this.rotationAutoUpdate = false;
    }

    /**
     * Update the global transform of the object and its children.
     * Update the OBB of the object.
     *
     * @param {Boolean} force
     */
    updateMatrixWorld(force) {
        super.updateMatrixWorld(force);
        this.obb.update();
    }

    /**
     * If specified, update the min and max elevation of the OBB
     * and updates accordingly the bounding sphere and the geometric error
     *
     * @param {?number} min
     * @param {?number} max
     */
    setBBoxZ(min, max) {
        if (min == undefined && max == undefined) {
            return;
        }
        // FIXME: Why the floors ? This is not conservative : the obb may be too short by almost 1m !
        if (Math.floor(min) !== Math.floor(this.obb.z.min) || Math.floor(max) !== Math.floor(this.obb.z.max)) {
            this.obb.updateZ(min, max);
            this.obb.box3D.getBoundingSphere(this.boundingSphere);
            this.updateGeometricError();
        }
    }

    /**
     * Update the geometric error based on the bounding sphere radius.
     */
    updateGeometricError() {
        // The geometric error is calculated to have a correct texture display.
        // For the projection of a texture's texel to be less than or equal to one pixel
        this.geometricError = this.boundingSphere.radius / SIZE_TEXTURE_TILE;
    }

    /**
     * Search for a common ancestor between this tile and another one. It goes
     * through parents on each side until one is found.
     *
     * @param {TileMesh} tile
     *
     * @return {TileMesh} the resulting common ancestor
     */
    findCommonAncestor(tile) {
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
    }
}

export default TileMesh;
