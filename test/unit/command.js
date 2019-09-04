/* eslint-disable no-console */
import assert from 'assert';
// import fs from 'fs';
import ColorLayer from 'Layer/ColorLayer';
// import FileSource from 'Source/FileSource';
// import Extent from 'Core/Geographic/Extent';
// import Fetcher from 'Provider/Fetcher';
// import Command from 'Core/Command';
import Renderer from './mock';

// new Renderer();

// const extent = new Extent('WMTS:WGS84', 0, 0, 0);

describe('command', function () {
    it('test', () => {
        // const source = new FileSource({
        //     url: 'https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/departements/09-ariege/departement-09-ariege.geojson',
        //     projection: 'EPSG:4326',
        //     format: 'geojson',
        // });

        // const layer = new ColorLayer('test', { source, projection: 'EPSG:4326' });
        // const command = new Command(layer, new Extent('WMTS:PM', 8, 94, 129), extent);
        // command.execute().then((r) => {
        //     console.log(r.coords);
        //     new Command(layer, new Extent('WMTS:PM', 8, 93, 129), extent).execute().then(r => console.log(r.coords));
        // });

        // const kmlSource = new FileSource({
        //     url: 'https://raw.githubusercontent.com/iTowns/iTowns2-sample-data/master/croquis.kml',
        //     projection: 'EPSG:4326',
        //     format: 'application/kml',
        // });
        // const kmlLayer = new ColorLayer('Kml', {
        //     name: 'kml',
        //     source: kmlSource,
        //     projection: 'EPSG:4326', // ??
        // });

        // const commandKML = new Command(kmlLayer, new Extent('WMTS:PM', 12, 1458, 2125), extent);
        // commandKML.execute().then(r => console.log(r.coords));

        // const gpxSource = new FileSource({
        //     url: 'https://raw.githubusercontent.com/iTowns/iTowns2-sample-data/master/ULTRA2009.gpx',
        //     projection: 'EPSG:4326',
        //     format: 'application/gpx',
        // });
        // const GpxLayer = new ColorLayer('Gpx', {
        //     name: 'Gpx',
        //     source: gpxSource,
        //     projection: 'EPSG:4326', // ??
        // });

        // const commandGpx = new Command(GpxLayer, new Extent('WMTS:PM', 11, 752, 1024), extent);
        // commandGpx.execute().then(r => console.log(r.coords));

        // Fetcher.json('https://raw.githubusercontent.com/Oslandia/postile-openmaptiles/master/style.json').then((style) => {
        //     const vtSource = new FileSource({
        //         url: 'https://osm.oslandia.io/data/v3/6/31/28.pbf',
        //         projection: 'EPSG:3857',
        //         format: 'application/x-protobuf;type=mapbox-vector',
        //     });
        //     const vtLayer = new ColorLayer('vt', {
        //         name: 'vt',
        //         source: vtSource,
        //         projection: 'EPSG:3857', // ??
        //         filter: style.layers,
        //     });

        //     const commandvt = new Command(vtLayer, new Extent('WMTS:PM', 6, 31, 28), new Extent('WMTS:PM', 6, 31, 28));
        //     commandvt.execute().then(r => console.log(r.coords));
        // });

        assert.ok(true);
    });
});
