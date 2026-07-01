/**
 * LayeredMaterial — TSL / WebGPU implementation.
 * Replaces the legacy ShaderMaterial-based version.
 *
 * Key changes:
 *  - Extends MeshLambertNodeMaterial (Three.js r160+ node material system)
 *  - All shaders expressed in TSL (Three Shader Language) — no GLSL files
 *  - Supports three render modes at runtime via a JS-side uniform:
 *      FINAL  → standard Lambert-lit + fog output
 *      ID     → packed object-ID in RGBA (for GPU picking)
 *      DEPTH  → packed linear depth in RGBA
 *  - WebGLArrayRenderTarget still used for DataArrayTexture composition
 */

import * as THREE from 'three';
import { MeshLambertNodeMaterial } from 'three/webgpu';
import {
    Fn, If,
    uniform, uniformArray, attribute, texture, varying,
    vec2, vec3, vec4, float, int,
    positionLocal, normalLocal, uv,
    mix, clamp, min, max, dot, abs, fract, floor, length, pow, exp2, step,
    select,
    cameraFar,
    positionView,
} from 'three/tsl';
import Capabilities from 'Core/System/Capabilities';
import RenderMode from 'Renderer/RenderMode';
import { RasterTile, RasterElevationTile, RasterColorTile } from './RasterTile';
import { makeDataArrayRenderTarget } from './WebGLComposer';
import { RenderTargetCache } from './RenderTargetCache';

const identityOffsetScale = new THREE.Vector4(0.0, 0.0, 1.0, 1.0);

// Kept for backward compatibility (used by Picking.js and c3DEngine.js)
const UnpackDownscale = 255 / 256;
const bitSh = new THREE.Vector4(
    UnpackDownscale,
    UnpackDownscale / 256.0,
    UnpackDownscale / (256.0 * 256.0),
    UnpackDownscale / (256.0 * 256.0 * 256.0),
);

export function unpack1K(color: THREE.Vector4Like, factor: number): number {
    return factor ? bitSh.dot(color) * factor : bitSh.dot(color);
}

// packDepthToRGBA is not exported by three/tsl — implement manually
const packDepthToRGBAFn = Fn(([d]: any[], _?: any) => {
    const r = fract(vec4(1.0, 255.0, 65025.0, 16581375.0).mul(d)).toVar();
    return r.sub(r.yzww.mul(vec4(1.0 / 255.0, 1.0 / 255.0, 1.0 / 255.0, 0.0)));
});

const samplersElevationCount = 1;

export function getMaxColorSamplerUnitsCount(): number {
    const maxSamplerUnitsCount = Capabilities.getMaxTextureUnitsCount();
    return maxSamplerUnitsCount - samplersElevationCount;
}

export const colorLayerEffects = {
    noEffect: 0,
    removeLightColor: 1,
    removeWhiteColor: 2,
    customEffect: 3,
} as const;


export const ELEVATION_MODES = {
    RGBA: 0,
    COLOR: 1,
    DATA: 2,
} as const;

export interface LayeredMaterialParameters {
    diffuse?: THREE.Color;
    opacity?: number;
    [key: string]: unknown;
}

let nbSamplers: [number, number] | undefined;

/**
 * Material that handles the overlap of multiple raster tiles.
 * TSL / WebGPU implementation — no GLSL shaders.
 */
export class LayeredMaterial extends MeshLambertNodeMaterial {
    private _visible = true;

    public colorTiles: RasterColorTile[];
    public elevationTile: RasterElevationTile | undefined;
    public colorTileIds: string[];
    public elevationTileId: string | undefined;
    public layersNeedUpdate: boolean;
    public renderTargetCache: RenderTargetCache | undefined;

    /** Current render mode (FINAL / ID / DEPTH). */
    private _mode: number = RenderMode.MODES.FINAL;

    // --- Per-instance TSL uniform nodes (elevation) -------------------
    private readonly _elevTexNode: ReturnType<typeof texture>;
    private readonly _elevCountNode: ReturnType<typeof uniform>;
    private readonly _elevOffsetScalesArr: THREE.Vector4[];
    private readonly _elevOffsetScalesNode: ReturnType<typeof uniformArray>;
    private readonly _elevScalesArr: number[];
    private readonly _elevScalesNode: ReturnType<typeof uniformArray>;
    private readonly _elevBiasesArr: number[];
    private readonly _elevBiasesNode: ReturnType<typeof uniformArray>;
    private readonly _elevModesArr: number[];
    private readonly _elevModesNode: ReturnType<typeof uniformArray>;
    private readonly _elevZminsArr: number[];
    private readonly _elevZminsNode: ReturnType<typeof uniformArray>;
    private readonly _elevZmaxsArr: number[];
    private readonly _elevZmaxsNode: ReturnType<typeof uniformArray>;

    // --- Per-instance TSL uniform nodes (color) -----------------------
    private readonly _colorTexNode: ReturnType<typeof texture>;
    private readonly _colorCountNode: ReturnType<typeof uniform>;
    private readonly _colorOffsetScalesArr: THREE.Vector4[];
    private readonly _colorOffsetScalesNode: ReturnType<typeof uniformArray>;
    private readonly _colorTexOffsetsArr: number[];
    private readonly _colorTexOffsetsNode: ReturnType<typeof uniformArray>;
    private readonly _colorCrsIdsArr: number[];
    private readonly _colorCrsIdsNode: ReturnType<typeof uniformArray>;
    private readonly _colorOpacitiesArr: number[];
    private readonly _colorOpacitiesNode: ReturnType<typeof uniformArray>;
    private readonly _colorEffectTypesArr: number[];
    private readonly _colorEffectTypesNode: ReturnType<typeof uniformArray>;
    private readonly _colorEffectParamsArr: number[];
    private readonly _colorEffectParamsNode: ReturnType<typeof uniformArray>;
    private readonly _colorTransparentsArr: number[];
    private readonly _colorTransparentsNode: ReturnType<typeof uniformArray>;

    // --- Per-instance TSL uniform nodes (misc) ------------------------
    private readonly _diffuseNode: ReturnType<typeof uniform>;
    private readonly _opacityNode: ReturnType<typeof uniform>;
    private readonly _geoidHeightNode: ReturnType<typeof uniform>;
    private readonly _overlayAlphaNode: ReturnType<typeof uniform>;
    private readonly _overlayColorNode: ReturnType<typeof uniform>;
    private readonly _objectIdNode: ReturnType<typeof uniform>;
    private readonly _minBorderDistNode: ReturnType<typeof uniform>;
    private readonly _numCRSNode: ReturnType<typeof uniform>;

    // Mode-specific output nodes (fixed once, reused on mode switches)
    private readonly _idOutputNode: ReturnType<typeof packDepthToRGBAFn>;
    private readonly _depthOutputNode: ReturnType<typeof packDepthToRGBAFn>;

    // Backward-compat shim: expose a uniforms-like object for external callers
    readonly uniforms: Record<string, THREE.IUniform<unknown>> = {};

    constructor(options: LayeredMaterialParameters = {}, crsCount: number) {
        super();
        this.name = 'LayeredMaterial';
        nbSamplers ??= [samplersElevationCount, getMaxColorSamplerUnitsCount()];
        const [numElev, numColor] = nbSamplers;

        // ---- Elevation uniform nodes ---------------------------------
        this._elevTexNode = texture(new THREE.DataArrayTexture());
        this._elevCountNode = uniform(0, 'int');
        this._elevOffsetScalesArr = Array.from({ length: numElev }, () => identityOffsetScale.clone());
        this._elevOffsetScalesNode = uniformArray(this._elevOffsetScalesArr, 'vec4');
        this._elevScalesArr = new Array(numElev).fill(0);
        this._elevScalesNode = uniformArray(this._elevScalesArr, 'float');
        this._elevBiasesArr = new Array(numElev).fill(0);
        this._elevBiasesNode = uniformArray(this._elevBiasesArr, 'float');
        this._elevModesArr = new Array(numElev).fill(ELEVATION_MODES.DATA);
        this._elevModesNode = uniformArray(this._elevModesArr, 'int');
        this._elevZminsArr = new Array(numElev).fill(-1e38);
        this._elevZminsNode = uniformArray(this._elevZminsArr, 'float');
        this._elevZmaxsArr = new Array(numElev).fill(1e38);
        this._elevZmaxsNode = uniformArray(this._elevZmaxsArr, 'float');

        // ---- Color uniform nodes ------------------------------------
        this._colorTexNode = texture(new THREE.DataArrayTexture());
        this._colorCountNode = uniform(0, 'int');
        this._colorOffsetScalesArr = Array.from({ length: numColor }, () => identityOffsetScale.clone());
        this._colorOffsetScalesNode = uniformArray(this._colorOffsetScalesArr, 'vec4');
        this._colorTexOffsetsArr = new Array(numColor).fill(0);
        this._colorTexOffsetsNode = uniformArray(this._colorTexOffsetsArr, 'int');
        this._colorCrsIdsArr = new Array(numColor).fill(0);
        this._colorCrsIdsNode = uniformArray(this._colorCrsIdsArr, 'int');
        this._colorOpacitiesArr = new Array(numColor).fill(0);
        this._colorOpacitiesNode = uniformArray(this._colorOpacitiesArr, 'float');
        this._colorEffectTypesArr = new Array(numColor).fill(0);
        this._colorEffectTypesNode = uniformArray(this._colorEffectTypesArr, 'int');
        this._colorEffectParamsArr = new Array(numColor).fill(0);
        this._colorEffectParamsNode = uniformArray(this._colorEffectParamsArr, 'float');
        this._colorTransparentsArr = new Array(numColor).fill(0);
        this._colorTransparentsNode = uniformArray(this._colorTransparentsArr, 'int');

        // ---- Misc uniform nodes ------------------------------------
        this._diffuseNode = uniform(
            (options.diffuse as THREE.Color | undefined) ?? new THREE.Color(0.04, 0.23, 0.35),
        );
        this._opacityNode = uniform(options.opacity ?? 1.0, 'float');
        this._geoidHeightNode = uniform(0.0, 'float');
        this._overlayAlphaNode = uniform(0.0, 'float');
        this._overlayColorNode = uniform(new THREE.Color(1.0, 0.3, 0.0));
        this._objectIdNode = uniform(0.0, 'float');
        this._minBorderDistNode = uniform(-0.01, 'float');
        this._numCRSNode = uniform(crsCount, 'int');

        // ---- Build node graph --------------------------------------
        this._buildNodeGraph(numColor);

        // ---- Mode output nodes (ID / DEPTH) -------------------------
        // Pack object-id as RGBA
        this._idOutputNode = packDepthToRGBAFn(
            [this._objectIdNode.div(float(16777216.0))],
        );
        // Pack linear view-space depth (0=near, 1=far) as RGBA
        this._depthOutputNode = packDepthToRGBAFn(
            [clamp(positionView.z.negate().div(cameraFar), float(0), float(1))],
        );

        // ---- Default mode: FINAL ------------------------------------
        this.fog = true;
        this.lights = true;

        // ---- Backward-compat uniforms shim --------------------------
        this._buildUniformsShim();

        // ---- Tile bookkeeping ---------------------------------------
        this.colorTiles = [];
        this.colorTileIds = [];
        this.layersNeedUpdate = false;

        // visibility property with event dispatch
        Object.defineProperty(this, 'visible', {
            get: () => this._visible,
            set: (v: boolean) => {
                if (this._visible !== v) {
                    this._visible = v;
                    // Material only types 'dispose', cast to allow custom events
                    (this as THREE.EventDispatcher<Record<string, unknown>>).dispatchEvent({ type: v ? 'shown' : 'hidden' });
                }
            },
        });
    }

    // ------------------------------------------------------------------
    // Node-graph construction
    // ------------------------------------------------------------------

    private _buildNodeGraph(numColor: number): void {
        // Capture node references for closure use
        const elevTex = this._elevTexNode;
        const elevCount = this._elevCountNode;
        const elevOS = this._elevOffsetScalesNode;
        const elevScales = this._elevScalesNode;
        const elevBiases = this._elevBiasesNode;
        const elevModes = this._elevModesNode;
        const elevZmins = this._elevZminsNode;
        const elevZmaxs = this._elevZmaxsNode;
        const geoidH = this._geoidHeightNode;

        const colorTex = this._colorTexNode;
        const colorCount = this._colorCountNode;
        const colorOS = this._colorOffsetScalesNode;
        const colorTexOffsets = this._colorTexOffsetsNode;
        const colorCrs = this._colorCrsIdsNode;
        const colorOps = this._colorOpacitiesNode;
        const colorEfTypes = this._colorEffectTypesNode;
        const colorEfParams = this._colorEffectParamsNode;
        const colorTrans = this._colorTransparentsNode;
        const minBorderDist = this._minBorderDistNode;
        const diffuseNode = this._diffuseNode;
        const opacityNode = this._opacityNode;
        const overlayAlpha = this._overlayAlphaNode;
        const overlayColor = this._overlayColorNode;
        const numCRS = this._numCRSNode;

        // -- UV helpers -----------------------------------------------
        /** pitUV: apply offset/scale to UV, flipping Y */
        const pitUVFn = Fn(([uvNode, pitNode]: any[], _?: any) =>
            uvNode.mul(pitNode.zw).add(vec2(pitNode.x, float(1.0).sub(pitNode.w).sub(pitNode.y))),
        );

        /** Border distance: min(min(u,1-u), min(v,1-v)) */
        const getBorderDistFn = Fn(([uvNode]: any[], _?: any) => {
            const p2 = min(uvNode, vec2(1.0).sub(uvNode));
            return min(p2.x, p2.y);
        });

        // -- Elevation decode -----------------------------------------
        /** Decode a 32-bit float packed in four uint8 channels */
        const decode32Fn = Fn(([rgba]: any[], _?: any) => {
            const s = float(1.0).sub(step(float(128.0), rgba.x).mul(2.0));
            const e = rgba.x.mul(2.0).mod(float(256.0)).add(step(float(128.0), rgba.y)).sub(float(127.0));
            const m = rgba.y.mod(128.0).mul(65536.0).add(rgba.z.mul(256.0)).add(rgba.w).add(float(0x800000));
            return s.mul(exp2(e)).mul(m.mul(exp2(float(-23.0))));
        });

        /** Sample elevation array texture and decode by mode */
        const getElevFn = Fn(([uvN, modeN, scaleN, biasN, zminN, zmaxN, osN]: any[], _?: any) => {
            const flippedUV = vec2(uvN.x, float(1.0).sub(uvN.y));
            const scaledUV = flippedUV.mul(osN.zw).add(osN.xy);
            const raw = float(0.0).toVar();
            If(modeN.equal(int(ELEVATION_MODES.RGBA)), () => {
                const t = texture(elevTex as any, vec3(scaledUV, 0.0)).mul(255.0);
                raw.assign(decode32Fn([vec4(t.w, t.z, t.y, t.x)]));
            }).ElseIf(
                modeN.equal(int(ELEVATION_MODES.DATA)).or(modeN.equal(int(ELEVATION_MODES.COLOR))),
                () => { raw.assign(texture(elevTex as any, vec3(scaledUV, 0.0)).r); },
            );
            return clamp(raw, zminN, zmaxN).mul(scaleN).add(biasN);
        });

        // -- Vertex: elevation-displaced local position ---------------
        const uvAttr = uv();
        const elevH = Fn(() => {
            const h = float(0.0).toVar();
            If(elevCount.greaterThan(int(0)), () => {
                h.assign(getElevFn(
                    [uvAttr,
                    elevModes.element(int(0)),
                    elevScales.element(int(0)),
                    elevBiases.element(int(0)),
                    elevZmins.element(int(0)),
                    elevZmaxs.element(int(0)),
                    elevOS.element(int(0))],
                ));
            });
            return h;
        })();

        // positionNode: displace along local normal
        this.positionNode = positionLocal.add(normalLocal.mul(elevH.add(geoidH)));

        // -- UV varying: interpolate (u, v, uvZ) ----------------------
        const uv1Attr = attribute('uv_1', 'float');
        const uvZ = select(
            numCRS.greaterThan(int(1)),
            select(uv1Attr.greaterThan(float(0.0)), uv1Attr, uvAttr.y),
            float(0.0),
        );
        const vUv3 = varying(vec3(uvAttr, uvZ), 'vLMUv3');

        // -- Fragment: layer color blending ---------------------------
        /** Compute the contribution of color layer at index i */
        const getLayerColorFn = Fn(([i, uvs0, uvs1]: any[], _?: any) => {
            const result = vec4(0.0).toVar();
            If(i.lessThan(colorCount), () => {
                const crsId = colorCrs.element(i);
                const uvCRS = select(crsId.equal(int(0)), uvs0, uvs1);
                const uvXY = vec2(uvCRS.x, uvCRS.y);
                const uvZ2 = uvCRS.z;
                const borderDist = getBorderDistFn([uvXY]);
                const texOff = colorTexOffsets.element(i);
                // In GLSL: skip if i != layer.textureOffset + int(floor(uvZ))
                const expectedOffset = texOff.add(int(floor(uvZ2)));
                If(
                    i.equal(expectedOffset).and(borderDist.greaterThanEqual(minBorderDist)),
                    () => {
                        const os = colorOS.element(i);
                        const pitCoord = pitUVFn([uvXY, os]);
                        const sampled = texture(colorTex as any, vec3(pitCoord, float(i))).toVar();
                        // Un-premultiply alpha if transparent flag set
                        If(colorTrans.element(i).equal(int(1)).and(sampled.a.notEqual(float(0.0))), () => {
                            sampled.r.divAssign(sampled.a);
                            sampled.g.divAssign(sampled.a);
                            sampled.b.divAssign(sampled.a);
                        });
                        // Apply color effects
                        const efType = colorEfTypes.element(i);
                        const efParam = colorEfParams.element(i);
                        If(efType.equal(int(colorLayerEffects.removeLightColor)), () => {
                            const a = max(float(0.05), float(1.0).sub(length(sampled.xyz.sub(vec3(1.0)))));
                            sampled.a.mulAssign(float(1.0).sub(pow(abs(a), efParam)));
                            sampled.r.assign(sampled.r.mul(sampled.r));
                            sampled.g.assign(sampled.g.mul(sampled.g));
                            sampled.b.assign(sampled.b.mul(sampled.b));
                        }).ElseIf(efType.equal(int(colorLayerEffects.removeWhiteColor)), () => {
                            const aVal = dot(sampled.rgb, vec3(0.333333333));
                            If(aVal.greaterThanEqual(float(0.99)), () => {
                                sampled.a.assign(float(0.0));
                            });
                        });
                        sampled.a.mulAssign(colorOps.element(i));
                        result.assign(sampled);
                    },
                );
            });
            return result;
        });

        /** Main color node: blend all layers over the base diffuse color */
        const colorComputeNode = Fn(() => {
            const baseColor = vec4(diffuseNode, opacityNode).toVar();
            const uvs0 = vec3(vUv3.x, vUv3.y, float(0.0));
            const uvs1 = vec3(vUv3.x, fract(vUv3.z), floor(vUv3.z));
            // Static unroll: iterate over all possible layer slots
            for (let li = 0; li < numColor; li++) {
                const iNode = int(li);
                const lc = getLayerColorFn([iNode, uvs0, uvs1]);
                baseColor.rgb.assign(mix(baseColor.rgb, lc.rgb, lc.a));
            }
            // Overlay (pre-lighting; slight visual difference vs original post-lighting)
            const withOverlay = mix(baseColor.rgb, overlayColor, overlayAlpha);
            return vec4(withOverlay, baseColor.a);
        })();

        // Set as the Lambert material's diffuse color input
        this.colorNode = colorComputeNode;
    }

    // ------------------------------------------------------------------
    // Mode switching — triggers shader recompilation
    // ------------------------------------------------------------------

    public get mode(): number { return this._mode; }

    public set mode(mode: number) {
        if (this._mode === mode) { return; }
        this._mode = mode;
        if (mode === RenderMode.MODES.ID) {
            this.outputNode = this._idOutputNode;
            this.lights = false;
            this.fog = false;
        } else if (mode === RenderMode.MODES.DEPTH) {
            this.outputNode = this._depthOutputNode;
            this.lights = false;
            this.fog = false;
        } else {
            // FINAL: use standard Lambert output
            this.outputNode = null;
            this.lights = true;
            this.fog = true;
        }
        this.needsUpdate = true;
    }

    public override customProgramCacheKey(): string {
        return super.customProgramCacheKey() + '|lm_mode:' + this._mode;
    }

    // ------------------------------------------------------------------
    // Layer uniform updates (called from TileMesh.onBeforeRender)
    // ------------------------------------------------------------------

    public updateLayersUniforms(renderer: THREE.WebGLRenderer | import('three/webgpu').WebGPURenderer): void {
        const colorlayers = this.colorTiles
            .filter(rt => rt.visible && rt.opacity > 0)
            .sort((a, b) => this.colorTileIds.indexOf(a.id) - this.colorTileIds.indexOf(b.id));

        this._updateColorNodes(colorlayers, renderer);
        if (this.elevationTileId !== undefined && this.elevationTile !== undefined) {
            this._updateElevationNodes(this.elevationTile, renderer);
        }
        this.layersNeedUpdate = false;
    }

    private _updateColorNodes(tiles: RasterColorTile[], renderer: THREE.WebGLRenderer | import('three/webgpu').WebGPURenderer): void {
        const max = this._colorOffsetScalesArr.length;
        let count = 0, width = 0, height = 0, setSize = false;
        let textureSetId = 'c';

        for (const tile of tiles) {
            // @ts-expect-error: dynamic field set on tile
            tile.textureOffset = count;
            for (let ti = 0; ti < tile.textures.length && count < max; ++ti, ++count) {
                const tex = tile.textures[ti];
                if (!tex.isTexture) { continue; }
                textureSetId += `${tex.id}.`;
                this._colorOffsetScalesArr[count].copy(tile.offsetScales[ti] ?? identityOffsetScale);
                this._colorTexOffsetsArr[count] = count;
                this._colorCrsIdsArr[count] = tile.crs;
                this._colorOpacitiesArr[count] = tile.opacity;
                this._colorEffectTypesArr[count] = (tile as RasterColorTile).effect_type ?? 0;
                this._colorEffectParamsArr[count] = (tile as RasterColorTile).effect_parameter ?? 0;
                this._colorTransparentsArr[count] = (tile as RasterColorTile).transparent ? 1 : 0;
                const img = tex.image;
                if (!img || img.width <= 0 || img.height <= 0) {
                    console.error('LayeredMaterial: texture not loaded or has zero dimensions');
                    this._colorCountNode.value = 0; return;
                } else if (!setSize) {
                    width = img.width; height = img.height; setSize = true;
                } else if (width !== img.width || height !== img.height) {
                    console.error('LayeredMaterial: texture dimension mismatch');
                    this._colorCountNode.value = 0; return;
                }
            }
        }
        for (let i = count; i < max; i++) {
            this._colorOpacitiesArr[i] = 0;
            this._colorTexOffsetsArr[i] = 0;
        }

        const cachedRT = this.renderTargetCache?.get(textureSetId);
        if (cachedRT) {
            this._colorTexNode.value = cachedRT.texture;
            this._colorCountNode.value = count;
            return;
        }
        const rt = makeDataArrayRenderTarget(width, height, count, tiles, max, renderer);
        if (!rt) { this._colorCountNode.value = 0; return; }
        this.renderTargetCache?.set(textureSetId, rt);
        rt.texture.userData = { textureSetId };
        this._colorTexNode.value = rt.texture;
        this._colorCountNode.value = count;

        if (count > max) {
            console.warn(`LayeredMaterial: not enough texture units (${max} < ${count}), excess discarded.`);
        }
    }

    private _updateElevationNodes(tile: RasterElevationTile, renderer: THREE.WebGLRenderer | import('three/webgpu').WebGPURenderer): void {
        const max = this._elevOffsetScalesArr.length;
        let count = 0, width = 0, height = 0, setSize = false;
        let textureSetId = 'e';
        // @ts-expect-error: dynamic field
        tile.textureOffset = 0;
        for (let ti = 0; ti < tile.textures.length && count < max; ++ti, ++count) {
            const tex = tile.textures[ti];
            if (!tex.isTexture) { continue; }
            textureSetId += `${tex.id}.`;
            this._elevOffsetScalesArr[count].copy(tile.offsetScales[ti] ?? identityOffsetScale);
            this._elevScalesArr[count] = tile.scale ?? 1;
            this._elevBiasesArr[count] = tile.bias ?? 0;
            this._elevModesArr[count] = tile.mode ?? ELEVATION_MODES.DATA;
            this._elevZminsArr[count] = tile.zmin ?? -1e38;
            this._elevZmaxsArr[count] = tile.zmax ?? 1e38;
            const img = tex.image;
            if (!img || img.width <= 0 || img.height <= 0) { this._elevCountNode.value = 0; return; }
            else if (!setSize) { width = img.width; height = img.height; setSize = true; }
            else if (width !== img.width || height !== img.height) { this._elevCountNode.value = 0; return; }
        }
        const cachedRT = this.renderTargetCache?.get(textureSetId);
        if (cachedRT) { this._elevTexNode.value = cachedRT.texture; this._elevCountNode.value = count; return; }
        const rt = makeDataArrayRenderTarget(width, height, count, [tile], max, renderer);
        if (!rt) { this._elevCountNode.value = 0; return; }
        this.renderTargetCache?.set(textureSetId, rt);
        rt.texture.userData = { textureSetId };
        this._elevTexNode.value = rt.texture;
        this._elevCountNode.value = count;
    }

    // ------------------------------------------------------------------
    // markAsRendered — track render target usage
    // ------------------------------------------------------------------

    public markAsRendered(): void {
        if (!this.renderTargetCache) {
            throw new Error('renderTargetCache is not initialized');
        }
        const ct = this._colorTexNode.value as THREE.Texture | null;
        if (ct?.userData?.textureSetId) { this.renderTargetCache.markAsUsed(ct.userData.textureSetId); }
        const et = this._elevTexNode.value as THREE.Texture | null;
        if (et?.userData?.textureSetId) { this.renderTargetCache.markAsUsed(et.userData.textureSetId); }
    }

    // ------------------------------------------------------------------
    // Backward-compat uniform access shim
    // ------------------------------------------------------------------

    private _buildUniformsShim(): void {
        const self = this;
        const mk = (g: () => unknown, s: (v: unknown) => void): THREE.IUniform<unknown> =>
            ({ get value() { return g(); }, set value(v) { s(v); } });

        (this as unknown as { uniforms: Record<string, THREE.IUniform<unknown>> }).uniforms = {
            objectId: mk(() => self._objectIdNode.value, v => { self._objectIdNode.value = v as number; }),
            geoidHeight: mk(() => self._geoidHeightNode.value, v => { self._geoidHeightNode.value = v as number; }),
            overlayAlpha: mk(() => self._overlayAlphaNode.value, v => { self._overlayAlphaNode.value = v as number; }),
            overlayColor: mk(() => self._overlayColorNode.value, v => { self._overlayColorNode.value = v; }),
            diffuse: mk(() => self._diffuseNode.value, v => { self._diffuseNode.value = v; }),
            opacity: mk(() => self._opacityNode.value, v => { self._opacityNode.value = v as number; }),
            minBorderDistance: mk(() => self._minBorderDistNode.value, v => { self._minBorderDistNode.value = v as number; }),
        };
    }

    // ------------------------------------------------------------------
    // Uniform API (kept for backward compat)
    // ------------------------------------------------------------------

    public getUniform(name: string): unknown {
        return (this.uniforms as Record<string, THREE.IUniform>)[name]?.value;
    }

    public setUniform(name: string, value: unknown): void {
        const u = (this.uniforms as Record<string, THREE.IUniform>)[name];
        if (u !== undefined) { u.value = value; }
    }

    /** No-op: uniforms are created in the constructor for this TSL implementation. */
    public initUniforms(_uniforms: Record<string, unknown>): void { /* no-op */ }

    public setUniforms(uniforms: Record<string, unknown>): void {
        for (const [name, value] of Object.entries(uniforms)) { this.setUniform(name, value); }
    }

    // ------------------------------------------------------------------
    // Tile management
    // ------------------------------------------------------------------

    public override dispose(): void {
        this.dispatchEvent({ type: 'dispose' });
        this.colorTiles.forEach(l => l.dispose(true));
        this.colorTiles.length = 0;
        this.elevationTile?.dispose(true);
        this.layersNeedUpdate = true;
    }

    public setColorTileIds(ids: string[]): void {
        this.colorTileIds = ids;
        this.layersNeedUpdate = true;
    }

    public setElevationTileId(id: string): void {
        this.elevationTileId = id;
        this.layersNeedUpdate = true;
    }

    public removeTile(tileId: string): void {
        const index = this.colorTiles.findIndex(l => l.id === tileId);
        if (index > -1) {
            this.colorTiles[index].dispose();
            this.colorTiles.splice(index, 1);
            const idSeq = this.colorTileIds.indexOf(tileId);
            if (idSeq > -1) { this.colorTileIds.splice(idSeq, 1); }
            this.layersNeedUpdate = true;
            return;
        }
        if (this.elevationTileId === tileId) {
            this.elevationTile?.dispose();
            this.elevationTileId = undefined;
            this.elevationTile = undefined;
            this.layersNeedUpdate = true;
        }
    }

    public addColorTile(rasterTile: RasterColorTile): void {
        if (this.colorTiles.some(t => t.id === rasterTile.id)) {
            console.warn(`LayeredMaterial: tile "${rasterTile.id}" already present, overwriting.`);
            const i = this.colorTiles.findIndex(t => t.id === rasterTile.id);
            this.colorTiles[i] = rasterTile;
        } else {
            this.colorTiles.push(rasterTile);
        }
        this.layersNeedUpdate = true;
    }

    public setElevationTile(rasterTile: RasterElevationTile): void {
        this.elevationTile?.dispose();
        this.elevationTile = rasterTile;
        this.layersNeedUpdate = true;
    }

    public getColorTile(id: string): RasterColorTile | undefined {
        return this.colorTiles.find(l => l.id === id);
    }

    public getElevationTile(): RasterElevationTile | undefined {
        return this.elevationTile;
    }

    public getTile(id: string): RasterTile | undefined {
        return this.elevationTile?.id === id
            ? this.elevationTile : this.colorTiles.find(l => l.id === id);
    }

    public getTiles(ids: string[]): RasterTile[] {
        const res: RasterTile[] = this.colorTiles.filter(l => ids.includes(l.id));
        if (this.elevationTile !== undefined && ids.includes(this.elevationTile.id)) {
            res.push(this.elevationTile);
        }
        return res;
    }
}

