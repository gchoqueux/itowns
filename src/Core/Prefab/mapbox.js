import * as THREE from 'three';
import mapboxgl from 'mapbox-gl';
import Coordinates from 'Core/Geographic/Coordinates';
import ColorLayer from 'Layer/ColorLayer';
import { ImageryLayers } from 'Layer/Layer';
import SIGUtils from 'Utils/SIGUtils';
import { CONTROL_EVENTS } from 'Controls/GlobeControls';


mapboxgl.workerCount = 6;

const coords = new Coordinates('EPSG:4326', 0, 0, 0);
const p1 = new THREE.Vector3();
const p2 = new THREE.Vector3();

class mapboxHook {
    constructor(view, coord) {
        this.id = 'mycustomlayer';
        this.type = 'custom';
        this.renderingMode = '3d';
        this.view = view;
        this.coord = coord;
        this.newSize = new THREE.Vector2();
        this.current = 0;
    }

    getCurrentData() { return this.dataTexture[this.current]; }

    getFreeData() { return this.dataTexture[1 - this.current]; }

    getCurrentTexture() { return this.textureTarget[this.current]; }

    getFreeTexture() { return this.textureTarget[1 - this.current]; }

    switch() { this.current = 1 - this.current; }

    onAdd(map, gl) {
        this.gl = gl;
        this.map = map;
        const width = map.painter.width;
        const height = map.painter.height;
        this.dataTexture = [new Uint8Array(width * height * 4), new Uint8Array(width * height * 4)];
        this.textureTarget = [];

        this.textureTarget[0] = new THREE.DataTexture(this.dataTexture[0], width, height, THREE.RGBAFormat);
        this.textureTarget[0].magFilter = THREE.LinearFilter;
        this.textureTarget[0].minFilter = THREE.LinearFilter;
        this.textureTarget[0].generateMipmaps = false;
        this.textureTarget[0].anisotropy = 16;
        this.textureTarget[0].needsUpdate = true;
        this.textureTarget[0].coords = { zoom: 20 };

        this.textureTarget[0].newSize = new THREE.Vector2();

        this.textureTarget[1] = new THREE.DataTexture(this.dataTexture[1], width, height, THREE.RGBAFormat);
        this.textureTarget[1].magFilter = THREE.LinearFilter;
        this.textureTarget[1].minFilter = THREE.LinearFilter;
        this.textureTarget[1].generateMipmaps = false;
        this.textureTarget[1].needsUpdate = true;
        this.textureTarget[1].anisotropy = 16;
        this.textureTarget[1].coords = { zoom: 20 };
        this.textureTarget[1].newSize = new THREE.Vector2();
    }
    // eslint-disable-next-line
    render() { }

    update() {
        if (this.gl && this.dataTexture) {
            const width = this.map.painter.width;
            const height = this.map.painter.height;

            const bound = this.map.getBounds();
            coords.set('EPSG:4326', bound.getNorthWest().lng, bound.getNorthWest().lat, 0).as(this.view.referenceCrs).xyz(p1);
            coords.set('EPSG:4326', bound.getSouthWest().lng, bound.getSouthWest().lat, 0).as(this.view.referenceCrs).xyz(p2);
            this.getFreeTexture().newSize.y = p1.distanceTo(p2);

            coords.set('EPSG:4326', bound.getNorthEast().lng, bound.getNorthEast().lat, 0).as(this.view.referenceCrs).xyz(p2);
            this.getFreeTexture().newSize.x = p1.distanceTo(p2);
            this.getFreeTexture().center = this.map.getCenter();
            this.getFreeTexture().bearing = this.map.getBearing();

            // this.gl.activeTexture(this.gl.TEXTURE0);
            // this.gl.bindTexture(this.gl.TEXTURE_2D, this.renderer.properties.get(texture).__webglTexture);
            // this.gl.copyTexImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, 0, 0, width, height, 0);
            this.gl.readPixels(0, 0, width, height, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.getFreeData());
            this.getFreeTexture().needsUpdate = true;
            this.view.notifyChange(this.view.camera.camera3D);
            // this.view.mainLoop.gfxEngine.renderer.clear(true, true, false);
            // this.view.mainLoop.gfxEngine.renderer.render(this.view.scene, this.view.camera.camera3D);
            // this.gl.activeTexture(this.gl.TEXTURE0);
            // this.gl.bindTexture(this.gl.TEXTURE_2D, null);
            // texture.needsUpdate = true;
        }
    }
}

export default function createMapbox(view, coord) {
    const mapDiv = document.createElement('div');
    mapDiv.setAttribute('id', 'map');
    document.getElementsByTagName('BODY')[0].append(mapDiv);
    mapDiv.className = 'label';
    mapboxgl.accessToken = 'pk.eyJ1IjoiZ2Nob3F1ZXV4IiwiYSI6ImNqcnc4cjIwajA5ZHQ0OW5oMzBpb3dlaTMifQ.MVueqWYTZYHzjfxBywxiZw';
    const map = new mapboxgl.Map({
        container: 'map', // container id
        // style: 'styleIGN.json',
        style: 'style_itowns_modif.json',
        // style: 'mapbox://styles/mapbox/dark-v9',
        // style: 'mapbox://styles/mapbox/basic-v9',
        center: [coord.longitude(), coord.latitude()],
        // bounds,
        zoom: 16, // starting zoom
    });
    map.on('load', () => {
        map.hook = new mapboxHook(view, coord);
        map.addLayer(map.hook);
        map.on('render', () => {
            map.hook.update();
        });
    });

    return map;
}

const size = new THREE.Vector2();
const c4 = new Coordinates('EPSG:4326', 0, 0, 0);
const euler = new THREE.Euler(0, 0, -Math.PI * 0.5, 'ZXY');

export class colorMapBoxLayer extends ColorLayer {
    constructor(id, options) {
        super(id, options);
        const size = 1024;
        this.camera = new THREE.OrthographicCamera(-0.5 * size, 0.5 * size, 0.5 * size, -0.5 * size, 1, 30000);
        this.camera.position.set(0, 0, 500);
        this.camera.lookAt(new THREE.Vector3());
        this.target = new THREE.AxesHelper(50);

        this.target.up.set(0, 0, 1);
        SIGUtils.placeOnGround(options.view, this.target, options.c1, euler);

        const geometry = new THREE.PlaneGeometry(size, size, 2, 2);
        const material = new THREE.MeshBasicMaterial({ color: 0x888888, side: THREE.DoubleSide, wireframe: true });
        material.transparent = true;
        material.opacity = 0.75;
        const plane = new THREE.Mesh(geometry, material);
        plane.position.set(0, 0, 10);

        this.target.add(this.camera);
        this.target.add(plane);

        options.view.scene.add(this.target);

        this.cameraHelper = new THREE.CameraHelper(this.camera);

        options.view.scene.add(this.cameraHelper);
        this.cameraHelper.updateMatrixWorld(true);
        this.target.updateMatrixWorld(true);
        this.camera.updateMatrixWorld(true);
        plane.updateMatrixWorld(true);

        this.target.visible = false;
        plane.visible = false;
        this.cameraHelper.visible = false;

        this.map = options.map;
        this.backgroundColor = new THREE.Color();

        const syncMapbox = (e) => {
            const zoom = options.view.tileLayer.computeTileZoomFromDistanceCamera(e.range, options.view.camera);
            this.map.setZoom(zoom * 0.98 - 0.15);
            this.map.setCenter([e.coord.longitude(), e.coord.latitude()]);
            this.map.setBearing(-e.heading);
        };

        const resfresh = () => {
            if (this.map.loaded()) {
                this.backgroundColor.set(this.map.getStyle().layers[0].paint['background-color']);
                syncMapbox({ range: options.view.controls.getRange(), coord: options.c1, heading: 0 });
                this.map.off('render', resfresh);
            }
        };

        this.map.on('render', resfresh);

        options.view.controls.addEventListener(CONTROL_EVENTS.CAMERA_CHANGED, syncMapbox);
    }
    preUpdate(context) {
        if (this.map.hook) {
            this.map.hook.switch();
            // if (map.hook.getCurrentTexture().newSize.x != size.x) {

            const currentTexture = this.map.hook.getCurrentTexture();
            const bearing = currentTexture.bearing;
            const aBea = Math.abs(bearing);
            const angle = THREE.Math.degToRad(aBea > 90 ? 180 - aBea : aBea);

            // angle = angle > 90 ? 180 - (angle - 90) : angle;
            // const scale = (1 / (Math.cos(angle) + Math.sin(angle)));
            const width = this.map.painter.width;
            const height = this.map.painter.height;
            const r = height / width;

            size.copy(currentTexture.newSize);
            size.x /= (Math.cos(angle) + r * Math.sin(angle));
            size.y = r * size.x;

            this.camera.left = -size.x * 0.5;
            this.camera.right = size.x * 0.5;
            this.camera.top = size.y * 0.5;
            this.camera.bottom = -size.y * 0.5;
            this.camera.near = 0.1;
            this.camera.far = size.x * 2;
            this.camera.position.set(0, 0, size.x);

            // update center
            const center = currentTexture.center;
            c4.set('EPSG:4326', center.lng, center.lat);
            SIGUtils.placeOnGround(context.view, this.target, c4, euler);

            this.camera.rotation.z = THREE.Math.degToRad(-bearing + 90);

            this.camera.updateProjectionMatrix();
            this.camera.updateMatrixWorld(true);
            this.cameraHelper.update();
            // const b = bearing || 0;
            // const a = THREE.Math.radToDeg(angle) || 0;
        }
        const colorLayers = context.view.getLayers(l => l.isColorLayer);
        this.sequence = ImageryLayers.getColorLayersIdOrderedBySequence(colorLayers);
    }
    update(context, layer, node) {
        if (this.map.hook) {
            let nodeLayer = node.material.getLayer(layer.id);
            if (!nodeLayer) {
                // Create new MaterialLayer
                const tileMT = layer.source.tileMatrixSet;
                nodeLayer = node.material.addLayer(layer, tileMT);
                node.material.setSequence(this.sequence);
            }

            nodeLayer.setTexture(0, this.map.hook.getCurrentTexture(), new THREE.Vector4(0.0, 0.0, 1.0, 1.0));
            nodeLayer.visible = layer.visible;
            nodeLayer.opacity = layer.opacity;

            // const uniforms = node.material.uniforms;
            node.material.modelProjectionMatrix.multiplyMatrices(this.camera.matrixWorldInverse, node.matrixWorld);
            node.material.projectionImage = this.camera.projectionMatrix;
            node.material.diffuse = this.backgroundColor;
        }
    }
}
