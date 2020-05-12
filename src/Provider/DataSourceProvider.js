// REMOVE ME
export function parseSourceData(data, extDest, layer) {
    const source = layer.source;

    const options = {
        buildExtent: source.isFileSource || !layer.isGeometryLayer,
        crsIn: source.projection,
        crsOut: layer.projection,
        // TODO FIXME: error in filtering vector tile
        // filteringExtent: extentDestination.as(layer.projection),
        filteringExtent: !source.isFileSource && layer.isGeometryLayer ? extDest.as(source.projection) : undefined,
        overrideAltitudeInToZero: layer.overrideAltitudeInToZero,
        filter: layer.filter || source.filter,
        isInverted: source.isInverted,
        mergeFeatures: layer.mergeFeatures === undefined ? true : layer.mergeFeatures,
        // TODO Verify withNormal and withAltitude is used
        withNormal: layer.isGeometryLayer !== undefined,
        withAltitude: layer.isGeometryLayer !== undefined,
        layers: source.layers,
    };

    return source.parser(data, options).then(parsedFile => source.onParsedFile(parsedFile));
}

export default {
    executeCommand(command) {
        return command.nodeLayer.load();
    },
};
