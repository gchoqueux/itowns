import { Vector4, Mesh, PlaneGeometry, TextureLoader, DataTexture, RGBAFormat, SphereGeometry } from 'three';
import { Parsers } from 'photogrammetric-camera';
import ProjectingTexturePointsMaterial from 'Renderer/ProjectingTexturePointsMaterial';
import Fetcher from 'Provider/Fetcher';
import ColorLayer from 'Layer/ColorLayer';
import { RasterColorTile } from 'Renderer/RasterTile';
import Source from 'Source/Source';

const textureLoader = new TextureLoader();
const uvTexture = textureLoader.load('./images/uv.jpg');
uvTexture.name = 'uv';
const whiteData = new Uint8Array(4);
whiteData.set([255, 255, 255, 255]);
const whiteTexture = new DataTexture(whiteData, 1, 1, RGBAFormat);
whiteTexture.name = 'white';
whiteTexture.needsUpdate = true;

class PhotoGLayer {
    async init(path, fileProject) {
        this.projectFile = await Fetcher.json(path + fileProject);

        const oriUrl = this.projectFile.ori[0];
        const imgUrl = this.projectFile.img[0];

        const orientationXML = await Fetcher.text(this.projectFile.url + oriUrl);

        this.camera = await Parsers.MicmacParser.load(orientationXML, this.projectFile.url, imgUrl);

        this.material = new ProjectingTexturePointsMaterial({
            map: uvTexture,
            size: 3,
        });

        const urlImage = this.projectFile.url + this.projectFile.img[0];

        await textureLoader.load(urlImage, (texture) => {
            this.material.map = texture;
        });

        this.material.setCamera(this.camera);
        const sphereRadius = 5000;

        this.material.depthMap = whiteTexture;

        this.plane = new Mesh(new PlaneGeometry(50, 50, 100, 100), this.material);
        this.plane = new Mesh(new PlaneGeometry(1000, 1000, 100, 100), this.material);
        this.sphere = new Mesh(new SphereGeometry(-1, 32, 32), this.material);
        this.sphere.scale.set(sphereRadius, sphereRadius, sphereRadius);

        return this.camera;
    }
}

export class PhotogrammetricCameraSource extends Source {
    constructor(source) {
        super(source);

        const { path, fileProject } = source;
        this.zoom = { min: 0, max: 24 };

        this.whenReady = Fetcher.json(path + fileProject, this.networkOptions).then((f) => {
            this.fetchedData = f;
            this.urlImage = f.url + f.img[0];
        });
    }

    extentInsideLimit() {
        // to do compute extent projected
        return true;
    }

    urlFromExtent() {
        return this.urlImage;
    }
}

export class ColorProjectingLayer extends ColorLayer {
    // This class extends ColorLayer to create a layer that projects color textures
    // onto a 3D surface using photogrammetric data.
    constructor(id, config) {
        super(id, config);
        this.isColorProjectingLayer = true;

        this.photoGLayer = config.photoGLayer;

        this.zoom = { min: 0, max: 24 };
    }

    // setupRasterNode(node) {
    //     if (!this.rasterColorNode) {
    //         this.rasterColorNode = new RasterColorTile(this);
    //     }

    //     node.material.addLayer(this.rasterColorNode);
    //     // set up ColorLayer ordering.
    //     node.material.setSequence(this.parent.colorLayersOrder);

    //     this.rasterColorNode.needsUpdate = true;

    //     return this.rasterColorNode;
    // }

    update(context, layer, node, parent) {
        const promise = super.update(context, layer, node, parent);

        if (promise) {
            promise.then(() => {
                node.material.setCamera(this.photoGLayer.camera);
                console.log('this.photoGLayer.camera', this.photoGLayer.camera);
            });
        }

        // .then(a => console.log(a));
/*
        if (this.rasterColorNode && !node.material.map && this.photoGLayer.material.map.name !== 'uv') {
            // node.material.depthMap = whiteTexture;
            // node.material.map = this.photoGLayer.material.map;
            // this.rasterColorNode.setTextures([this.photoGLayer.material.map, whiteTexture], [new Vector4(), new Vector4()]);
            // node.material.addLayer(this.rasterColorNode);
        }
*/
    }
}

export default PhotoGLayer;



