#include <itowns/precision_qualifier>
#if defined(USE_TEXTURES_PROJECTIVE)
#include <itowns/projective_texturing_pars_fragment>
#endif
#include <logdepthbuf_pars_fragment>
#include <itowns/pitUV>
#include <itowns/color_layers_pars_fragment>
#if MODE == MODE_FINAL
#include <itowns/fog_pars_fragment>
#include <itowns/overlay_pars_fragment>
#include <itowns/lighting_pars_fragment>
#endif
#include <itowns/mode_pars_fragment>

uniform vec3        diffuse;
// uniform float       opacity;
varying vec3        vUv; // uv_0.x/uv_1.x, uv_0.y, uv_1.y

void main() {
    #include <logdepthbuf_fragment>

#if MODE == MODE_ID

    #include <itowns/mode_id_fragment>

#elif MODE == MODE_DEPTH

    #include <itowns/mode_depth_fragment>

#else

    gl_FragColor = vec4(diffuse, 1.0);

    uvs[0] = vec3(vUv.xy, 0.);

#if NUM_CRS > 1
    uvs[1] = vec3(vUv.x, fract(vUv.z), floor(vUv.z));
#endif

    vec4 color;
    #pragma unroll_loop
    for ( int i = 0; i < NUM_FS_TEXTURES; i ++ ) {
        color = getLayerColor( i , colorTextures[ i ], colorOffsetScales[ i ], colorLayers[ i ]);
        gl_FragColor.rgb = mix(gl_FragColor.rgb, color.rgb, color.a);
    }

    #if defined(USE_TEXTURES_PROJECTIVE)
    vec4 aColor;
    color = gl_FragColor;
    #pragma unroll_loop
    for (int i = 0; i < ORIENTED_IMAGES_COUNT; i++) {
        aColor = projectiveTextureColor(projectiveTextureCoords[ ORIENTED_IMAGES_COUNT - 1 - i ], projectiveTextureDistortion[ ORIENTED_IMAGES_COUNT - 1 - i ], projectiveTexture[ ORIENTED_IMAGES_COUNT - 1 - i ], mask[ORIENTED_IMAGES_COUNT - 1 - i]);

        color = aColor.a == 1.0 ? aColor : vec4(mix(color.rgb, aColor.rgb, aColor.a), 1.0);
    }
    gl_FragColor = color;
    #endif

    #if defined(DEBUG)
    if (showOutline) {
        #pragma unroll_loop
        for ( int i = 0; i < NUM_CRS; i ++) {
            color = getOutlineColor( outlineColors[ i ], uvs[ i ].xy);
            gl_FragColor.rgb = mix(gl_FragColor.rgb, color.rgb, color.a);
        }
    }
    #endif

    #include <itowns/fog_fragment>
    #include <itowns/lighting_fragment>
    #include <itowns/overlay_fragment>

#endif
}
