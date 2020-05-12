import * as THREE from 'three';
import LayerUpdateState from 'Layer/LayerUpdateState';
import ObjectRemovalHelper from 'Process/ObjectRemovalHelper';
import handlingError from 'Process/handlerNodeError';
import Coordinates from 'Core/Geographic/Coordinates';
import NodeFeature from 'Core/NodeFeature';


const coord = new Coordinates('EPSG:4326', 0, 0, 0);
const mat4 = new THREE.Matrix4();

function applyMatrix4(obj, mat4) {
    if (obj.geometry) {
        obj.geometry.applyMatrix4(mat4);
    }
    obj.children.forEach(c => applyMatrix4(c, mat4));
}

// Replace in FeatureNode
function extentInsideSource(extent, source) {
    return !source.extentInsideLimit(extent) ||
        (source.isFileSource && !extent.isPointInside(source.extent.center(coord)));
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
        } else if (!node.layerUpdateState[layer.id].canTryUpdate()) {
            return;
        }

        const extents = node.getExtentsByProjection(layer.source.projection) || [node.extent.as(layer.source.projection)];

        for (const extent of extents) {
            if (extentInsideSource(extent, layer.source)) {
                node.layerUpdateState[layer.id].noMoreUpdatePossible();
                return;
            }
        }

        node.layerUpdateState[layer.id].newTry();

        const command = {
            layer,
            view: context.view,
            threejsLayer: layer.threejsLayer,
            requester: node,
            nodeLayer: new NodeFeature(layer, extents[0]),
        };

        return context.scheduler.execute(command).then((result) => {
            // if request return empty json, WFSProvider.getFeatures return undefined
            // result = result[0];
            if (result) {
                node.layerUpdateState[layer.id].noMoreUpdatePossible();
                if (!node.parent) {
                    ObjectRemovalHelper.removeChildrenAndCleanupRecursively(layer, result);
                    return;
                }
                // We don't use node.matrixWorld here, because feature coordinates are
                // expressed in crs coordinates (which may be different than world coordinates,
                // if node's layer is attached to an Object with a non-identity transformation)
                if (!result.isApplied) {
                    result.isApplied = true;
                    // NOTE: now data source provider use cache on Mesh
                    // TODO move transform in feature2Mesh
                    mat4.copy(node.matrixWorld).getInverse(mat4).elements[14] -= result.minAltitude;
                    applyMatrix4(result, mat4);
                }

                if (result.minAltitude) {
                    result.position.z = result.minAltitude;
                }
                node.add(result);
                result.updateMatrixWorld();
            } else {
                node.layerUpdateState[layer.id].failure(1, true);
            }
        },
        err => handlingError(err, node, layer, node.level, context.view));
    },
};
