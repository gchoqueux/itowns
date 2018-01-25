import * as THREE from 'three';
import Coordinates from '../../src/Core/Geographic/Coordinates';
import ThreeStatsChart from './charts/ThreeStatsChart';

/**
 * Create a debug instance attached to an itowns instance
 *
 * @Constructor
 * @param {Scene} scene the itowns Scene
 * @return {Debug} a debug instance
 */

// disabling eslint errors as it is the exported constructor
function Debug(view, datDebugTool, chartDivContainer) {
    // CHARTS
    // Create default charts div if missing
    if (!chartDivContainer) {
        chartDivContainer = document.createElement('div');
        chartDivContainer.id = 'chart-div';
        chartDivContainer.style.cssText = 'position: absolute; bottom: 0; left: 0; width: 100vw; height: 20rem; background-color: white; display: none';
        document.body.appendChild(chartDivContainer);
    }

    this.chartDivContainer = chartDivContainer;
    this.createChartContainer('three-info');

    this.charts = [];

    this.charts.push(new ThreeStatsChart('three-info', view.mainLoop.gfxEngine.renderer));

    const charts = this.charts;
    const tileLayer = view.tileLayer || view.wgs84TileLayer || view.baseLayer;

    function debugChartUpdate(updateDuration) {
        const displayed = chartDivContainer.style.display != 'none';
        charts.forEach(c => c.update(displayed, updateDuration));
    }

    // DEBUG CONTROLS
    const gui = datDebugTool.addFolder('Debug Tools');

    const state = {
        displayCharts: false,
        eventsDebug: false,
        debugCameraWindow: false,
        freeze: false,
    };

    // charts
    gui.add(state, 'displayCharts').name('Display charts').onChange((newValue) => {
        if (newValue) {
            chartDivContainer.style.display = 'flex';
        } else {
            chartDivContainer.style.display = 'none';
        }
    });

    gui.add(state, 'debugCameraWindow').name('debug Camera').onChange(() => {
        view.notifyChange(true);
    });


    let update = tileLayer.update;
    gui.add(state, 'freeze').name('freeze update').onChange((newValue) => {
        if (newValue) {
            update = tileLayer.update;
            tileLayer.update = () => {};
        } else {
            tileLayer.update = update;
            view.notifyChange(true);
        }
    });

    gui.add(state, 'eventsDebug').name('Debug event').onChange((() => {
        let eventFolder;
        return (newValue) => {
            const controls = view.controls;
            const listeners = [];
            if (newValue) {
                eventFolder = gui.addFolder('Events');

                // camera-target-updated event
                const initialPosition = new Coordinates(view.referenceCrs, controls.getCameraTargetPosition()).as('EPSG:4326');
                const roundedLat = Math.round(initialPosition.latitude() * 10000) / 10000;
                const roundedLon = Math.round(initialPosition.longitude() * 10000) / 10000;
                state.cameraTargetUpdated = `lat: ${roundedLat} lon: ${roundedLon}`;
                const cameraTargetUpdatedController = eventFolder.add(state, 'cameraTargetUpdated').name('camera-target-changed');
                const cameraTargetListener = (ev) => {
                    const positionGeo = ev.new.cameraTarget.as('EPSG:4326');
                    const roundedLat = Math.round(positionGeo.latitude() * 10000) / 10000;
                    const roundedLon = Math.round(positionGeo.longitude() * 10000) / 10000;
                    state.cameraTargetUpdated = `lat: ${roundedLat} lon: ${roundedLon}`;
                    cameraTargetUpdatedController.updateDisplay();
                };
                controls.addEventListener('camera-target-changed', cameraTargetListener);
                listeners.push({ type: 'camera-target-changed', stateName: 'cameraTargetUpdated', fn: cameraTargetListener });
            } else {
                for (const listener of listeners) {
                    controls.removeEventListener(listener.type, listener.fn);
                    delete state[listener.stateName];
                }
                gui.removeFolder('Events');
            }
        };
    })());

    // hook that to scene.update
    const ml = view.mainLoop;
    const oldUpdate = Object.getPrototypeOf(ml)._update.bind(ml);
    ml._update = function debugUpdate(view, ...args) {
        // regular itowns update
        const before = Date.now();
        oldUpdate(view, ...args);
        const duration = Date.now() - before;
        // debug graphs update
        debugChartUpdate(duration);
    };

    // Camera debug
    const g = view.mainLoop.gfxEngine;
    const r = g.renderer;
    const gl = r.context;
    // let fogDistance = view.fogDistance;

    const sceneStencil = new THREE.Scene();

    var loader = new THREE.FontLoader();

    loader.load('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/fonts/helvetiker_regular.typeface.json', (font) => {

        // THREE.FrontSide
        // THREE.BackSide
        // THREE.DoubleSide

        // const geometry2 = new THREE.CylinderGeometry(1000000, 1000000, 100000000, 32);
        // const material2 = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        // material2.side = THREE.DoubleSide;
        // const cyl = new THREE.Mesh(geometry2, material2);
        // cyl.position.set(5000000, 0, 0);

        // cyl.rotateZ(Math.PI * 0.5);
        // cyl.updateMatrix();
        // cyl.updateMatrixWorld(true);
        // cyl.matrixAutoUpdate = false;

        // sceneStencil.add(cyl);
        // view.scene.add(cyl);


        // const geometry = new THREE.SphereGeometry(3000000, 128, 128);
        // const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        // const text = new THREE.Mesh(geometry, material);
        // text.position.set(5000000, 0, 0);
        // const scale = 1;
        // text.scale.set(scale, scale, scale);
        // text.updateMatrix();
        // text.updateMatrixWorld(true);
        // text.matrixAutoUpdate = false;

        const geometry = new THREE.TextGeometry('ITOWNS', {
            font,
            size: 80,
            height: 1000,
            curveSegments: 12,
            bevelEnabled: false,
        });
        const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        material.side = THREE.BackSide;
        const text = new THREE.Mesh(geometry, material);
        text.position.set(5000000, -1800000, 0);
        text.rotateY(Math.PI * 0.5);
        text.rotateZ(Math.PI * 0.5);
        const scale = 10000;
        text.scale.set(scale, scale, scale);
        text.updateMatrix();
        text.updateMatrixWorld(true);
        text.matrixAutoUpdate = false;

        sceneStencil.add(text);
        // view.scene.add(text);
    });


    view.atmosphere.visible = false;
    tileLayer.disableSkirt = true;

    view.render = function render() {
        r.clear();

        // enable stencil test
        r.state.buffers.stencil.setTest(true);
        r.setViewport(0, 0, g.width, g.height);

        r.setFaceCulling(THREE.CullFaceBack);
        r.state.buffers.stencil.setFunc(gl.ALWAYS, 1, 0xff);
        r.state.buffers.stencil.setOp(gl.KEEP, gl.KEEP, gl.INCR);
        r.render(view.scene, view.camera.camera3D);

        r.setFaceCulling(THREE.CullFaceFront);
        r.state.buffers.stencil.setFunc(gl.EQUAL, 1, 0xff);
        r.state.buffers.stencil.setOp(gl.KEEP, gl.KEEP, gl.DECR);
        r.render(sceneStencil, view.camera.camera3D);

        r.clear(true, true, false);
        r.setFaceCulling(THREE.CullFaceBack);
        r.state.buffers.stencil.setFunc(gl.EQUAL, 1, 0xff);
        r.state.buffers.stencil.setOp(gl.KEEP, gl.KEEP, gl.KEEP);
        r.render(sceneStencil, view.camera.camera3D);

        r.state.buffers.stencil.setTest(false);
        r.setFaceCulling(THREE.CullFaceBack);
        r.render(view.scene, view.camera.camera3D);
    };


    const composer = new THREE.EffectComposer(r);
    composer.addPass(new THREE.RenderPass(view.scene, view.camera.camera3D));

    const effect = new THREE.ShaderPass(THREE.CopyShader);
    effect.renderToScreen = true;
    composer.addPass(effect);

    r.setSize(g.width, g.height);
    composer.setSize(g.width, g.height);
}


Debug.prototype.createChartContainer = function createChartContainer(chartId) {
    const div = document.createElement('div');
    div.style.cssText = 'width: 100%; height: 100%; background-color: white;';
    this.chartDivContainer.appendChild(div);

    const chartCanvas = document.createElement('canvas');
    chartCanvas.height = '20rem';
    chartCanvas.id = chartId;
    div.appendChild(chartCanvas);
};

Debug.prototype.updateChartDivSize = function updateChartDivSize() {
    let count = 0;
    for (const div of this.chartDivContainer.getElementsByTagName('div')) {
        if (div.style.display !== 'none') {
            count++;
        }
    }
    const size = Math.floor(100 / count);
    for (const div of this.chartDivContainer.getElementsByTagName('div')) {
        if (div.style.display !== 'none') {
            div.style.width = `${size}%`;
        }
    }
    this.charts.forEach((c) => {
        c.resize();
        c.update();
    });
};

export default Debug;
