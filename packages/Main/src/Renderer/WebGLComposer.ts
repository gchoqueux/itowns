import * as THREE from 'three';
import { MeshBasicNodeMaterial } from 'three/webgpu';
import { texture, uv, uniform } from 'three/tsl';
import { RasterTile } from './RasterTile';

// Persistent quad + TSL copy material (created on first use)
let copyMaterial: MeshBasicNodeMaterial | null = null;
let sourceTextureUniform: ReturnType<typeof uniform> | null = null;
let quad: THREE.Mesh | null = null;
const quadCam: THREE.OrthographicCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
/**
 * Initializes a THREE.WebGLArrayRenderTarget with immutable storage
 * and populates its layers.
 * Returns the populated render target so callers can own/dispose it.
 *
 * @param width - The width of each layer in the DataArrayTexture.
 * @param height - The height of each layer in the DataArrayTexture.
 * @param count - The total number of layers the DataArrayTexture should have.
 * @param tiles - An array of RasterTile objects, each containing textures.
 * @param max - The maximum allowed number of layers for the DataArrayTexture.
 * @param renderer - The renderer used to render the texture.
 * @returns The constructed render target, or null
 */
export function makeDataArrayRenderTarget(
    width: number,
    height: number,
    count: number,
    tiles: RasterTile[],
    max: number,
    renderer: THREE.WebGLRenderer | import('three/webgpu').WebGPURenderer,
): THREE.WebGLArrayRenderTarget | null {
    if (count === 0) { return null; }

    const renderTarget = new THREE.WebGLArrayRenderTarget(width, height, count, {
        depthBuffer: false,
    });
    const arrayTexture = renderTarget.texture;

    // Build copy material and quad on first call
    if (!quad) {
        sourceTextureUniform = uniform(null as unknown as THREE.Texture);
        copyMaterial = new MeshBasicNodeMaterial();
        // Sample the source 2-D texture and output its colour verbatim
        copyMaterial.colorNode = texture(sourceTextureUniform as unknown as THREE.Texture, uv());
        copyMaterial.depthWrite = false;
        copyMaterial.depthTest = false;

        const geometry = new THREE.PlaneGeometry(2, 2);
        quad = new THREE.Mesh(geometry, copyMaterial);
    }

    // Save renderer viewport
    const savedViewport = new THREE.Vector4();
    renderer.getViewport(savedViewport);
    const previousRenderTarget = renderer.getRenderTarget();
    const wasVREnabled = renderer.xr.enabled;
    if (wasVREnabled) { renderer.xr.enabled = false; }

    let currentLayerIndex = 0;
    let setTexture = false;

    for (const tile of tiles) {
        for (
            let i = 0;
            i < tile.textures.length && currentLayerIndex < max;
            ++i, ++currentLayerIndex
        ) {
            const tex = tile.textures[i];
            if (!tex.isTexture) { continue; }

            sourceTextureUniform!.value = tex;

            if (!setTexture) {
                arrayTexture.magFilter = tex.magFilter;
                arrayTexture.minFilter = tex.minFilter;
                arrayTexture.wrapS = tex.wrapS;
                arrayTexture.wrapT = tex.wrapT;
                arrayTexture.format = tex.format;
                arrayTexture.type = tex.type;
                arrayTexture.internalFormat = tex.internalFormat;
                arrayTexture.anisotropy = tex.anisotropy;
                arrayTexture.premultiplyAlpha = tex.premultiplyAlpha;
                setTexture = true;
            }

            renderer.setRenderTarget(renderTarget, currentLayerIndex);
            renderer.render(quad, quadCam);
        }
    }

    // Restore renderer state
    renderer.setRenderTarget(previousRenderTarget as THREE.WebGLRenderTarget | null);
    renderer.setViewport(savedViewport);
    if (wasVREnabled) { renderer.xr.enabled = true; }

    return renderTarget;
}
