#include <itowns/precision_qualifier>
#include <logdepthbuf_pars_fragment>
#include <itowns/pitUV>
#include <itowns/color_layers_pars_fragment>
#if MODE == MODE_FINAL
#include <itowns/fog_pars_fragment>
#include <itowns/overlay_pars_fragment>
#include <itowns/lighting_pars_fragment>
#endif
#include <itowns/mode_pars_fragment>

uniform RasterLayerData {
    mat4 parameters[NUM_FS_TEXTURES+1];
} layer;

uniform float colorTextureOffset[NUM_FS_TEXTURES];
uniform float layerCount;

Layer getColorLayer(int id) {
    mat4 m = layer.parameters[id+1];
    Layer l;

    l.opacity = m[1].y;
    l.crs = int(m[1].z);
    l.effect_parameter = m[1].w;
    l.effect_type = int(m[2].x);
    l.transparent = bool(m[2].y);

    return l;
}

// uniform RasterLayerData {
//     float bias[16];
//     float zmin[16];
//     float zmax[16];
//     float scale[16];
//
//     float mode[16];
//     float opacity[16];
//     float crs[16];
//     float effect_parameter[16];
//
//     float effect_type[16];
//     float transparent[16];
// } layers;

varying vec3        vUv; // uv.x/uv_1.x, uv.y, uv_1.y
varying vec2        vHighPrecisionZW;

void layerColor(int i){
    if (i < int(layerCount)) {
        Layer layer = getColorLayer(i);
        vec3 uv = uvs[layer.crs];
        int id_tex = int(colorTextureOffset[i]) + int(uv.z);
        vec2 uv_tex = pitUV(uv.xy, colorOffsetScales[id_tex]);
        vec4 color = getLayerColor(layer, id_tex, uv_tex);
        gl_FragColor.rgb = mix(gl_FragColor.rgb, color.rgb, color.a);
    }
}

void main() {
    #include <logdepthbuf_fragment>

#if MODE == MODE_ID

    #include <itowns/mode_id_fragment>

#elif MODE == MODE_DEPTH

    #include <itowns/mode_depth_fragment>

#else

    gl_FragColor = vec4(GeometryLayer.diffuse, GeometryLayer.opacity);

    uvs[0] = vec3(vUv.xy, 0.);

#if NUM_CRS > 1
    uvs[1] = vec3(vUv.x, fract(vUv.z), floor(vUv.z));
#endif

    #pragma unroll_loop
    for (int i = 0; i < NUM_FS_TEXTURES; i ++ ) {
        layerColor(i);
    }

    #if defined(DEBUG)
    if (showOutline) {
        vec4 color;
        #pragma unroll_loop
        for ( int i = 0; i < NUM_CRS; i ++) {
            color = getOutlineColor( GeometryLayer.outlineColors[i], uvs[ i ].xy);
            gl_FragColor.rgb = mix(gl_FragColor.rgb, color.rgb, color.a);
        }
    }
    #endif

    #include <itowns/fog_fragment>
    #include <itowns/lighting_fragment>
    #include <itowns/overlay_fragment>

#endif
}
