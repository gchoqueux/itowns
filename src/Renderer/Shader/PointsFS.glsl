#include <itowns/precision_qualifier>
#include <logdepthbuf_pars_fragment>
#if defined(USE_TEXTURES_PROJECTIVE)
#include <itowns/projective_texturing_pars_fragment>
#endif

varying vec4 vColor;
uniform bool pickingMode;
void main() {
    #include <logdepthbuf_fragment>
    // circular point rendering
    if(length(gl_PointCoord - 0.5) > 0.5){
        discard;
    }

#if defined(USE_TEXTURES_PROJECTIVE)
    if (!pickingMode) {
        vec4 color = vColor;
        vec4 aColor;

        #pragma unroll_loop
        for (int i = 0; i < ORIENTED_IMAGES_COUNT; i++) {
            aColor = projectiveTextureColor(projectiveTextureCoords[ ORIENTED_IMAGES_COUNT - 1 - i ], projectiveTextureDistortion[ ORIENTED_IMAGES_COUNT - 1 - i ], projectiveTexture[ ORIENTED_IMAGES_COUNT - 1 - i ], mask[ORIENTED_IMAGES_COUNT - 1 - i]);

            color = aColor.a == 1.0 ? aColor : vec4(mix(color.rgb, aColor.rgb, aColor.a), 1.0);
        }

        gl_FragColor = color;
    } else {
        gl_FragColor = vColor;
    }
    gl_FragColor.a *= opacity;
#else
    gl_FragColor = vColor;
#endif
}
