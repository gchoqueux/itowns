import * as THREE from 'three';
import Worker from 'Converter/Feature2Mesh.worker';
import Wrapper from 'Core/Worker/Wrapper';

const material = new THREE.MeshBasicMaterial({ vertexColors: THREE.VertexColors });
const lineMaterial = new THREE.LineBasicMaterial({ vertexColors: THREE.VertexColors });

const wrapperFeature2Mesh = [];
const WORKERS_COUNT = 2;

for (let i = 0; i < WORKERS_COUNT; i++) {
    wrapperFeature2Mesh[i] = new Wrapper(new Worker());
}

const resolve = [];
const styleLoaded = [];
let b = 0;
/**
 * @module VectorTileParser
 */
export default {
    /**
     * Parse a vector tile file and return a [Feature]{@link module:GeoJsonParser.Feature}
     * or an array of Features. While multiple formats of vector tile are
     * available, the only one supported for the moment is the
     * [Mapbox Vector Tile]{@link https://www.mapbox.com/vector-tiles/specification/}.
     *
     * @param {ArrayBuffer} file - The vector tile file to parse.
     * @param {Object} options - Options controlling the parsing.
     * @param {Extent} options.extent - The Extent to convert the input coordinates to.
     * @param {Extent} options.coords - Coordinates of the layer.
     * @param {Extent=} options.filteringExtent - Optional filter to reject features
     * outside of this extent.
     * @param {boolean} [options.mergeFeatures=true] - If true all geometries are merged by type and multi-type
     * @param {boolean} [options.withNormal=true] - If true each coordinate normal is computed
     * @param {boolean} [options.withAltitude=true] - If true each coordinate altitude is kept
     * @param {function=} options.filter - Filter function to remove features.
     * @param {string=} options.isInverted - This option is to be set to the
     * correct value, true or false (default being false), if the computation of
     * the coordinates needs to be inverted to same scheme as OSM, Google Maps
     * or other system. See [this link]{@link
     * https://alastaira.wordpress.com/2011/07/06/converting-tms-tile-coordinates-to-googlebingosm-tile-coordinates}
     * for more informations.
     *
     * @return {Promise} A Promise resolving with a Feature or an array a
     * Features.
     */
    parse(file, options) {
        const i = (b++) % wrapperFeature2Mesh.length;
        options.filter = undefined;
        options.extentSource = file.coords;
        if (!styleLoaded[i]) {
            styleLoaded[i] = new Promise((r) => {
                resolve[i] = r;
            });
            wrapperFeature2Mesh[i].oche({ style: options.style }).then(() => {
                resolve[i]();
            });
        }
        delete options.style;
        return styleLoaded[i].then(() =>
            wrapperFeature2Mesh[i].oche({ file, options }).then((result) => {
                const { mes, translation, scale } =  result;
                const group = new THREE.Group();
                if (mes) {
                    mes.forEach((m) => {
                        const geom = new THREE.BufferGeometry();
                        geom.addAttribute('position', new THREE.BufferAttribute(m.position, 3));
                        geom.addAttribute('color', new THREE.BufferAttribute(m.color, 3, true));
                        if (m.index) {
                            geom.setIndex(new THREE.BufferAttribute(new Uint16Array(m.index), 1));
                        }
                        if (m.boundingSphere) {
                            geom.boundingSphere = new THREE.Sphere().copy(m.boundingSphere);
                        }
                        if (m.type == 'Mesh') {
                            group.add(new THREE.Mesh(geom, material));
                        } else if (m.type ==  'LineSegments') {
                            group.add(new THREE.LineSegments(geom, lineMaterial));
                        }
                    });
                }

                if (translation) {
                    group.position.sub(translation);
                    group.scale.divide(scale);
                }
                group.updateMatrixWorld(true);
                return { mesh: Promise.resolve(group), isFeatureCollection: true, extent: file.coords };
            }));
    },
};
