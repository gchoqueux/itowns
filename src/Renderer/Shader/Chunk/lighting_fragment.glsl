if (GeometryLayer.lightingEnabled) {
    float light = min(2. * dot(vNormal, GeometryLayer.lightPosition), 1.);
    gl_FragColor.rgb *= light;
}
