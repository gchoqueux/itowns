import * as THREE from 'three';
import { MAIN_LOOP_EVENTS } from 'Core/MainLoop';
import DEMUtils from 'Utils/DEMUtils';
// import { UNIT } from '../Core/Geographic/Coordinates';

// const axisZ = new THREE.Vector3(0, 0, 1);
// const halfPI = Math.PI * 0.5;

const destination = new THREE.Object3D();
destination.up.set(0, 0, 1);
const quaternion = new THREE.Quaternion();
export default {
    placeOnGround(view, object3D, coord, euler) {
        const coordOnGround = coord.clone();
        const result = DEMUtils.getElevationValueAt(view.tileLayer, coordOnGround);
        coordOnGround.setAltitude(result ? result.z : 0);
        this.place(view, object3D, coordOnGround, euler);
    },
    place(view, object3D, coord, euler) {
        // position and orientation of the object3D
        coord.as(view.referenceCrs).xyz(object3D.position);
        // faster lookAt 20ms
        // than equivalent quaternion.setFromUnitVectors + rotateZ => 200ms
        object3D.lookAt(coord.geodesicNormal.clone().add(object3D.position));
        if (euler) {
            quaternion.setFromEuler(euler);
            object3D.quaternion.multiply(quaternion);
        }

        object3D.updateMatrixWorld(true);
    },
    moveOnGround(view, object, coord, euler, callback) {
        const time = 1;
        const clock = new THREE.Clock();
        this.placeOnGround(view, destination, coord, euler);

        const pInitial = object.position;
        const pFinal = destination.position;
        const qInitial = object.quaternion;
        const qFinal = destination.quaternion;
        const positionKF = new THREE.VectorKeyframeTrack('.position', [0, time], [pInitial.x, pInitial.y, pInitial.z, pFinal.x, pFinal.y, pFinal.z]);
        const cpositionKF = new THREE.VectorKeyframeTrack('camera.position', [0, time * 0.5, time], [0, 2000, 0, 0, 2000, 0, 0, 2000, 0], THREE.InterpolateSmooth);
        const quaternionKF = new THREE.QuaternionKeyframeTrack('.quaternion', [0, time], [qInitial.x, qInitial.y, qInitial.z, qInitial.w, qFinal.x, qFinal.y, qFinal.z, qFinal.w]);

        // create an animation sequence with the tracks
        // If a negative time value is passed, the duration will be calculated from the times of the passed tracks array
        const clip = new THREE.AnimationClip('Action', time + 1, [positionKF, quaternionKF, cpositionKF]);
        // setup the AnimationMixer
        const mixer = new THREE.AnimationMixer(object);
        const frameRequester = () => {
            const delta = clock.getDelta();
            mixer.update(delta);
            object.updateMatrixWorld(true);
            if (callback) {
                callback();
            }
            view.notifyChange(true);
        };
        mixer.addEventListener('finished', () => {
            view.removeFrameRequester(MAIN_LOOP_EVENTS.BEFORE_RENDER, frameRequester);
        });

        // create a ClipAction and set it to play
        const clipAction = mixer.clipAction(clip);
        clipAction.clampWhenFinished = true;
        clipAction.setLoop(THREE.LoopOnce);
        clipAction.play();

        view.addFrameRequester(MAIN_LOOP_EVENTS.BEFORE_RENDER, frameRequester);
        view.notifyChange(true);
    },
};

