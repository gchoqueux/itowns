import * as THREE from 'three';
import Feature2Texture from 'Converter/Feature2Texture';
import Extent from 'Core/Geographic/Extent';
import CRS from 'Core/Geographic/Crs';
import CameraUtils from 'Utils/CameraUtils';

// const obb = new OBB();
const ndcToTextureMatrix = new THREE.Matrix4().set(
    1, 0, 0, 1,
    0, 1, 0, 1,
    0, 0, 2, 0,
    0, 0, 0, 2);

const extentTexture = new Extent('EPSG:4326', [0, 0, 0, 0]);

const textureLayer = (texture, layer) => {
    texture.generateMipmaps = false;
    texture.magFilter = layer.magFilter || THREE.LinearFilter;
    texture.minFilter = layer.minFilter || THREE.LinearFilter;
    return texture;
};

function textureColorLayer(texture, layer) {
    texture.anisotropy = 16;
    texture.premultiplyAlpha = layer.transparent;
    return textureLayer(texture, layer);
}

export default {
    convert(data, extentDestination, layer) {
        let texture;
        if (data.isFeatureCollection) {
            const backgroundLayer = layer.source.backgroundLayer;
            const backgroundColor = (backgroundLayer && backgroundLayer.paint) ?
                new THREE.Color(backgroundLayer.paint['background-color']) :
                undefined;

            extentDestination.as(CRS.formatToEPSG(layer.crs), extentTexture);
            texture = Feature2Texture.createTextureFromFeature(data, extentTexture, 256, layer.style, backgroundColor);
            texture.features = data;
            texture.extent = extentDestination;
        } else if (data.isTexture) {
            texture = data;
        } else {
            throw (new Error('Data type is not supported to convert into texture'));
        }
        // compute projection
        const extent = data.extent.as('EPSG:4326');
        extent.proxy = false;
        const camera = new THREE.OrthographicCamera();
        CameraUtils.transformCameraToLookAtTarget({
            isGlobeView: true,
            extent: { crs: 'EPSG:4326' },
            referenceCrs: 'EPSG:4978',
            getPickingPositionFromDepth: () => {},
            getLayers: () => [layer.parent],
            addFrameRequester: () => {},
            notifyChange: () => {},
        }, camera, extent);

        camera.updateMatrixWorld(true);

        texture.textureMatrixWorldInverse = new THREE.Matrix4();
        texture.textureMatrixWorldInverse.multiplyMatrices(ndcToTextureMatrix, camera.projectionMatrix);
        texture.textureMatrixWorldInverse.multiply(camera.matrixWorldInverse);

        texture.camera = camera;

        if (layer.isColorLayer) {
            return textureColorLayer(texture, layer);
        } else if (layer.isElevationLayer) {
            if (texture.flipY) {
                // DataTexture default to false, so make sure other Texture types
                // do the same (eg image texture)
                // See UV construction for more details
                texture.flipY = false;
            }
            return textureLayer(texture, layer);
        }
    },
};
