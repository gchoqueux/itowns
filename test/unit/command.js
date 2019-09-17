/* eslint-disable */
import assert from 'assert';

import Renderer from './mock';
const renderer = new Renderer();

import fs from 'fs';
import ColorLayer from 'Layer/ColorLayer';
import FileSource from 'Source/FileSource';
import Extent from 'Core/Geographic/Extent';
import Fetcher from 'Provider/Fetcher';
import Command, { HeaderCommand } from 'Core/Command';
import HttpsProxyAgent from 'https-proxy-agent';

const networkOptions = process.env.HTTPS_PROXY ? { agent: new HttpsProxyAgent(process.env.HTTPS_PROXY) } : null;

const extent = new Extent('WMTS:WGS84', 0, 0, 0);

const urlJsonAriege = 'https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/departements/09-ariege/departement-09-ariege.geojson';

describe('command', function () {
    it('fetch geojson and convert to texture', (done) => {
        const source = new FileSource({
            url: urlJsonAriege,
            projection: 'EPSG:4326',
            format: 'geojson',
            networkOptions,
        });

        const layer = new ColorLayer('test', { source, projection: 'EPSG:4326' });
        const headerCommand = new HeaderCommand({}, layer);
        const rasterExtent = new Extent('WMTS:PM', 8, 94, 129);
        const command = headerCommand.add({fetch: [extent], parse: [rasterExtent], convert: [rasterExtent]} );
        command.execute().then((r) => {
            assert.ok(r.isTexture);
            assert.equal(r.coords.zoom, rasterExtent.zoom);
            assert.equal(r.coords.col, rasterExtent.col);
            assert.equal(r.coords.row, rasterExtent.row);
            done();
        });
    });

    // it('fetch', (done) => {
    //     const source = new FileSource({
    //         url: urlJsonAriege
    //         projection: 'EPSG:4326',
    //         format: 'geojson',
    //         networkOptions,
    //     });

    //     const layer = new ColorLayer('test', { source, projection: 'EPSG:4326' });
    //     const rasterExtent = new Extent('WMTS:PM', 8, 94, 129);
    //     const command = new Command(layer, {fetch: [extent], convert: [rasterExtent], parse: [rasterExtent]});
    //     command.execute().then((r) => {
    //         // console.log('r', r);
    //         done();
    //     });
    // });

    it('fetch', (done) => {
        const source = new FileSource({
            url: urlJsonAriege,
            projection: 'EPSG:4326',
            format: 'geojson',
            networkOptions,
        });

        const layer = new ColorLayer('test', { source, projection: 'EPSG:4326' });
        const command = new Command(layer, { fetch: [extent] });
        command.execute().then((r) => {
            done();
        });
    });
    // it('fetch kml and convert to texture', (done) => {
    //     const kmlSource = new FileSource({
    //         url: 'https://raw.githubusercontent.com/iTowns/iTowns2-sample-data/master/croquis.kml',
    //         projection: 'EPSG:4326',
    //         format: 'application/kml',
    //         networkOptions,
    //     });
    //     const kmlLayer = new ColorLayer('Kml', {
    //         name: 'kml',
    //         source: kmlSource,
    //         projection: 'EPSG:4326',
    //     });

    //     const rasterExtent = new Extent('WMTS:PM', 12, 1458, 2125);
    //     const commandKML = new Command(kmlLayer, {fetch: [extent], parse: [rasterExtent], convert: [rasterExtent]} );
    //     assert.ok(true);
    //     // doesn't work because new window.DOMParser() is not defined
    //     commandKML.execute().then(r => {
    //         assert.ok(r.isTexture);
    //         assert.equal(r.coords.zoom, rasterExtent.zoom);
    //         assert.equal(r.coords.col, rasterExtent.col);
    //         assert.equal(r.coords.row, rasterExtent.row);
    //         done();
    //     }, err => {
    //         done();
    //     });
    // });
    // it('fetch gpx and convert to texture', (done) => {
    //     const gpxSource = new FileSource({
    //         url: 'https://raw.githubusercontent.com/iTowns/iTowns2-sample-data/master/ULTRA2009.gpx',
    //         projection: 'EPSG:4326',
    //         format: 'application/gpx',
    //         networkOptions,
    //     });
    //     const gpxLayer = new ColorLayer('Gpx', {
    //         name: 'Gpx',
    //         source: gpxSource,
    //         projection: 'EPSG:4326', // ??
    //     });

    //     const rasterExtent = new Extent('WMTS:PM', 11, 752, 1024);
    //     const commandGpx = new Command(gpxLayer, {fetch: [extent], parse: [rasterExtent], convert: [rasterExtent]} );
    //     commandGpx.execute().then((r) => {
    //         assert.ok(r.isTexture);
    //         assert.equal(r.coords.zoom, rasterExtent.zoom);
    //         assert.equal(r.coords.col, rasterExtent.col);
    //         assert.equal(r.coords.row, rasterExtent.row);
    //         done();
    //     }, err => {
    //         done();
    //     });
    // });

    // it('fetch vector tile and convert to texture', (done) => {
    //     Fetcher.json('https://raw.githubusercontent.com/Oslandia/postile-openmaptiles/master/style.json', networkOptions).then((style) => {
    //         const vtSource = new FileSource({
    //             url: 'https://osm.oslandia.io/data/v3/6/31/28.pbf',
    //             projection: 'EPSG:3857',
    //             format: 'application/x-protobuf;type=mapbox-vector',
    //             networkOptions,
    //         });
    //         const vtLayer = new ColorLayer('vt', {
    //             name: 'vt',
    //             source: vtSource,
    //             projection: 'EPSG:3857', // ??
    //             filter: style.layers,
    //         });
    //         const rasterExtent = new Extent('WMTS:PM', 6, 31, 28);
    //         const commandvt = new Command(vtLayer, {fetch: [rasterExtent], parse: [rasterExtent], convert: [rasterExtent]} );
    //         commandvt.execute().then((r) => {
    //             assert.ok(r.isTexture);
    //             assert.equal(r.coords.zoom, rasterExtent.zoom);
    //             assert.equal(r.coords.col, rasterExtent.col);
    //             assert.equal(r.coords.row, rasterExtent.row);
    //             done();
    //         });
    //     });
    // });
});
