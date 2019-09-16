import { chooseNextLevelToFetch } from 'Layer/LayerUpdateStrategy';
import LayerUpdateState from 'Layer/LayerUpdateState';
import { computeMinMaxElevation } from 'Parser/XbilParser';
import handlingError from 'Process/handlerNodeError';
import { HeaderCommand } from 'Core/Command';

export const SIZE_TEXTURE_TILE = 256;
export const SIZE_DIAGONAL_TEXTURE = Math.pow(2 * (SIZE_TEXTURE_TILE * SIZE_TEXTURE_TILE), 0.5);

function queuePriority(material) {
    // We know that 'node' is visible because commands can only be
    // issued for visible nodes.
    // TODO: need priorization of displayed nodes
    // Then prefer displayed node over non-displayed one
    return material.visible ? 100 : 10;
}

function cmdCancellation(cmd) {
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

export function updateLayeredMaterialNodeImagery(context, layer, node, parent) {
    const material = node.material;
    if (!parent || !material) {
        return;
    }
    const extentsRaster = node.getExtentsByProjection(layer.projection);

    let nodeLayer = material.getLayer(layer.id);

    // Initialisation
    if (node.layerUpdateState[layer.id] === undefined) {
        node.layerUpdateState[layer.id] = new LayerUpdateState();

        if (!layer.source.extentsInsideLimit(extentsRaster)) {
            // we also need to check that tile's parent doesn't have a texture for this layer,
            // because even if this tile is outside of the layer, it could inherit it's
            // parent texture
            if (!layer.noTextureParentOutsideLimit &&
                parent.material &&
                parent.material.getLayer &&
                parent.material.getLayer(layer.id)) {
                // ok, we're going to inherit our parent's texture
            } else {
                node.layerUpdateState[layer.id].noMoreUpdatePossible();
                return;
            }
        }

        if (!nodeLayer) {
            // Create new MaterialLayer
            nodeLayer = material.addLayer(layer);
            // Init the new MaterialLayer by parent
            const parentLayer = parent.material && parent.material.getLayer(layer.id);
            nodeLayer.initFromParent(parentLayer, extentsRaster);
        }

        // Proposed new process, two separate processes:
        //      * FIRST PASS: initNodeXXXFromParent and get out of the function
        //      * SECOND PASS: Fetch best texture

        // The two-step allows you to filter out unnecessary requests
        // Indeed in the second pass, their state (not visible or not displayed) can block them to fetch
        if (nodeLayer.level >= layer.source.zoom.min) {
            context.view.notifyChange(node, false);
            return;
        }
    }

    // Node is hidden, no need to update it
    if (!material.visible) {
        return;
    }

    // TODO: move this to defineLayerProperty() declaration
    // to avoid mixing layer's network updates and layer's params
    // Update material parameters
    if (nodeLayer) {
        nodeLayer.visible = layer.visible;
        nodeLayer.opacity = layer.opacity;
    }

    // An update is pending / or impossible -> abort
    if (!layer.visible || !node.layerUpdateState[layer.id].canTryUpdate()) {
        return;
    }

    if (nodeLayer.level >= extentsRaster[0].zoom) {
        // default decision method
        node.layerUpdateState[layer.id].noMoreUpdatePossible();
        return;
    }

    // is fetching data from this layer disabled?
    if (layer.frozen) {
        return;
    }

    const failureParams = node.layerUpdateState[layer.id].failureParams;
    const destinationLevel = extentsRaster[0].zoom || node.level;
    const targetLevel = chooseNextLevelToFetch(layer.updateStrategy.type, node, destinationLevel, nodeLayer.level, layer, failureParams);

    if (targetLevel <= nodeLayer.level || targetLevel > destinationLevel) {
        return;
    }

    // Get equivalent of extent destination in source
    const headerCommand = new HeaderCommand(context.view, layer, node, queuePriority(node.material), cmdCancellation);

    // TODO
    // const parsedData = nodeLayer.textures.map(t => t.parsedData);
    for (let i = 0, max = extentsRaster.length; i < max; i++) {
        const extentSource = extentsRaster[i].tiledExtentParent(targetLevel);
        if (!layer.source.extentInsideLimit(extentSource)) {
            // Retry extentInsideLimit because you must check with the targetLevel
            // if the first test extentInsideLimit returns that it is out of limits
            // and the node inherits from its parent, then it'll still make a command to fetch texture.
            node.layerUpdateState[layer.id].noMoreUpdatePossible();
            return;
        }
        // fetch data on extent
        headerCommand.add({ fetch: [extentSource], parse: [extentsRaster[i]], convert: [extentsRaster[i]] });
    }

    node.layerUpdateState[layer.id].newTry();

    return context.scheduler.execute(headerCommand).then(
        (result) => {
            // TODO: Handle error : result is undefined in provider. throw error
            const pitchs = extentsRaster.map((ext, i) => ext.offsetToParent(result[i].coords, nodeLayer.offsetScales[i]));
            nodeLayer.setTextures(result, pitchs);
            node.layerUpdateState[layer.id].success();
        },
        err => handlingError(err, node, layer, targetLevel, context.view));
}

export function updateLayeredMaterialNodeElevation(context, layer, node, parent) {
    const material = node.material;
    if (!parent || !material) {
        return;
    }

    // TODO: we need either
    //  - compound or exclusive layers
    //  - support for multiple elevation layers

    // Elevation is currently handled differently from color layers.
    // This is caused by a LayeredMaterial limitation: only 1 elevation texture
    // can be used (where a tile can have N textures x M layers)
    const extentsRaster = node.getExtentsByProjection(layer.projection);
    // Init elevation layer, and inherit from parent if possible
    let nodeLayer = material.getElevationLayer();
    if (!nodeLayer) {
        nodeLayer = material.addLayer(layer);
    }

    if (node.layerUpdateState[layer.id] === undefined) {
        node.layerUpdateState[layer.id] = new LayerUpdateState();

        const parentLayer = parent.material && parent.material.getLayer(layer.id);
        nodeLayer.initFromParent(parentLayer, extentsRaster);

        // If the texture resolution has a poor precision for this node, we don't
        // extract min-max from the texture (too few information), we instead chose
        // to use parent's min-max.
        const useMinMaxFromParent = extentsRaster[0].zoom - nodeLayer.zoom > 6;
        if (nodeLayer.textures[0]) {
            if (!useMinMaxFromParent) {
                const { min, max } = computeMinMaxElevation(
                    nodeLayer.textures[0].image.data,
                    SIZE_TEXTURE_TILE, SIZE_TEXTURE_TILE,
                    nodeLayer.offsetScales[0]);
                node.setBBoxZ(min, max, layer.scale);
            } else {
                // TODO: to verify we don't pass here,
                // To follow issue, see #1011 https://github.com/iTowns/itowns/issues/1011
            }
        }

        if (nodeLayer.level >= layer.source.zoom.min) {
            context.view.notifyChange(node, false);
            return;
        }
    }

    // Possible conditions to *not* update the elevation texture
    if (layer.frozen ||
            !material.visible ||
            !node.layerUpdateState[layer.id].canTryUpdate()) {
        return;
    }

    const targetLevel = chooseNextLevelToFetch(layer.updateStrategy.type, node, extentsRaster[0].zoom, nodeLayer.level, layer);

    if (targetLevel <= nodeLayer.level || targetLevel > extentsRaster[0].zoom) {
        node.layerUpdateState[layer.id].noMoreUpdatePossible();
        return Promise.resolve();
    }


    const headerCommand = new HeaderCommand(context.view, layer, node, queuePriority(node.material), cmdCancellation);

    for (const extentRaster of extentsRaster) {
        const extentSource = extentRaster.tiledExtentParent(targetLevel);
        if (!layer.source.extentInsideLimit(extentSource)) {
            node.layerUpdateState[layer.id].noMoreUpdatePossible();
            return;
        }
        headerCommand.add({ fetch: [extentSource], parse: [extentRaster], convert: [extentRaster] });
    }

    node.layerUpdateState[layer.id].newTry();

    return context.scheduler.execute(headerCommand).then(
        (textures) => {
            // Do not apply the new texture if its level is < than the current
            // one.  This is only needed for elevation layers, because we may
            // have several concurrent layers but we can only use one texture.
            if (targetLevel <= nodeLayer.level) {
                node.layerUpdateState[layer.id].noMoreUpdatePossible();
                return;
            }
            const elevation = {
                texture: textures[0],
                pitch: extentsRaster[0].offsetToParent(textures[0].coords, nodeLayer.offsetScales[0]),
            };

            node.layerUpdateState[layer.id].success();

            if (elevation.texture) {
                if (layer.useColorTextureElevation) {
                    elevation.min = layer.colorTextureElevationMinZ;
                    elevation.max = layer.colorTextureElevationMaxZ;
                } else {
                    const { min, max } = computeMinMaxElevation(elevation.texture.image.data,
                        SIZE_TEXTURE_TILE,
                        SIZE_TEXTURE_TILE,
                        elevation.pitch);
                    elevation.min = !min ? 0 : min;
                    elevation.max = !max ? 0 : max;
                }
            }

            node.setBBoxZ(elevation.min, elevation.max, layer.scale);
            nodeLayer.setTexture(0, elevation.texture, elevation.pitch);
            const nodeParent = parent.material && parent.material.getElevationLayer();
            nodeLayer.replaceNoDataValueFromParent(nodeParent, layer.noDataValue);
        },
        err => handlingError(err, node, layer, targetLevel, context.view));
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
