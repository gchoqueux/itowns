import * as THREE from 'three';
import mapboxgl from 'mapbox-gl';

class mapboxSprite {
    constructor(view, coord) {
        this.id = 'mycustomlayer';
        this.type = 'custom';
        this.renderingMode = '3d';
        this.view = view;
        this.coord = coord;
    }

    onAdd(map, gl) {
        this.gl = gl;
        this.map = map;
        const width = map.painter.width;
        const height = map.painter.height;
        this.dataTexture = new Uint8Array(width * height * 4);

        this.textureTarget = new THREE.DataTexture(this.dataTexture, width, height, THREE.RGBAFormat);
        this.textureTarget.needsUpdate = true;

        const material = new THREE.SpriteMaterial({ map: this.textureTarget, sizeAttenuation: false });
        material.transparent = true;
        material.opacity = 1;
        this.sprite = new THREE.Sprite(material);
        const scale = 1 / this.view.mainLoop.gfxEngine.height / 1.859756098;
        this.sprite.scale.set(width * scale, height * scale, 1);

        this.coord.as(this.view.referenceCrs).xyz(this.sprite.position);
        this.view.scene.add(this.sprite);
        this.sprite.updateMatrixWorld(true);
    }
    // eslint-disable-next-line
    render() { }

    update() {
        if (this.gl && this.dataTexture) {
            const width = this.map.painter.width;
            const height = this.map.painter.height;

            // this.gl.activeTexture(this.gl.TEXTURE0);
            // this.gl.bindTexture(this.gl.TEXTURE_2D, this.renderer.properties.get(texture).__webglTexture);
            // this.gl.copyTexImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, 0, 0, width, height, 0);
            this.gl.readPixels(0, 0, width, height, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.dataTexture);
            this.textureTarget.needsUpdate = true;
            this.view.mainLoop.gfxEngine.renderer.render(this.view.scene, this.view.camera.camera3D);
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
    // mapDiv.style.marginTop = '-1em';
    // mapDiv.style.display = 'inline-block';
    mapboxgl.accessToken = 'pk.eyJ1IjoiZ2Nob3F1ZXV4IiwiYSI6ImNqcnc4cjIwajA5ZHQ0OW5oMzBpb3dlaTMifQ.MVueqWYTZYHzjfxBywxiZw';
    const map = new mapboxgl.Map({
        container: 'map', // container id
        style: 'styleIGN.json',
        // style: 'mapbox://styles/mapbox/dark-v9', // stylesheet location
        center: [coord.longitude(), coord.latitude()], // starting position [lng, lat]
        zoom: 15, // starting zoom
    });
    map.on('load', () => {
        const sprite = new mapboxSprite(view, coord);
        map.addLayer(sprite);
        map.on('render', () => {
            sprite.update();
        });
    });

    return map;
}
