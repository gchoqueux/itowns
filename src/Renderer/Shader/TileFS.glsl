#include <itowns.precision_qualifier>
#include <itowns.pitUV>
#include <logdepthbuf_pars_fragment>
#include <itowns.fog_pars_fragment>

// BUG CHROME 50 UBUNTU 16.04
// Lose context on compiling shader with too many IF STATEMENT
// runconformance/glsl/bugs/conditional-discard-in-loop.html
// conformance/glsl/bugs/nested-loops-with-break-and-continue.html
// Resolve CHROME unstable 52


uniform sampler2D   colorTextures[NUM_FS_TEXTURES];
uniform vec4        colorOffsetScales[NUM_FS_TEXTURES];

struct Layer {
    int textureOffset;
    int crs;
    float effect;
    float opacity;
};

uniform Layer       colorLayers[NUM_FS_TEXTURES];
uniform int         colorTextureCount;

uniform vec3        lightPosition;

uniform vec3        diffuse;
uniform float       opacity;

// Options global
uniform bool        selected;
const   vec3        selectedColor = vec3(1.0, 0.3, 0.0);
uniform bool        lightingEnabled;

varying vec3        vUv; // WGS84.x/PM.x, WGS84.y, PM.y
varying vec3        vNormal;


#if defined(DEBUG)
uniform bool showOutline;
uniform vec3 outlineColors[NUM_CRS];
uniform float outlineWidth;

float getOutlineAlpha(vec3 uv) {
    vec4 p4 = vec4(uv.xy, 1. - uv.xy) / outlineWidth;
    vec2 p2 = min(p4.xy, p4.zw);
    return 1. - clamp(min(p2.x, p2.y), 0., 1.);
}
#endif

#if defined(MATTE_ID_MODE) || defined(DEPTH_MODE)
#include <packing>
uniform int objectId;
#endif

vec4 applyWhiteToInvisibleEffect(vec4 color, float intensity) {
    float a = dot(color.rgb, vec3(0.333333333));
    color.a *= 1.0 - pow(abs(a), intensity);
    return color;
}

vec4 applyLightColorToInvisibleEffect(vec4 color, float intensity) {
    float a = max(0.05,1. - length(color.xyz - 1.));
    color.a *= 1.0 - pow(abs(a), intensity);
    color.rgb *= color.rgb * color.rgb;
    return color;
}

vec3 uv_crs[NUM_CRS];

vec4 getLayerColor(int i, sampler2D texture, vec4 offsetScale, Layer layer) {
    if ( !(i < colorTextureCount) ) return vec4(0);
    vec3 uv;
    #pragma unroll_loop
    for ( int i = 0; i < NUM_CRS; i ++ ) {
        if ( i == layer.crs ) uv = uv_crs[ i ];
    }
    if (i != layer.textureOffset + int(uv.z)) return vec4(0);
    vec4 color = texture2D(texture, pitUV(uv.xy, offsetScale));
    if(color.a > 0.0) {
        if(layer.effect > 2.0) {
            color.rgb /= color.a;
            color = applyLightColorToInvisibleEffect(color, layer.effect);
        } else if(layer.effect > 0.0) {
            color.rgb /= color.a;
            color = applyWhiteToInvisibleEffect(color, layer.effect);
        }
    }
    #if defined(DEBUG)
    if (showOutline && uv.x > offsetScale.z) {
        color.rgb *= offsetScale.z; // darken according to downscaling
    }
    #endif
    color.a *= layer.opacity;
    return color;
}

void main() {
    #include <logdepthbuf_fragment>

#if defined(MATTE_ID_MODE)

    gl_FragColor = packDepthToRGBA(float(objectId) / (256.0 * 256.0 * 256.0));

#elif defined(DEPTH_MODE)

  #if defined(USE_LOGDEPTHBUF) && defined(USE_LOGDEPTHBUF_EXT)
    float z = gl_FragDepthEXT ;
  #else
    float z = gl_FragCoord.z;
  #endif
    gl_FragColor = packDepthToRGBA(z);

#else

    gl_FragColor = vec4(diffuse, opacity);

    // Reconstruct PM uv and PM subtexture id (see TileGeometry)
    uv_crs[CRS_WGS84] = vec3(vUv.xy, 0.);
    uv_crs[CRS_PM]    = vec3(vUv.x, fract(vUv.z), floor(vUv.z));

    // Outlines
    #if defined(DEBUG)
    vec4 outlineColor = vec4(0.);
    if (showOutline) {
        float alpha;
        #pragma unroll_loop
        for ( int i = 0; i < NUM_CRS; i ++ ) {
             alpha = getOutlineAlpha(uv_crs[ i ]);
             outlineColor = (alpha > outlineColor.a) ? vec4(outlineColors[ i ], alpha) : outlineColor;
        }
        if (outlineColor.a == 1.) {
            gl_FragColor.rgb = outlineColor.rgb;
            return;
        }
    }
    #endif

    // Layers
    vec4 layerColor;
    #pragma unroll_loop
    for ( int i = 0; i < NUM_FS_TEXTURES; i ++ ) {
        layerColor = getLayerColor( i , colorTextures[ i ], colorOffsetScales[ i ], colorLayers[ i ]);
        gl_FragColor.rgb = mix(gl_FragColor.rgb, layerColor.rgb, layerColor.a);
    }

    // Transparent outlines
    #if defined(DEBUG)
    gl_FragColor.rgb = mix(gl_FragColor.rgb, outlineColor.rgb, outlineColor.a);
    #endif

    // Selected
    if(selected) {
        gl_FragColor.rgb = mix(gl_FragColor.rgb, selectedColor, 0.5 );
    }

    #include <itowns.fog_fragment>

    // Add lighting
    if(lightingEnabled) {
        float light = min(2. * dot(vNormal, lightPosition),1.);
        gl_FragColor.rgb *= light;
    }
    #endif
}