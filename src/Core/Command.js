
function parse(input, layer, extentFiltering) {
    const options = {
        buildExtent: layer.source.isFileSource || !layer.isGeometryLayer,
        crsIn: layer.source.projection,
        crsOut: layer.projection || layer.source.projection,
        // TODO: error in filtering vector tile, filteringExtent: extentDestination.as(layer.projection),
        // extentFiltering could be a filtering in convert
        filteringExtent: !layer.source.isFileSource && layer.isGeometryLayer ? extentFiltering.as(layer.source.projection) : undefined,
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
    if (input.constructor.name == 'FeatureCollection') { return input; }
    return layer.source.fetcher(layer.source.urlFromExtent(input), layer.source.networkOptions).then((fet) => {
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
        console.error(`on ${this.name}`);
        this._error(e, `Command job error on ${this.name}`);
    }
    run(input, params, layer, type) {
        return type.includes(input.constructor.name) ? this._f(input, layer, ...params) : input;
    }
    get name() {
        return this._f.name;
    }
}

const jobs = { fetch: new Job(fetch), parse: new Job(parse), convert: new Job(convert) };

class Command {
    constructor(layer, params, source = layer.source) {
        this.params = params;
        this.layer = layer;
        const entries = Object.entries(params);
        const nFn = entries[0][0];

        // build jobs chain
        this.chain = entries.map(e => jobs[e[0]]);

        const input = params[nFn].shift();
        const tagExtent = input.isExtent ? input : params[nFn][0];
        this.tag = `${source.uid}-${tagExtent.toString('-')}`;
        this.type = { fetch: fetch.type, parse: layer.source.parser.type, convert: layer.convert.type };
        this.input = () => Promise.resolve(source.parsedData || source.fetchedData || input);
    }
    execute() {
        return this.chain.reduce((chain, job) => chain.then(input => job.run(input, this.params[job.name], this.layer, this.type[job.name]), job.error.bind(job)), this.input());
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
        const command = new Command(this.layer, params);
        this.commands.push(command);
        return command;
    }
}
