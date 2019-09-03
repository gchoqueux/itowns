
/* eslint-disable no-console */
import ColorLayer from 'Layer/ColorLayer';
import FileSource from 'Source/FileSource';
import Extent from 'Core/Geographic/Extent';
import Fetcher from 'Provider/Fetcher';

function parse(input, extDest, layer, source = layer.source) {
    const options = {
        buildExtent: source.isFileSource || !layer.isGeometryLayer,
        crsIn: source.projection,
        crsOut: layer.projection || source.projection,
        // TODO: error in filtering vector tile, filteringExtent: extentDestination.as(layer.projection),
        filteringExtent: !source.isFileSource && layer.isGeometryLayer ? extDest.as(source.projection) : undefined,
        overrideAltitudeInToZero: layer.overrideAltitudeInToZero,
        filter: layer.filter,
        isInverted: source.isInverted,
        mergeFeatures: layer.mergeFeatures === undefined ? true : layer.mergeFeatures,
        withNormal: layer.isGeometryLayer,
        withAltitude: layer.isGeometryLayer,
    };

    return source.parser(input, options).then(parsedFile => source.onParsedFile(parsedFile));
}

function convert(input, extDest, layer) {
    return layer.convert(input, extDest, layer);
}

function fetch(input, extDest, layer, source = layer.source) {
    return source.fetcher(source.urlFromExtent(input), source.networkOptions).then((fet) => {
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
    run(input, params, type) {
        return type.includes(input.constructor.name) ? this._f(input, ...params) : input;
    }
}

const jobs = [new Job(fetch), new Job(parse), new Job(convert)];

/**
 * this.target = 'isTexture' can be added to check result command
 * validedData can be added in test to determine this.input.
 * @class Command
 */
class Command {
    constructor(layer, extDest, input, source = layer.source) {
        this.params = [extDest, layer];
        this.type = [fetch.type, source.parser.type, layer.convert.type];
        this.input = () => Promise.resolve(layer.source.parsedData || layer.source.fetchedData || input);
        return this;
    }
    execute() {
        return jobs.reduce((chain, job, i) => chain.then(input => job.run(input, this.params, this.type[i]), job.error.bind(job)), this.input());
    }
}

const extent = new Extent('WMTS:WGS84', 0, 0, 0);

const source = new FileSource({
    url: 'https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/departements/09-ariege/departement-09-ariege.geojson',
    projection: 'EPSG:4326',
    format: 'geojson',
});

const layer = new ColorLayer('test', { source, projection: 'EPSG:4326' });
const command = new Command(layer, new Extent('WMTS:PM', 8, 94, 129), extent);
command.execute().then((r) => {
    console.log(r.coords);
    new Command(layer, new Extent('WMTS:PM', 8, 93, 129), extent).execute().then(r => console.log(r.coords));
});

const kmlSource = new FileSource({
    url: 'https://raw.githubusercontent.com/iTowns/iTowns2-sample-data/master/croquis.kml',
    projection: 'EPSG:4326',
    format: 'application/kml',
});
const kmlLayer = new ColorLayer('Kml', {
    name: 'kml',
    source: kmlSource,
    projection: 'EPSG:4326', // ??
});

const commandKML = new Command(kmlLayer, new Extent('WMTS:PM', 12, 1458, 2125), extent);
commandKML.execute().then(r => console.log(r.coords));

const gpxSource = new FileSource({
    url: 'https://raw.githubusercontent.com/iTowns/iTowns2-sample-data/master/ULTRA2009.gpx',
    projection: 'EPSG:4326',
    format: 'application/gpx',
});
const GpxLayer = new ColorLayer('Gpx', {
    name: 'Gpx',
    source: gpxSource,
    projection: 'EPSG:4326', // ??
});

const commandGpx = new Command(GpxLayer, new Extent('WMTS:PM', 11, 752, 1024), extent);
commandGpx.execute().then(r => console.log(r.coords));

Fetcher.json('https://raw.githubusercontent.com/Oslandia/postile-openmaptiles/master/style.json').then((style) => {
    const vtSource = new FileSource({
        url: 'https://osm.oslandia.io/data/v3/6/31/28.pbf',
        projection: 'EPSG:3857',
        format: 'application/x-protobuf;type=mapbox-vector',
    });
    const vtLayer = new ColorLayer('vt', {
        name: 'vt',
        source: vtSource,
        projection: 'EPSG:3857', // ??
        filter: style.layers,
    });

    const commandvt = new Command(vtLayer, new Extent('WMTS:PM', 6, 31, 28), new Extent('WMTS:PM', 6, 31, 28));
    commandvt.execute().then(r => console.log(r.coords));
});

export default Command;
