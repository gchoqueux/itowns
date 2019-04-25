import Extent from 'Core/Geographic/Extent';
import computeBuffers from 'Core/Prefab/computeBufferTileGeometry';
import PlanarEllipsoidTile from 'Core/Prefab/Planar/PlanarTileBuilder';
import BuilderEllipsoidTile from 'Core/Prefab/Globe/BuilderEllipsoidTile';
import proj4 from 'proj4';

proj4.defs('EPSG:3946',
    '+proj=lcc +lat_1=45.25 +lat_2=46.75 +lat_0=46 +lon_0=3 +x_0=1700000 +y_0=5200000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs');


const builderEllipsoidTile = new BuilderEllipsoidTile();
const planarEllipsoidTile = new PlanarEllipsoidTile();

const extent = new Extent('EPSG:4326', [0, 0, 0, 0]);

addEventListener('message', (e) => {
    const params = e.data;
    extent.crs = params.extent.crs;
    extent.copy(params.extent);

    params.extent = extent;
    params.builder = params.builder.type === 'e' ? builderEllipsoidTile : planarEllipsoidTile;
    params.center = params.builder.center(extent).clone();
    const buffers = computeBuffers(params);

    const result = {
        id: e.data.id,
        payload: buffers,
    };
    postMessage(result);
});
