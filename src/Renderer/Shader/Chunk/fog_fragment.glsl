#if defined(USE_FOG)
    float fogFactor = 1. - min( exp(-vFogDepth / GeometryLayer.fogDistance), 1.);
    gl_FragColor.rgb = mix(gl_FragColor.rgb, GeometryLayer.fogColor, fogFactor);
#endif
