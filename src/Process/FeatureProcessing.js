import * as THREE from 'three';
import LayerUpdateState from 'Layer/LayerUpdateState';
import ObjectRemovalHelper from 'Process/ObjectRemovalHelper';
import handlingError from 'Process/handlerNodeError';
import Coordinates from 'Core/Geographic/Coordinates';

const coord = new Coordinates('EPSG:4326', 0, 0, 0);
// const mat4 = new THREE.Matrix4();

// function applyMatrix4(obj, mat4) {
//     if (obj.geometry) {
//         obj.geometry.applyMatrix4(mat4);
//     }
//     obj.children.forEach(c => applyMatrix4(c, mat4));
// }
//
const v1 = new THREE.Vector3();
const v2 = new THREE.Vector3();
const a =  new Coordinates('EPSG:4326',  0, 0, 0);
const b =  new Coordinates('EPSG:4326',  0, 0, 0);

function assignLayer(object, layer) {
    if (object) {
        object.layer = layer;
        if (object.material) {
            object.material.transparent = layer.opacity < 1.0;
            object.material.opacity = layer.opacity;
            object.material.wireframe = layer.wireframe;

            if (layer.size) {
                object.material.size = layer.size;
            }
            if (layer.linewidth) {
                object.material.linewidth = layer.linewidth;
            }
        }
        object.layers.set(layer.threejsLayer);
        for (const c of object.children) {
            assignLayer(c, layer);
        }
        return object;
    }
}

function extentInsideSource(extent, source, extNode) {
    return !source.extentInsideLimit(extent) ||
        (source.isFileSource && !extent.isPointInside(source.extent.center(coord)))  ||
        (source.isVectorTilesSource && !extNode.isPointInside(extent.as(extNode.crs).center(coord)));
}

export default {
    update(context, layer, node) {
        if (!node.parent && node.children.length) {
            // if node has been removed dispose three.js resource
            ObjectRemovalHelper.removeChildrenAndCleanupRecursively(layer, node);
            return;
        }
        if (!node.visible) {
            return;
        }

        if (node.layerUpdateState[layer.id] === undefined) {
            node.layerUpdateState[layer.id] = new LayerUpdateState();
        }

        if (!node.layerUpdateState[layer.id].canTryUpdate()) {
            return;
        }

        const features = node.children.filter(n => n.layer == layer);

        if (features.length > 0) {
            return features;
        }

        const extentsDestination = node.getExtentsByProjection(layer.source.projection) || [node.extent];

        const extentsSource = [];
        for (const extentDest of extentsDestination) {
            const ext = layer.source.projection == extentDest.crs ? extentDest : extentDest.as(layer.source.projection);
            ext.zoom = extentDest.zoom;
            if (!extentInsideSource(ext, layer.source, node.extent)) {
                extentsSource.push(extentDest);
            }
        }
        if (extentsSource.length == 0) {
            node.layerUpdateState[layer.id].noMoreUpdatePossible();
            return;
        }

        node.layerUpdateState[layer.id].newTry();

        const command = {
            layer,
            extentsSource,
            view: context.view,
            threejsLayer: layer.threejsLayer,
            requester: node,
        };

        return context.scheduler.execute(command).then((results) => {
            // if request return empty json, WFSProvider.getFeatures return undefined
            // console.log('node', node.level);
            // eslint-disable-next-line no-debugger
            // debugger;
            for (let i = 0; i < results.length; i++) {
                const result = results[i];
                if (!result /* || !result.feature */) {
                    break;
                }
                // node
                // eslint-disable-next-line no-debugger
                // debugger;
                const isApplied = !result.layer;
                assignLayer(result, layer);
                // call onMeshCreated callback if needed
                if (layer.onMeshCreated) {
                    layer.onMeshCreated(result);
                }
                node.layerUpdateState[layer.id].success();
                if (!node.parent) {
                    ObjectRemovalHelper.removeChildrenAndCleanupRecursively(layer, result);
                    return;
                }
                // We don't use node.matrixWorld here, because feature coordinates are
                // expressed in crs coordinates (which may be different than world coordinates,
                // if node's layer is attached to an Object with a non-identity transformation)
                if (isApplied) {
                    // NOTE: now data source provider use cache on Mesh
                    // TODO move transform in feature2Mesh
                    // mat4.copy(node.matrixWorld).getInverse(mat4).elements[14] -= result.minAltitude;
                    // applyMatrix4(result, mat4);

                    const feature = result.feature || result.children[0].feature;
                    coord.crs = feature.crs;
                    const exPM = extentsSource[i].as(feature.crs);
                    a.crs =  feature.crs;
                    b.crs =  feature.crs;
                    a.setFromValues(exPM.west, exPM.north, 0);
                    b.setFromValues(exPM.west, exPM.south, 0);
                    a.as(context.view.referenceCrs, a);
                    b.as(context.view.referenceCrs, b);
                    a.toVector3(v1);
                    b.toVector3(v2);
                    const d = v1.distanceTo(v2);
                    const scale =  d / (exPM.north - exPM.south);
                    // rotate
                    result.rotateZ(Math.PI * 0.5);
                    // position
                    exPM.center(coord);
                    coord.as(context.view.referenceCrs, coord);
                    coord.toVector3(result.position);
                    node.worldToLocal(result.position);
                    // const geometry = new THREE.BoxGeometry(4096 / feature.scale.x, 4096 / feature.scale.y, 150);
                    // const material = new THREE.MeshBasicMaterial({ wireframe: true });
                    // const cube = new THREE.Mesh(geometry, material);
                    // cube.position.set(2048 / feature.scale.x, 2048 / feature.scale.y, 0);
                    // result.add(cube);
                    // result.add(new THREE.AxesHelper(500));
                    result.translateX(-d / 2);
                    result.translateY(d / 2);
                    result.scale.set(scale / feature.scale.x, scale / feature.scale.y, 1);
                }

                if (result.minAltitude) {
                    result.position.z = result.minAltitude;
                }
                result.layer = layer;
                node.add(result);
                node.updateMatrixWorld();
            }
            // else {
            //     node.layerUpdateState[layer.id].failure(1, true);
            // }
        },
        err => handlingError(err, node, layer, node.level, context.view));
    },
};
