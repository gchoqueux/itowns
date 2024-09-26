import * as THREE from 'three';
// import Coordinates from 'Core/Geographic/Coordinates';
import OrientationUtils from 'Utils/OrientationUtils';
import { XRControllerModelFactory } from 'ThreeExtended/webxr/XRControllerModelFactory';
import Raycaster from 'Renderer/Raycaster';
// import { BoxLineGeometry } from 'ThreeExtended/geometries/BoxLineGeometry';


// const coord = new Coordinates('EPSG:4978');

async function shutdownXR(session) {
    if (session) {
        await session.end();
    }
}


// function buildController(data) {
//     let geometry; let
//         material;

//     switch (data.targetRayMode) {
//         case 'tracked-pointer':

//             geometry = new THREE.BufferGeometry();
//             geometry.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 0, 0, -1], 3));
//             geometry.setAttribute('color', new THREE.Float32BufferAttribute([0.5, 0.5, 0.5, 0, 0, 0], 3));

//             material = new THREE.LineBasicMaterial({ vertexColors: true, blending: THREE.AdditiveBlending });

//             return new THREE.Line(geometry, material);

//         case 'gaze':

//             geometry = new THREE.RingGeometry(0.02, 0.04, 32).translate(0, 0, -1);
//             material = new THREE.MeshBasicMaterial({ opacity: 0.5, transparent: true });
//             return new THREE.Mesh(geometry, material);

//         default:
//     }
// }

/*
function updatePreSse(camera, height, fov) {
    if (camera.camera3D.isOrthographicCamera) {
        camera._preSSE = height;
    } else {
        const verticalFOV = THREE.MathUtils.degToRad(fov);
        camera._preSSE = height / (2.0 * Math.tan(verticalFOV * 0.5));
    }
}
*/

const initializeWebXR = (view, options) => {
    const scale = options.scale || 1.0;

    const xr = view.mainLoop.gfxEngine.renderer.xr;

    xr.addEventListener('sessionstart', () => {
        const camera = view.camera.camera3D;

        const coord = view.camera.position();

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

        // const position = view.camera.position();
        // const geodesicNormal = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), position.geodesicNormal).invert();

        // const quat = new THREE.Quaternion(-1, 0, 0, 1).normalize().multiply(geodesicNormal);
        // const quat = new THREE.Quaternion();
        // const trans = camera.position.clone().multiplyScalar(-scale).applyQuaternion(quat);
        // const transform = new XRRigidTransform(trans, quat);


        const xrGroup = new THREE.Group();
        const h = new THREE.Group();
        xrGroup.add(h);


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
        h.add(view.camera.camera3D);

        document.addEventListener('keydown', exitXRSession, false);



        // controllers

        const marker = new THREE.Mesh(
            new THREE.CircleGeometry(0.25, 32).rotateX(-Math.PI / 2),
            new THREE.MeshBasicMaterial({ color: 0xbcbcbc }),
        );
        view.scene.add(marker);

        function buildController(data) {
            let geometry; let
                material;

            switch (data.targetRayMode) {
                case 'tracked-pointer':

                    geometry = new THREE.BufferGeometry();
                    geometry.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 0, 0, -1], 3));
                    geometry.setAttribute('color', new THREE.Float32BufferAttribute([0.5, 0.5, 0.5, 0, 0, 0], 3));

                    material = new THREE.LineBasicMaterial({ vertexColors: true, blending: THREE.AdditiveBlending });

                    return new THREE.Line(geometry, material);

                case 'gaze':

                    geometry = new THREE.RingGeometry(0.02, 0.04, 32).translate(0, 0, -1);
                    material = new THREE.MeshBasicMaterial({ opacity: 0.5, transparent: true });
                    return new THREE.Mesh(geometry, material);
                default:
            }
        }

        // function onWindowResize() {

        //     camera.aspect = window.innerWidth / window.innerHeight;
        //     camera.updateProjectionMatrix();

        //     renderer.setSize( window.innerWidth, window.innerHeight );

        // }

        let INTERSECTION;
        // let baseReferenceSpace;
        const renderer = view.mainLoop.gfxEngine.renderer;

        renderer.xr.addEventListener('sessionstart', () => {
            // baseReferenceSpace = renderer.xr.getReferenceSpace();
        });

        function onSelectStart() {
            this.userData.isSelecting = true;
        }

        function onSelectEnd() {
            this.userData.isSelecting = false;

            if (INTERSECTION) {
                const coord = view.camera.position('EPSG:4326');
                const a = coord.z;

                coord.as('EPSG:4978', coord);
                const v = new THREE.Vector3();
                INTERSECTION.getWorldPosition(v);
                coord.setFromVector3(v);
                coord.as('EPSG:4326', coord);
                coord.z = a;


                const crs2crs = OrientationUtils.quaternionFromCRSToCRS('EPSG:4326', 'EPSG:4978');
                // calculate orientation to crs

                crs2crs(coord, xrGroup.quaternion);

                xrGroup.rotateX(Math.PI / 2);
                coord.as('EPSG:4978', coord);
                xrGroup.position.copy(coord.toVector3());

                // const offsetPosition = { x: -INTERSECTION.x, y: -INTERSECTION.y, z: -INTERSECTION.z, w: 1 };
                // const offsetRotation = new THREE.Quaternion();
                // const transform = new XRRigidTransform(offsetPosition, offsetRotation);
                // const teleportSpaceOffset = baseReferenceSpace.getOffsetReferenceSpace(transform);

                // renderer.xr.setReferenceSpace(teleportSpaceOffset);
            }
        }

        const controller1 = renderer.xr.getController(0);
        controller1.addEventListener('selectstart', onSelectStart);
        controller1.addEventListener('selectend', onSelectEnd);
        /* eslint-disable func-names */
        controller1.addEventListener('connected', function (event) {
            this.add(buildController(event.data));
        });
        controller1.addEventListener('disconnected', function () {
            this.remove(this.children[0]);
        });
        h.add(controller1);

        let selected = false;
        let squeezed = false;

        const controller2 = renderer.xr.getController(1);
        // controller2.addEventListener('selectstart', onSelectStart);
        controller2.addEventListener('selectstart', () => {
            selected = true;
        });

        controller2.addEventListener('selectend', () => {
            selected = false;
        });

        controller2.addEventListener('squeezestart', () => {
            squeezed = true;
        });

        controller2.addEventListener('squeezeend', () => {
            squeezed = false;
        });


        controller2.addEventListener('connected', function (event) {
            this.add(buildController(event.data));
        });
        controller2.addEventListener('disconnected', function () {
            this.remove(this.children[0]);
        });

        h.add(controller2);

        // The XRControllerModelFactory will automatically fetch controller models
        // that match what the user is holding as closely as possible. The models
        // should be attached to the object returned from getControllerGrip in
        // order to match the orientation of the held device.

        const controllerModelFactory = new XRControllerModelFactory();
        const controllerGrip1 = view.mainLoop.gfxEngine.renderer.xr.getControllerGrip(0);

        const model_1 = controllerModelFactory.createControllerModel(controllerGrip1);
        controllerGrip1.add(model_1);
        /*
        let gamepad;
        controllerGrip1.addEventListener('connected', (e) => {
            gamepad = e.data.gamepad;
        });
        */
        controllerGrip1.updateMatrixWorld(true);
        h.add(controllerGrip1);
        const controllerGrip2 = view.mainLoop.gfxEngine.renderer.xr.getControllerGrip(1);
        controllerGrip2.add(controllerModelFactory.createControllerModel(controllerGrip2));
        h.add(controllerGrip2);

        view.scene.add(xrGroup);
        // console.log('view', view);
        // xrGroup.updateMatrixWorld(true);
        // TODO Fix asynchronization between xr and MainLoop render loops.
        // (see MainLoop#scheduleViewUpdate).
        //
        // const tempMatrix = new THREE.Matrix4();
        const raycaster = new Raycaster();
        raycaster.far = 100000000000;
        raycaster.near = 0.00001;

        xr.setAnimationLoop((timestamp) => {
            if (xr.isPresenting && xr.getCamera().cameras[0]) {
                // if (gamepad && gamepad.buttons[2].selected) {
                //     // && gamepad.axes[0]
                //     // console.log('gamepad', );
                //     h.position.z -= 50;
                // }
                xrGroup.updateMatrix();
                xrGroup.updateMatrixWorld(true);


                INTERSECTION = null;

                if (selected) {
                    h.position.y += 50;
                }

                if (squeezed) {
                    h.position.y -= 50;
                }

                controller1.updateMatrixWorld(true);

                raycaster.setFromXRController(controller1);

                const ray = new THREE.Ray();
                const inverseMatrix = new THREE.Matrix4();

                const tiles = Array.from(view.tileLayer.info.displayed.tiles.filter((t) => {
                    t.updateMatrixWorld(true);

                    // for example textGeo is the textGeometry
                    inverseMatrix.copy(t.matrixWorld).invert();
                    ray.copy(raycaster.ray).applyMatrix4(inverseMatrix);
                    const i = ray.intersectBox(t.obb.box3D, new THREE.Vector3());

                    t.material.overlayAlpha = 0;
                    t.material.showOutline = view.tileLayer.showOutline;
                    return t.visible && t.material.visible && i;
                }));

                tiles.sort((a, b) => {
                    const aa = a.getWorldPosition(new THREE.Vector3()).distanceTo(controller1.getWorldPosition(new THREE.Vector3()));
                    const bb = b.getWorldPosition(new THREE.Vector3()).distanceTo(controller1.getWorldPosition(new THREE.Vector3()));
                    return aa - bb;
                });


                if (tiles.length && controller1.userData.isSelecting) {
                    tiles[0].material.overlayAlpha = 0.5;
                    tiles[0].material.showOutline = true;
                    INTERSECTION = tiles[0];
                }

                view.notifyChange(view.camera.camera3D, true);
            }

            view.mainLoop.step(view, timestamp);
        });
    });
};

export default initializeWebXR;


