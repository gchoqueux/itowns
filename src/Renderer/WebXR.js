import * as THREE from 'three';
import { XRControllerModelFactory } from 'ThreeExtended/webxr/XRControllerModelFactory';

async function shutdownXR(session) {
    if (session) {
        await session.end();
    }
}

const initializeWebXR = (view, options) => {
    const scale = options.scale || 1.0;

    const xr = view.mainLoop.gfxEngine.renderer.xr;

    xr.addEventListener('sessionstart', () => {
        const camera = view.camera.camera3D;

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
        xr.getReferenceSpace('local');

        const position = view.camera.position();
        const geodesicNormal = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), position.geodesicNormal).invert();

        // const quat = new THREE.Quaternion(-1, 0, 0, 1).normalize().multiply(geodesicNormal);
        const quat = new THREE.Quaternion();
        const trans = camera.position.clone().multiplyScalar(-scale).applyQuaternion(quat);
        const transform = new XRRigidTransform(trans, quat);

        const baseReferenceSpace = xr.getReferenceSpace();
        const teleportSpaceOffset = baseReferenceSpace.getOffsetReferenceSpace(transform);
        xr.setReferenceSpace(teleportSpaceOffset);
        console.log('xr.getReferenceSpace()', xr.getReferenceSpace());
        // const rs = xr.getReferenceSpace();
        // xr.setReferenceSpaceType('viewer');


        const { far } = view.camera.camera3D;

        view.camera.camera3D = xr.getCamera();

        view.camera.camera3D.near = 0.00001;
        view.camera.camera3D.far = far;

        view.camera.resize(view.camera.width, view.camera.height);
        view.camera.camera3D.updateProjectionMatrix();

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
        view.scene.add(controllerGrip1);
        const controllerGrip2 = view.mainLoop.gfxEngine.renderer.xr.getControllerGrip(1);
        controllerGrip2.add(controllerModelFactory.createControllerModel(controllerGrip2));
        view.scene.add(controllerGrip2);
        console.log('controllerGrip2', controllerGrip2);

        // TODO Fix asynchronization between xr and MainLoop render loops.
        // (see MainLoop#scheduleViewUpdate).
        xr.setAnimationLoop((timestamp) => {
            if (xr.isPresenting && view.camera.camera3D.cameras[0]) {
                view.camera.camera3D.updateMatrixWorld(true);
                controllerGrip2.updateMatrixWorld(true);
                controllerGrip1.updateMatrixWorld(true);
                view.notifyChange(view.camera.camera3D, true);
            }

            view.mainLoop.step(view, timestamp);
        });
    });
};

export default initializeWebXR;


