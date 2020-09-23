import { PerspectiveCamera, CameraHelper, Color, Vector3, Box3, Box3Helper, Matrix4, Object3D, Plane, Line3, AxesHelper, ArrowHelper, PlaneHelper } from 'three';
import Coordinates from 'Core/Geographic/Coordinates';
import { MAIN_LOOP_EVENTS } from 'Core/MainLoop';
import OBB from 'Renderer/OBB';
import ThreeStatsChart from './charts/ThreeStatsChart';
import { backgroundChartDiv, color_blue } from './charts/ChartConfig';
import OBBHelper from './OBBHelper';

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
        chartDivContainer.style.cssText = `z-index: 10; position: absolute; bottom: 0; left: 0; width: 100vw; height: 30%; background-color: ${backgroundChartDiv}; display: none`;
        document.body.appendChild(chartDivContainer);
    }

    this.chartDivContainer = chartDivContainer;
    const canvas = this.createChartContainer('three-info');

    var ctx = canvas.getContext('2d');

    this.charts = [];

    this.charts.push(new ThreeStatsChart(ctx, view.mainLoop.gfxEngine.renderer));

    const charts = this.charts;
    const tileLayer = view.tileLayer;
    const initialPosition = new Coordinates(view.referenceCrs, 0.0, 0.0, 0.0);
    const geoPosition = new Coordinates('EPSG:4326', 0.0, 0.0, 0.0);

    function debugChartUpdate(updateDuration) {
        const displayed = chartDivContainer.style.display != 'none';
        charts.forEach(c => c.update(displayed, updateDuration));
    }

    // DEBUG CONTROLS
    const gui = datDebugTool.addFolder('Debug Tools');

    const state = {
        displayCharts: false,
        eventsDebug: false,
        debugCameraWindow: true,
        freeze: false,
    };

    let before;
    const startChart = () => {
        before = Date.now();
    };
    const endChart = () => {
        const duration = Date.now() - before;
        // debug graphs update
        debugChartUpdate(duration);
    };

    // charts
    gui.add(state, 'displayCharts').name('Display charts').onChange((newValue) => {
        if (newValue) {
            view.addFrameRequester(MAIN_LOOP_EVENTS.UPDATE_START, startChart);
            view.addFrameRequester(MAIN_LOOP_EVENTS.UPDATE_END, endChart);
            chartDivContainer.style.display = 'flex';
        } else {
            view.removeFrameRequester(MAIN_LOOP_EVENTS.UPDATE_START, startChart);
            view.removeFrameRequester(MAIN_LOOP_EVENTS.UPDATE_END, endChart);
            chartDivContainer.style.display = 'none';
        }
        this.updateChartDivSize();
        view.notifyChange();
    });

    gui.add(state, 'debugCameraWindow').name('debug Camera').onChange((value) => {
        if (value) {
            view.addFrameRequester(MAIN_LOOP_EVENTS.AFTER_RENDER, renderCameraDebug);
        } else {
            view.removeFrameRequester(MAIN_LOOP_EVENTS.AFTER_RENDER, renderCameraDebug);
        }
        view.notifyChange();
    });

    view.addFrameRequester(MAIN_LOOP_EVENTS.AFTER_RENDER, renderCameraDebug);
    view.notifyChange();

    gui.add(state, 'freeze').name('freeze update').onChange((newValue) => {
        tileLayer.frozen = newValue;
        view.notifyChange();
    });

    // camera-target-updated event
    let LatController;
    let LongController;
    let eventFolder;
    const controls = view.controls;
    initialPosition.crs = view.referenceCrs;

    const getCenter = (controls && controls.getCameraTargetPosition) ? controls.getCameraTargetPosition : () => view.camera.camera3D.position;
    const cameraTargetListener = () => {
        initialPosition.setFromVector3(getCenter()).as('EPSG:4326', geoPosition);
        state.latitude = `${geoPosition.y.toFixed(6)}`;
        state.longitude = `${geoPosition.x.toFixed(6)}`;
        LatController.updateDisplay();
        LongController.updateDisplay();
    };

    gui.add(state, 'eventsDebug').name('Debug event').onChange((() => (newValue) => {
        const listeners = [];
        if (newValue) {
            eventFolder = gui.addFolder('Events');
            eventFolder.open();

            initialPosition.setFromVector3(getCenter()).as('EPSG:4326', geoPosition);
            state.latitude = `${geoPosition.y.toFixed(6)}`;
            state.longitude = `${geoPosition.x.toFixed(6)}`;
            LatController = eventFolder.add(state, 'latitude');
            LongController = eventFolder.add(state, 'longitude');

            view.addFrameRequester(MAIN_LOOP_EVENTS.UPDATE_END, cameraTargetListener);
            listeners.push({ type: MAIN_LOOP_EVENTS.UPDATE_END, stateName: 'cameraTargetUpdated', fn: cameraTargetListener });
        } else {
            for (const listener of listeners) {
                controls.removeFrameRequester(listener.type, listener.fn);
                delete state[listener.stateName];
            }
            gui.removeFolder('Events');
        }
    })());

    // Camera debug
    const perspectiveCamera = new PerspectiveCamera();
    // const helper = new CameraHelper(view.camera.camera3D);
    const helper = new CameraHelper(perspectiveCamera);
    const boxNearFar = new Box3();
    const boxNearFarHelper = new Box3Helper(boxNearFar);
    const matrix = new Matrix4();
    const cameraFake = new Object3D();
    const debugCamera = view.camera.camera3D.clone();
    debugCamera.fov *= 1.5;
    debugCamera.far *= 3;
    debugCamera.updateProjectionMatrix();
    const g = view.mainLoop.gfxEngine;
    const r = g.renderer;
    let fogDistance = 10e10;
    const layerAtmosphere = view.getLayerById('atmosphere');
    if (layerAtmosphere) {
        fogDistance = layerAtmosphere.fog.distance;
    }
    helper.visible = false;
    view.scene.add(helper);
    view.scene.add(perspectiveCamera);

    // Displayed tiles boundind box
    const displayedTilesObb = new OBB();
    const displayedTilesObbHelper = new OBBHelper(displayedTilesObb, '', new Color(color_blue));
    displayedTilesObbHelper.visible = false;

    view.scene.add(displayedTilesObb);
    view.scene.add(displayedTilesObbHelper);
    view.scene.add(cameraFake);
    cameraFake.add(boxNearFarHelper);

    const axes = new AxesHelper(1000000);
    view.scene.add(axes);

    const line3 = new Line3();
    // const intersectionPlane = new Vector3();

    const plane = new Plane(new Vector3(0, 0, 1));

    // const planeHelper = new PlaneHelper(plane, 10000000, 0xffff00);
    // const arrow = new ArrowHelper();
    // arrow.setLength(10000000);

    // displayedTilesObb.add(planeHelper);
    // displayedTilesObb.add(arrow);

    function updateFogDistance(obj) {
        if (obj.material && fogDistance) {
            obj.material.fogDistance = fogDistance;
        }
    }
    const position = new Vector3();
    const bClearColor = new Color();
    const lookAtCameraDebug = new Vector3();
    function renderCameraDebug() {
        if (state.debugCameraWindow && debugCamera) {
            const ratio = 0.45;
            const size = { x: g.width * ratio, y: g.height * ratio };
            debugCamera.aspect = size.x / size.y;
            const camera = view.camera.camera3D;

            perspectiveCamera.copy(camera);
            const { near, far } = view.tileLayer.info.getNearFar(perspectiveCamera);
            perspectiveCamera.far = Math.min(far, camera.far);
            perspectiveCamera.near = Math.max(near, camera.near);
            perspectiveCamera.updateProjectionMatrix();
            const coord = new Coordinates(view.referenceCrs, camera.position).as(tileLayer.extent.crs);
            const extent = view.tileLayer.info.displayed.extent;
            if (extent.west != Infinity) {
                displayedTilesObb.setFromExtent(extent);
                displayedTilesObbHelper.visible = true;
                displayedTilesObbHelper.updateMatrixWorld(true);

                // Note Method to compute near and far
                // * With bounding box transformation
                boxNearFar.copy(displayedTilesObb.box3D);
                matrix.multiplyMatrices(camera.matrixWorldInverse, displayedTilesObb.matrixWorld);
                boxNearFar.applyMatrix4(matrix);
                // boxNearFarHelper.visible = true;
                boxNearFarHelper.updateMatrixWorld(true);
                cameraFake.position.copy(camera.position);
                cameraFake.quaternion.copy(camera.quaternion);
                cameraFake.updateMatrixWorld(true);
                boxNearFarHelper.updateMatrixWorld(true);

                // * With bounding box and intersection Line
                matrix.getInverse(displayedTilesObb.matrixWorld);
                line3.start.copy(camera.position);
                line3.end.set(1, -1, 1).unproject(camera);
                line3.applyMatrix4(matrix);
                plane.intersectLine(line3, axes.position);

                // position.subVectors(line3.end, line3.start);
                // arrow.position.copy(line3.start);
                // arrow.setDirection(position.normalize());
                // arrow.updateMatrixWorld(true);
                const focale = (g.height * 0.5) / Math.tan(camera.fov * Math.PI / 180 * 0.5);
                const horizontalFOV = 2 * Math.atan(g.width * 0.5 / focale);

                displayedTilesObb.localToWorld(axes.position);
                const length = axes.position.distanceTo(camera.position) * Math.cos(camera.fov * Math.PI / 180) * Math.cos(horizontalFOV);
                perspectiveCamera.near = length;
                perspectiveCamera.updateProjectionMatrix();
                axes.updateMatrix();
                axes.updateMatrixWorld(true);
            }

            // Compute position camera debug
            const altitudeCameraDebug = 1.5 * coord.z;
            coord.z = altitudeCameraDebug;
            coord.as(view.referenceCrs).toVector3(debugCamera.position);
            // Compute recoil camera
            camera.worldToLocal(debugCamera.position);
            debugCamera.position.z += altitudeCameraDebug;
            debugCamera.position.x += 2 * altitudeCameraDebug;
            camera.localToWorld(debugCamera.position);
            // Compute target camera debug
            lookAtCameraDebug.copy(camera.position);
            camera.worldToLocal(lookAtCameraDebug);
            lookAtCameraDebug.z -= altitudeCameraDebug * 1.5;
            camera.localToWorld(lookAtCameraDebug);
            debugCamera.lookAt(lookAtCameraDebug);

            debugCamera.updateProjectionMatrix();
            if (layerAtmosphere) {
                layerAtmosphere.object3d.visible = false;
                fogDistance = 10e10;
                for (const obj of tileLayer.level0Nodes) {
                    obj.traverseVisible(updateFogDistance);
                }
            }

            const deltaY = state.displayCharts ? Math.round(parseFloat(chartDivContainer.style.height.replace('%', '')) * g.height / 100) + 3 : 0;
            helper.visible = true;
            helper.update();
            helper.updateMatrixWorld(true);
            bClearColor.copy(r.getClearColor());
            r.setViewport(g.width - size.x, deltaY, size.x, size.y);
            r.setScissor(g.width - size.x, deltaY, size.x, size.y);
            r.setScissorTest(true);
            r.setClearColor(backgroundChartDiv);
            r.clear();
            r.render(view.scene, debugCamera);
            r.setScissorTest(false);
            r.setClearColor(bClearColor);
            r.setViewport(0, 0, g.width, g.height);

            helper.visible = false;
            displayedTilesObbHelper.visible = false;
            boxNearFarHelper.visible = false;
            if (layerAtmosphere) {
                layerAtmosphere.object3d.visible = true;
            }
            if (layerAtmosphere) {
                fogDistance = layerAtmosphere.fog.distance;
                for (const obj of tileLayer.level0Nodes) {
                    obj.traverseVisible(updateFogDistance);
                }
            }
        }
    }
}


Debug.prototype.createChartContainer = function createChartContainer(chartId) {
    const div = document.createElement('div');
    div.style.cssText = `background-color: ${backgroundChartDiv}; flex: auto;`;
    this.chartDivContainer.appendChild(div);

    const chartCanvas = document.createElement('canvas');
    chartCanvas.height = '20rem';
    chartCanvas.id = chartId;
    div.appendChild(chartCanvas);
    return chartCanvas;
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
