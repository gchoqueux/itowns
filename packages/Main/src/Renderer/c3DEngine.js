/**
 * Generated On: 2015-10-5
 * Class: c3DEngine
 * Description: 3DEngine est l'interface avec le framework webGL (WebGPU).
 */

import * as THREE from 'three';
import { WebGPURenderer } from 'three/webgpu';
import Capabilities from 'Core/System/Capabilities';
import { unpack1K } from 'Renderer/LayeredMaterial';
import Label2DRenderer from 'Renderer/Label2DRenderer';
import { deprecatedC3DEngineWebGLOptions } from 'Core/Deprecated/Undeprecator';

/**
 * Minimal stub maintaining the EffectComposer API surface.
 * Full effect pass support requires migrating to Three.js PostProcessing API.
 * @private
 */
class WebGPUComposerStub {
    constructor() {
        this.passes = [];
    }
    addPass(pass) {
        this.passes.push(pass);
        console.warn(
            'c3DEngine: postprocessing v6 is not compatible with WebGPURenderer. '
            + 'Custom effect passes will not render. '
            + 'Migrate to the Three.js PostProcessing API (three/webgpu).',
        );
    }
    render() { /* handled directly by renderView */ }
    setSize() { /* no-op */ }
    dispose() { /* no-op */ }
}

const depthRGBA = new THREE.Vector4();
class c3DEngine {
    constructor(rendererOrDiv, options = {}) {
        deprecatedC3DEngineWebGLOptions(options);

        // pick sensible default options
        if (options.antialias === undefined) {
            options.antialias = true;
        }
        if (options.alpha === undefined) {
            options.alpha = true;
        }
        if (options.logarithmicDepthBuffer === undefined) {
            options.logarithmicDepthBuffer = true;
        }

        // If rendererOrDiv parameter is a domElement, we use it as support to display data.
        // If it is a renderer, we check the renderer.domElement parameter which can be :
        //    - a domElement, in this case we use this domElement as a support
        //    - a canvas, in this case we use the canvas parent (which should be a domElement) as a support
        let renderer;
        let viewerDiv;
        if (rendererOrDiv.domElement) {
            this._shouldDisposeRenderer = false; // don't dispose renderer if provided by the user
            renderer = rendererOrDiv;
            viewerDiv = renderer.domElement instanceof HTMLDivElement ?
                renderer.domElement : renderer.domElement.parentElement;
        } else {
            this._shouldDisposeRenderer = true;
            viewerDiv = rendererOrDiv;
        }

        this.width = viewerDiv.clientWidth;
        this.height = viewerDiv.clientHeight;

        this.positionBuffer = null;
        this._nextThreejsLayer = 1;

        this.fullSizeRenderTarget = new THREE.WebGLRenderTarget(this.width, this.height);
        this.fullSizeRenderTarget.texture.minFilter = THREE.LinearFilter;
        this.fullSizeRenderTarget.texture.magFilter = THREE.NearestFilter;
        this.fullSizeRenderTarget.depthBuffer = true;
        this.fullSizeRenderTarget.depthTexture = new THREE.DepthTexture();
        this.fullSizeRenderTarget.depthTexture.type = THREE.UnsignedShortType;

        this.renderView = function _(view) {
            this.renderer.setClearAlpha(this.renderer.getClearAlpha());
            this.renderer.clear();
            if (view._camXR) {
                this.renderer.render(view.scene, view._camXR);
            } else if (this.composer.passes.length) {
                // composer.render() is a no-op stub for WebGPU.
                // User-added passes require migration to Three.js PostProcessing API.
                this.renderer.render(view.scene, view.camera3D);
            } else {
                this.renderer.render(view.scene, view.camera3D);
            }
            if (view.tileLayer) {
                this.label2dRenderer.render(view.tileLayer.object3d, view.camera3D);
            }
        }.bind(this);

        /**
         * @type {Function}
         * @param {number} w
         * @param {number} h
         */
        this.onWindowResize = function _(w, h) {
            this.width = w;
            this.height = h;
            this.fullSizeRenderTarget.setSize(this.width, this.height);
            this.renderer.setSize(this.width, this.height);
            this.label2dRenderer.setSize(this.width, this.height);
            this.composer.setSize(this.width, this.height);
        }.bind(this);

        // Create renderer

        this.label2dRenderer = new Label2DRenderer();
        this.label2dRenderer.setSize(this.width, this.height);
        viewerDiv.appendChild(this.label2dRenderer.domElement);

        this.renderer = renderer || new WebGPURenderer({
            canvas: document.createElement('canvas'),
            antialias: options.antialias,
            alpha: options.alpha,
            logarithmicDepthBuffer: options.logarithmicDepthBuffer,
        });

        // WebGPURenderer requires async initialisation.
        // Store the promise so callers can await it via waitForInit().
        // Three.js r182 will display a warning and fall back to async
        // rendering if render() is called before init() resolves.
        this.initPromise = this.renderer.init();

        this.renderer.domElement.style.position = 'relative';
        this.renderer.domElement.style.zIndex = 0;
        this.renderer.domElement.style.top = 0;


        // Let's allow our canvas to take focus
        // The condition below looks weird, but it's correct: querying tabIndex
        // returns -1 if not set, but we still need to explicitly set it to force
        // the tabindex focus flag to true (see
        // https://www.w3.org/TR/html5/editing.html#specially-focusable)
        if (this.renderer.domElement.tabIndex === -1) {
            this.renderer.domElement.tabIndex = -1;
        }

        Capabilities.updateCapabilities(this.renderer);

        this.renderer.setClearColor(0x030508);
        this.renderer.autoClear = false;
        this.renderer.sortObjects = true;

        if (!renderer) {
            this.renderer.setPixelRatio(viewerDiv.devicePixelRatio);
            this.renderer.setSize(viewerDiv.clientWidth, viewerDiv.clientHeight);
            viewerDiv.appendChild(this.renderer.domElement);
        }

        // Use a no-op stub for the EffectComposer.
        // postprocessing v6 is not compatible with WebGPURenderer.
        // Migrate custom effects to Three.js PostProcessing API (three/webgpu).
        this.composer = new WebGPUComposerStub();
    }

    /**
     * Add a method to expose the async init promise.
     * @returns {Promise<void>}
     */
    waitForInit() {
        return this.initPromise ?? Promise.resolve();
    }

    dispose() {
        this.label2dRenderer.domElement.parentElement?.removeChild(this.label2dRenderer.domElement);
        this.fullSizeRenderTarget.dispose();
        this.composer.dispose();
        if (this._shouldDisposeRenderer) {
            this.renderer.domElement.parentElement?.removeChild(this.renderer.domElement);
            this.renderer.dispose();
        }
    }

    getWindowSize() {
        return new THREE.Vector2(this.width, this.height);
    }

    /**
     * return renderer THREE.js
     * @returns {WebGPURenderer}
     */
    getRenderer() {
        return this.renderer;
    }

    /**
     * Render view to a Uint8Array (async for WebGPU).
     *
     * @param {View} view - The view to render
     * @param {object} [zone] - partial zone to render
     * @param {number} zone.x - x (in view coordinate)
     * @param {number} zone.y - y (in view coordinate)
     * @param {number} zone.width - width of area to render (in pixels)
     * @param {number} zone.height - height of area to render (in pixels)
     * @returns {Promise<Uint8Array>} - 4 bytes per pixel (RGBA).
     */
    async renderViewToBuffer(view, zone) {
        if (!zone) {
            zone = {
                x: 0,
                y: 0,
                width: this.width,
                height: this.height,
            };
        }

        zone.buffer = zone.buffer || new Uint8Array(4 * zone.width * zone.height);

        this.renderViewToRenderTarget(view, this.fullSizeRenderTarget, zone);

        await this.renderer.readRenderTargetPixelsAsync(
            this.fullSizeRenderTarget,
            zone.x, this.height - (zone.y + zone.height), zone.width, zone.height, zone.buffer);

        return zone.buffer;
    }

    /**
     * Render view to a THREE.RenderTarget.
     *
     * @param {View} view - The view to render
     * @param {THREE.RenderTarget} [target] - destination render target. Default value: full size render target owned by c3DEngine.
     * @param {object} [zone] - partial zone to render (zone x/y uses view coordinates) Note: target must contain complete zone
     * @returns {THREE.RenderTarget} - the destination render target
     */
    renderViewToRenderTarget(view, target, zone) {
        if (!target) {
            target = this.fullSizeRenderTarget;
        }
        const current = this.renderer.getRenderTarget();

        // Don't use setViewport / setScissor on renderer because they would affect
        // on screen rendering as well. Instead set them on the render target.
        // Example : this.fullSizeRenderTarget.viewport.set(0, 0, target.width, target.height);
        if (zone) {
            this.fullSizeRenderTarget.scissor.set(
                zone.x,
                target.height - (zone.y + zone.height),
                zone.width,
                zone.height);
            this.fullSizeRenderTarget.scissorTest = true;
        }

        this.renderer.setRenderTarget(target);
        this.renderer.clear(true, true, false);
        this.renderer.render(view.scene, view.camera.camera3D);
        this.renderer.setRenderTarget(current);

        this.fullSizeRenderTarget.scissorTest = false;
        return target;
    }

    bufferToImage(pixelBuffer, width, height) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        // size the canvas to your desired image
        canvas.width = width;
        canvas.height = height;

        const imgData = ctx.getImageData(0, 0, width, height);
        imgData.data.set(pixelBuffer);

        ctx.putImageData(imgData, 0, 0);

        // create a new img object
        const image = new Image();

        // set the img.src to the canvas data url
        image.src = canvas.toDataURL();

        return image;
    }

    depthBufferRGBAValueToOrthoZ(depthBufferRGBA, camera) {
        depthRGBA.fromArray(depthBufferRGBA).divideScalar(255.0);

        if (Capabilities.isLogDepthBufferSupported() && camera.type == 'PerspectiveCamera') {
            const gl_FragDepthEXT = unpack1K(depthRGBA);
            const logDepthBufFC = 2.0 / (Math.log(camera.far + 1.0) / Math.LN2);
            // invert function : gl_FragDepthEXT = log2(vFragDepth) * logDepthBufFC * 0.5;
            return 2 ** (2 * gl_FragDepthEXT / logDepthBufFC);
        } else {
            let gl_FragCoord_Z = unpack1K(depthRGBA);
            gl_FragCoord_Z = gl_FragCoord_Z * 2.0 - 1.0;
            return gl_FragCoord_Z;
        }
    }
}

export default c3DEngine;
