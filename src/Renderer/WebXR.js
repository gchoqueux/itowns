import * as THREE from 'three';
import OrientationUtils from 'Utils/OrientationUtils';
import { XRControllerModelFactory } from 'ThreeExtended/webxr/XRControllerModelFactory';

async function shutdownXR(session) {
    if (session) {
        await session.end();
    }
}

function updatePreSse(camera, height, fov) {
    if (camera.camera3D.isOrthographicCamera) {
        camera._preSSE = height;
    } else {
        const verticalFOV = THREE.MathUtils.degToRad(fov);
        camera._preSSE = height / (2.0 * Math.tan(verticalFOV * 0.5));
    }
}

const initializeWebXR = (view, options) => {
    const scale = options.scale || 1.0;

    const xr = view.mainLoop.gfxEngine.renderer.xr;

    xr.addEventListener('sessionstart', () => {
        const camera = view.camera.camera3D;

        const coord = view.camera.position();
        console.log('coord', coord);

        const exitXRSession = (event) => {
            if (event.key === 'Escape') {
                document.removeEventListener('keydown', exitXRSession);
                xr.enabled = false;
                view.camera.camera3D = camera;

                view.scene.scale.multiplyScalar(1 / scale);
                view.scene.updateMatrixWorld();

                shutdownXR(xr.getSession());
                view.notifyChange(view.camera.camera3D, true);
            }
        };
        view.scene.scale.multiplyScalar(scale);
        view.scene.updateMatrixWorld();
        xr.enabled = true;
        // xr.getReferenceSpace('local');

        const position = view.camera.position();
        const geodesicNormal = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), position.geodesicNormal).invert();

        const quat = new THREE.Quaternion(-1, 0, 0, 1).normalize().multiply(geodesicNormal);
        // const quat = new THREE.Quaternion();
        // const trans = camera.position.clone().multiplyScalar(-scale).applyQuaternion(quat);
        // const transform = new XRRigidTransform(trans, quat);


        const xrGroup = new THREE.Group();


        // get mesh coordinate
        // coord.setFromVector3(this.#collection.position);

        // get method to calculate orientation
        const crs2crs = OrientationUtils.quaternionFromCRSToCRS('EPSG:4326', 'EPSG:4978');
        // calculate orientation to crs

        crs2crs(coord, xrGroup.quaternion);

        xrGroup.rotateX(Math.PI / 2);
        xrGroup.position.copy(camera.position);
        // xrGroup.quaternion.copy(quat);

        // xrGroup.upda

        // const transform = new XRRigidTransform(trans, quat);

        // const baseReferenceSpace = xr.getReferenceSpace();
        // const teleportSpaceOffset = baseReferenceSpace.getOffsetReferenceSpace(transform);
        // xr.setReferenceSpace(teleportSpaceOffset);
        // console.log('xr.getReferenceSpace()', xr.getReferenceSpace());
        // const rs = xr.getReferenceSpace();
        // xr.setReferenceSpaceType('viewer');


        // const { far } = view.camera.camera3D;

        view.camera.camera3D = xr.getCamera();

        // let fov = view.camera.camera3D.fov;
        // Object.defineProperty(view.camera.camera3D, 'fov', {
        //     get: () => fov,
        //     set: (newFov) => {
        //         fov = newFov;
        //         updatePreSse(view.camera, view.camera.height, fov);
        //     },
        // });

        view.camera.camera3D.near = 0.00001;
        view.camera.camera3D.far = camera.far;
        view.camera.resize(view.camera.width, view.camera.height);
        // eslint-disable-next-line no-self-assign
        view.camera.camera3D.fov = view.camera.camera3D.fov;
        view.camera.camera3D.updateProjectionMatrix();
        xrGroup.add(view.camera.camera3D);

        document.addEventListener('keydown', exitXRSession, false);

        // The XRControllerModelFactory will automatically fetch controller models
        // that match what the user is holding as closely as possible. The models
        // should be attached to the object returned from getControllerGrip in
        // order to match the orientation of the held device.


        const controllerModelFactory = new XRControllerModelFactory();
        const controllerGrip1 = view.mainLoop.gfxEngine.renderer.xr.getControllerGrip(0);

        const model_1 = controllerModelFactory.createControllerModel(controllerGrip1);
        controllerGrip1.add(model_1);
        controllerGrip1.updateMatrixWorld(true);
        xrGroup.add(controllerGrip1);
        const controllerGrip2 = view.mainLoop.gfxEngine.renderer.xr.getControllerGrip(1);
        controllerGrip2.add(controllerModelFactory.createControllerModel(controllerGrip2));
        xrGroup.add(controllerGrip2);

        view.scene.add(xrGroup);
        // xrGroup.updateMatrixWorld(true);
        // TODO Fix asynchronization between xr and MainLoop render loops.
        // (see MainLoop#scheduleViewUpdate).
        xr.setAnimationLoop((timestamp) => {
            if (xr.isPresenting && xr.getCamera().cameras[0]) {
                xrGroup.updateMatrix();
                xrGroup.updateMatrixWorld(true);
                view.notifyChange(view.camera.camera3D, true);
            }

            view.mainLoop.step(view, timestamp);
        });
    });
};

export default initializeWebXR;


