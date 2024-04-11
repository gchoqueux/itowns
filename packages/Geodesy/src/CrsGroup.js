import { Group, Quaternion, Vector3, GridHelper, AxesHelper } from 'three';
import OrientationUtils from 'OrientationUtils';
// eslint-disable-next-line no-unused-vars
import calculateHomography3D from 'Homography';
// import Extent from 'Extent';
// import { ellipsoidSizes } from 'Ellipsoid';

const y_axes = new Vector3(0, 1, 0);
const z_axes = new Vector3(0, 0, 1);

// const chord = 2 * ellipsoidSizes.z * Math.sin(d  / 180 * Math.PI);
// const alpha = Math.asin(100 / (2 * ellipsoidSizes.z)) / Math.PI * 180;
// const extent = new Extent('EPSG:4326', -alpha, alpha, -alpha, alpha);

class CrsGroup extends Group {
    constructor(origin, destination, rotation = 0) {
        super();
        this.destination = destination;
        origin.as(destination).toVector3(this.position);
        const crs2crs = OrientationUtils.quaternionFromCRSToCRS(origin.crs, destination);
        const z_up = new Quaternion().setFromUnitVectors(y_axes, z_axes);
        crs2crs(origin, this.quaternion);
        const y_rotation = new Quaternion().setFromAxisAngle(y_axes, Math.PI / 2);
        const z_rotation = new Quaternion().setFromAxisAngle(y_axes, rotation);
        this.quaternion.multiply(z_up).multiply(y_rotation).multiply(z_rotation);

        // const extent = new Extent('EPSG:4326', origin.x - alpha, origin.x + alpha, origin.y - alpha, origin.y + alpha);
        // calculate the scale transformation to transform the feature.extent
        // to feature.extent.as(crs)
        // coord.crs = CRS.formatToEPSG(this.#originalCrs);
        // extent.copy(this.extent).applyMatrix4(this.#collection.matrix);
        // extent.as(coord.crs, extent);
        // extent.spatialEuclideanDimensions(dim_ref);
        // extent.planarDimensions(dim);
        // if (dim.x && dim.y) {
        //     this.scale.copy(dim_ref).divide(dim).setZ(1);
        // }


        // Helpers
        this.helpers = new Group();

        const size = 100;
        const divisions = 10;
        const gridHelper = new GridHelper(size, divisions);
        const axesHelper = new AxesHelper(size);

        this.helpers.add(axesHelper, gridHelper);
        this.add(this.helpers);

        // this.helpers.visible = false;

        this.updateMatrixWorld();
    }
}

export default CrsGroup;

