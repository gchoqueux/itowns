import assert from 'assert';
import Camera, { CAMERA_TYPE } from 'Renderer/Camera';
import Coordinates from 'Core/Geographic/Coordinates';
import Extent from 'Core/Geographic/Extent';

function compareWithEpsilon(a, b, epsilon) {
    return a - epsilon < b && a + epsilon > b;
}

describe('camera', function () {
    it('should set good aspect in camera3D', function () {
        const camera = new Camera('', 100, 50);
        assert.ok(camera.camera3D.aspect == 2.0);
    });
    it('should increase preSSE when fov decrease', function () {
        const camera = new Camera('', 100, 50);

        camera.resize(100, 50);
        const initial = camera._preSSE;

        camera.camera3D.fov *= 0.5;

        assert.ok(camera._preSSE > initial);
    });
    it('should be consistent between setPosition and position', function () {
        const camera = new Camera('EPSG:4978', 100, 50);
        const coordinates = new Coordinates('EPSG:4326', 40, 52, 2002);
        camera.setPosition(coordinates);
        const resultCoordinates = camera.position('EPSG:4326');
        assert.ok(compareWithEpsilon(resultCoordinates.longitude, coordinates.longitude, 10e-8));
        assert.ok(compareWithEpsilon(resultCoordinates.latitude, coordinates.latitude, 10e-8));
        assert.ok(compareWithEpsilon(resultCoordinates.altitude, coordinates.altitude, 10e-8));
    });

    it('setFrustumFromExtent should set frustum along the longest extent dimension', function () {
        // let name r the ratio width / height of the camera
        // let name R the ratio width / height of the extent

        // case r > R (r = 1.5 and R = 0.75)
        const camera = new Camera('', 60, 40, { type: CAMERA_TYPE.ORTHOGRAPHIC });
        const extent = new Extent('', 0, 3, 0, 4);
        camera.setFrustumFromExtent(extent);
        assert.equal(camera.camera3D.top - camera.camera3D.bottom, extent.dimensions().y);
        assert.equal(camera.camera3D.right - camera.camera3D.left, extent.dimensions().y * 1.5);

        // case r > R (r = 1.5 and R = 2.0)
        extent.set(0, 10, 0, 5);
        camera.setFrustumFromExtent(extent);
        assert.equal(camera.camera3D.top - camera.camera3D.bottom, extent.dimensions().x / 1.5);
        assert.equal(camera.camera3D.right - camera.camera3D.left, extent.dimensions().x);
    });
});
