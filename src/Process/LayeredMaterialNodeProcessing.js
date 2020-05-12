import { chooseNextLevelToFetch } from 'Layer/LayerUpdateStrategy';
import LayerUpdateState from 'Layer/LayerUpdateState';
import handlingError from 'Process/handlerNodeError';

export const SIZE_TEXTURE_TILE = 256;
export const SIZE_DIAGONAL_TEXTURE = Math.pow(2 * (SIZE_TEXTURE_TILE * SIZE_TEXTURE_TILE), 0.5);

function refinementCommandCancellationFn(cmd) {
    if (!cmd.requester.parent || !cmd.requester.material) {
        return true;
    }
    // Cancel the command if the tile already has a better texture.
    // This is only needed for elevation layers, because we may have several
    // concurrent layers but we can only use one texture.
    if (cmd.layer.isElevationLayer && cmd.requester.material.getElevationLayer() &&
        cmd.targetLevel <= cmd.requester.material.getElevationLayer().level) {
        return true;
    }

    return !cmd.requester.material.visible;
}

export function updateRasterNodeLayer(context, layer, node, parent) {
    const material = node.material;
    if (!parent || !material) {
        return;
    }

    const id = layer.id;
    const nodeLayer = material.getLayer(id) || material.addLayer(layer, node.getExtentsByProjection(layer.projection));

    if (!node.layerUpdateState[id]) {
        node.layerUpdateState[id] = new LayerUpdateState();

        nodeLayer.init(parent.material && parent.material.getLayer(id));

        if (nodeLayer.level >= layer.source.zoom.min) {
            context.view.notifyChange(node, false);
            return;
        }
    }

    if (node.pendingSubdivision || !material.visible || !node.layerUpdateState[id].canTryUpdate() ||
        layer.frozen || !layer.visible) {
        return;
    }

    nodeLayer.loadZoom = chooseNextLevelToFetch(nodeLayer, node.layerUpdateState[id].failureParams);

    if (nodeLayer.level >= nodeLayer.maxZoom ||
        nodeLayer.loadZoom <= nodeLayer.level || nodeLayer.loadZoom > nodeLayer.maxZoom) {
        node.layerUpdateState[id].noMoreUpdatePossible();
        return;
    }

    node.layerUpdateState[id].newTry();
    const command = {
        view: context.view,
        layer,
        requester: node,
        priority: 100,
        earlyDropFunction: refinementCommandCancellationFn,
        nodeLayer,
    };

    return context.scheduler.execute(command).then(
        () => {
            // TODO: Handle error : result is undefined in provider. throw error
            node.layerUpdateState[id].success();
        },
        err => handlingError(err, node, layer, nodeLayer.loadZoom, context.view));
}

export function removeLayeredMaterialNodeLayer(layerId) {
    return function removeLayeredMaterialNodeLayer(node) {
        if (node.material && node.material.removeLayer) {
            node.material.removeLayer(layerId);
            if (node.material.elevationLayerIds[0] == layerId) {
                node.setBBoxZ(0, 0);
            }
        }
        if (node.layerUpdateState && node.layerUpdateState[layerId]) {
            delete node.layerUpdateState[layerId];
        }
    };
}
