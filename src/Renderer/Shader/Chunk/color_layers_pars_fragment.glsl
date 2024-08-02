struct Layer {
    int textureOffset;
    int crs;
    int effect_type;
    float effect_parameter;
    float opacity;
    bool transparent;
};

uniform geometryLayerData {
    float opacity;
    vec3 diffuse;
    vec3 overlayColor;
    float outlineWidth;
    vec3 outlineColors[2];
    vec3 lightPosition;
    bool lightingEnabled;
    float fogDistance;
    vec3 fogColor;
} GeometryLayer;

#include <itowns/custom_header_colorLayer>

uniform sampler2D   colorTextures[NUM_FS_TEXTURES];
uniform vec4        colorOffsetScales[NUM_FS_TEXTURES];

vec3 uvs[NUM_CRS];

float getBorderDistance(vec2 uv) {
    vec2 p2 = min(uv, 1. -uv);
    return min(p2.x, p2.y);
}

float tolerance = 0.99;

vec4 applyWhiteToInvisibleEffect(vec4 color) {
    float a = dot(color.rgb, vec3(0.333333333));
    if (a >= tolerance) {
        color.a = 0.0;
    }
    return color;
}

vec4 applyLightColorToInvisibleEffect(vec4 color, float intensity) {
    float a = max(0.05,1. - length(color.xyz - 1.));
    color.a *= 1.0 - pow(abs(a), intensity);
    color.rgb *= color.rgb * color.rgb;
    return color;
}

#if defined(DEBUG)
uniform bool showOutline;

vec4 getOutlineColor(vec3 outlineColor, vec2 uv) {
    float alpha = 1. - clamp(getBorderDistance(uv) / GeometryLayer.outlineWidth, 0., 1.);
    return vec4(outlineColor, alpha);
}
#endif

vec4 getColorTexture(int id, vec2 uv) {
    vec4 texColor;
    switch (id){
        case 0:
            texColor = texture2D(colorTextures[0], uv);
            break;
        case 1:
            texColor = texture2D(colorTextures[1], uv);
            break;
        case 2:
            texColor = texture2D(colorTextures[2], uv);
            break;
        case 3:
            texColor = texture2D(colorTextures[3], uv);
            break;
        case 4:
            texColor = texture2D(colorTextures[4], uv);
            break;
        case 5:
            texColor = texture2D(colorTextures[5], uv);
            break;
        case 6:
            texColor = texture2D(colorTextures[6], uv);
            break;
        case 7:
            texColor = texture2D(colorTextures[7], uv);
            break;
        case 8:
            texColor = texture2D(colorTextures[8], uv);
            break;
        case 9:
            texColor = texture2D(colorTextures[9], uv);
            break;
    }
    return texColor;
}


vec4 getLayerColor(Layer layer, int idTexture, vec2 uv) {
    vec4 color = getColorTexture(idTexture, uv);
    if (layer.effect_type == 3) {
        #include <itowns/custom_body_colorLayer>
    } else {
        if (layer.transparent && color.a != 0.0) {
            color.rgb /= color.a;
        }

        if (layer.effect_type == 1) {
            color = applyLightColorToInvisibleEffect(color, layer.effect_parameter);
        } else if (layer.effect_type == 2) {
            color = applyWhiteToInvisibleEffect(color);
        }
    }
    color.a *= layer.opacity;
    return color;
}
