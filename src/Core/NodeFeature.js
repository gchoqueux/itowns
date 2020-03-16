export class Node {
    constructor(layer) {
        this.layer = layer;
        this.source = layer.source;
        this.opt = {
            crsIn: this.source.projection,
            crsOut: layer.projection,
            filter: layer.filter || this.source.filter,
            // Use with VT only??
            isInverted: this.source.isInverted,
        };
    }
}

class NodeFeature extends Node {
    constructor(extent, layer) {
        super(layer);
        this.extent = extent;

        this.opt.buildExtent = this.source.isFileSource !== undefined;
        this.opt.extentSource = extent;
        this.opt.overrideAltitudeInToZero = layer.overrideAltitudeInToZero;
        this.opt.mergeFeatures = layer.mergeFeatures === undefined ? true : layer.mergeFeatures;
        this.opt.withNormal = true;
        this.opt.withAltitude = true;
    }
    load() {
        return this.source.fetcher(this.source.urlFromExtent(this.extent))
            .then((f) => {
                // TODO FIXME: error in filtering vector tile
                this.opt.filteringExtent = !this.source.isFileSource ? this.extent.as(this.source.projection) : undefined;
                return this.source.parser(f, this.opt);
            })
            .then(p => this.layer.convert(p, this.extent, this.layer));
    }
}

export default NodeFeature;

