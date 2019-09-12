
function parse(input, layer, extDest) {
    const options = {
        buildExtent: layer.source.isFileSource || !layer.isGeometryLayer,
        crsIn: layer.source.projection,
        crsOut: layer.projection || layer.source.projection,
        // TODO: error in filtering vector tile, filteringExtent: extentDestination.as(layer.projection),
        filteringExtent: !layer.source.isFileSource && layer.isGeometryLayer ? extDest.as(layer.source.projection) : undefined,
        overrideAltitudeInToZero: layer.overrideAltitudeInToZero,
        filter: layer.filter,
        isInverted: layer.source.isInverted,
        mergeFeatures: layer.mergeFeatures === undefined ? true : layer.mergeFeatures,
        withNormal: layer.isGeometryLayer,
        withAltitude: layer.isGeometryLayer,
    };

    return layer.source.parser(input, options).then(parsedFile => layer.source.onParsedFile(parsedFile));
}

function convert(input, layer, extent) {
    return layer.convert(input, extent, layer);
}

function fetch(input, layer) {
    return layer.source.fetcher(layer.source.urlFromExtent(input), layer.source.networkOptions).then((fet) => {
        // only  for vector tile
        fet.coords = input;
        return fet;
    });
}

fetch.type = ['Extent', 'Url'];

class Job {
    constructor(f, e = err => err) {
        this._f = f;
        this._error = e;
    }
    error(e) {
        this._error(e);
    }
    run(input, params, layer, type) {
        return type.includes(input.constructor.name) ? this._f(input, layer, ...params) : input;
    }
}

const jobs = [new Job(fetch), new Job(parse), new Job(convert)];

class Command {
    constructor(layer, params, source = layer.source) {
        this.params = params;
        this.layer = layer;
        const nFn = Object.entries(params)[0][0];
        const input = params[nFn].shift();
        this.chain = jobs.slice(jobs.findIndex(a => a._f.name == nFn));
        this.tag = `${source.uid}-${input.toString('-')}`;
        this.type = [fetch.type, layer.source.parser.type, layer.convert.type];
        this.input = () => Promise.resolve(source.parsedData || source.fetchedData || input);
        return this;
    }
    execute() {
        return this.chain.reduce((chain, job, i) => chain.then(input => job.run(input, this.params[job._f.name], this.layer, this.type[i]), job.error.bind(job)), this.input());
    }
}

export default Command;

export class HeaderCommand {
    constructor(view, layer, requester, priority, earlyDropFunction) {
        this.commands = [];
        this.view = view;
        this.layer = layer;
        this.requester = requester;
        this.earlyDropFunction = earlyDropFunction;
        this.priority = priority;
    }
    add(params) {
        this.commands.push(new Command(this.layer, params));
    }
}
