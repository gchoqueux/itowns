import { Group, Quaternion } from 'three';
// eslint-disable-next-line import/no-unresolved
import { TransformControls } from 'three/addons/controls/TransformControls';
import Coordinates from './Coordinates';
import Extent from './Extent';
import { quaternionFromCRSToCRS } from './OrientationUtils';

const worldPosition = new Coordinates('EPSG:4326');
const worldParentPosition = new Coordinates('EPSG:4326');
const quaternion = new Quaternion();

function dimension(extent) {
    //

    return extent.crs === 'EPSG:4978' ?

        extent.spatialEuclideanDimensions() :

        extent.planarDimensions();

    //
}

function setProjectedLocalPosition(object3d, crsin, crsout) {
    // get native world position

    worldPosition.setFromMatrixPosition(object3d.matrixWorld);

    // set project the world position

    object3d.position.copy(worldPosition.as(crsout));

    // sub parent world position
    if (object3d.parent) {
        worldParentPosition.setFromMatrixPosition(object3d.parent.matrixWorld);

        object3d.position.sub(worldParentPosition.as(crsout));
    }

    return worldPosition;
}

class GeographicPose extends Group {
    constructor(crs, view) {
        super();

        this.transformControls = new TransformControls(view.camera.camera3D, view.domElement);

        this.transformControls.space = 'local';

        this.transformControls.size = 1.5;

        this.crs = crs;

        this.isGeographicPose = true;
    }

    getHelper() {
        return this.transformControls.getHelper();
    }
}


class GeographicGroup extends GeographicPose {
    constructor(crs, view, applyProjectionOnmesh = false) {
        super(crs, view);

        this.isGeographicGroup = true;

        this.applyProjectionOnmesh = applyProjectionOnmesh;
    }

    as(crs) {
        //
        // projected world position

        this.updateMatrix();

        this.updateMatrixWorld(true);

        worldPosition.crs = this.crs;

        worldParentPosition.crs = this.crs;

        this.traverse((child) => {
            //
            const nativeWorldProjection = setProjectedLocalPosition(child, this.crs, crs);

            if (child.isMesh) {
                //
                // apply local rotation to compensate meridian convergence

                quaternionFromCRSToCRS(this.crs, crs, nativeWorldProjection, child.quaternion);
                quaternion.setFromRotationMatrix(child.matrixWorld);
                quaternion.invert().multiply(child.quaternion);

                child.quaternion.copy(quaternion);

                this.transformControls.attach(child);

                this.transformControls.setMode('translate');

                if (this.applyProjectionOnmesh) {
                    // apply local sacle to resize data to the new projection

                    if (!child.geometry.boundingBox) {
                        child.geometry.computeBoundingBox();
                    }

                    const nativeExtent = Extent.fromBox3(this.crs, child.geometry.boundingBox)
                        .applyMatrix4(child.matrixWorld);

                    const projectedExtend = nativeExtent.as(crs);

                    const nativeDimension = dimension(nativeExtent);

                    const projectedDimension = dimension(projectedExtend);

                    const scale = projectedDimension.divide(nativeDimension);

                    child.scale.set(scale.x, scale.y, child.scale.z);
                }
            }
        });

        this.updateMatrix();

        this.updateMatrixWorld(true);

        //
    }
}

export default GeographicGroup;
