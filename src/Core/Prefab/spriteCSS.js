import * as THREE from 'three';
import { CSS2DObject } from 'ThreeExtended/renderers/CSS2DRenderer';
import { MAIN_LOOP_EVENTS } from 'Core/MainLoop';
// import { CSS3DObject } from 'ThreeExtended/renderers/CSS3DRenderer';

const lines = [];

export function addCSS2DLabel(view, position, text) {
    const placeMark = document.createElement('div');

    const trans = document.createElement('div');
    trans.className = 'trans';
    placeMark.appendChild(trans);

    // create label for css 2d object
    const labelDiv = document.createElement('div');
    labelDiv.className = 'label';
    labelDiv.textContent = text;
    // labelDiv.style.marginTop = '-1em';
    trans.appendChild(labelDiv);

    const divLine = document.createElement('div');
    divLine.className = 'vl';
    divLine.style.height = '10px';
    trans.appendChild(divLine);
    lines.push(divLine);

    // create css2dObject
    const label = new CSS2DObject(placeMark);
    // place and add label to scene
    position.as(view.referenceCrs).xyz(label.position);
    view.scene.add(label);
    label.updateMatrixWorld(true);
    view.notifyChange();

    if (lines.length === 1) {
        view.addFrameRequester(MAIN_LOOP_EVENTS.BEFORE_RENDER, () => {
            lines.forEach((line) => {
                line.style.height = `${80 * Math.cos(view.controls.getTilt() * Math.PI / 180)}px`;
            });
        });
    }

    return { divLine, label };
}

export function sprite3D(view, position) {
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load('../../examples/ball.png', (map) => {
        var material = new THREE.SpriteMaterial({ map, sizeAttenuation: true });
        var width = material.map.image.width;
        var height = material.map.image.height;
        const sprite = new THREE.Sprite(material);
        sprite.center.set(0.0, 1.0);
        sprite.scale.set(width * 2, height * 2, 1);
        position.as(view.referenceCrs).xyz(sprite.position);
        view.scene.add(sprite);
        sprite.updateMatrixWorld(true);
        view.notifyChange();
    });
}