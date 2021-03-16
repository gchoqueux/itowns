/**
 * @author zz85 / https://github.com/zz85
 *
 * Based on "A Practical Analytic Model for Daylight"
 * aka The Preetham Model, the de facto standard analytic skydome model
 * http://www.cs.utah.edu/~shirley/papers/sunsky/sunsky.pdf
 *
 * First implemented by Simon Wallner
 * http://www.simonwallner.at/projects/atmospheric-scattering
 *
 * Improved by Martin Upitis
 * http://blenderartists.org/forum/showthread.php?245954-preethams-sky-impementation-HDR
 *
 * Three.js integration by zz85 http://twitter.com/blurspline
 */

import * as THREE from 'three';

import skyInFS from './Shaders/skyInFS.glsl';
import skyInVS from './Shaders/skyInVS.glsl';

const uniforms = {
    luminance: {
        value: 1,
    },
    turbidity: {
        value: 2,
    },
    reileigh: {
        value: 1,
    },
    mieCoefficient: {
        value: 0.005,
    },
    mieDirectionalG: {
        value: 0.8,
    },
    v3LightPosition: {
        value: new THREE.Vector3(),
    },
    up: {
        value: new THREE.Vector3(0.0, 1.0, 0.0),
    },
    lambda: {
        value: new THREE.Vector3(680e-9, 550e-9, 450e-9),
    },
};

class Sky extends THREE.Mesh {
    constructor() {
        var skyUniforms = THREE.UniformsUtils.clone(uniforms);

        var skyMat = new THREE.ShaderMaterial({
            fragmentShader: skyInFS,
            vertexShader: skyInVS,
            uniforms: skyUniforms,
            side: THREE.BackSide,
            transparent: true,
            depthWrite: false,
        });

        var skyGeo = new THREE.SphereBufferGeometry(40000, 32, 15);
        super(skyGeo, skyMat);
    }
}

export default Sky;
