export default {
    preUpdate: (context, layer) => {
        context.colorLayers = context.view.getLayers(
            (l, a) => a && a.id == layer.id && l.type == 'color');
        context.elevationLayers = context.view.getLayers(
            (l, a) => a && a.id == layer.id && l.type == 'elevation');
    },

    hasEnoughTexturesToSubdivide: (context, layer, node) => {
        // Prevent subdivision if node is covered by at least one elevation layer
        // and if node doesn't have a elevation texture yet.
        for (const e of context.elevationLayers) {
            const nodeLayer = node.material.getElevationLayer();
            if (!e.frozen && e.ready && e.tileInsideLimit(node, e) && (!nodeLayer || nodeLayer.level < 0)) {
                // no stop subdivision in the case of a loading error
                if (node.layerUpdateState[e.id] && node.layerUpdateState[e.id].inError()) {
                    continue;
                }
                return false;
            }
        }

        // Prevent subdivision if missing color texture
        for (const c of context.colorLayers) {
            if (c.frozen || !c.visible || !c.ready) {
                continue;
            }
            // no stop subdivision in the case of a loading error
            if (node.layerUpdateState[c.id] && node.layerUpdateState[c.id].inError()) {
                continue;
            }
            const nodeLayer = node.material.getLayer(c.id);
            if (c.tileInsideLimit(node, c) && (!nodeLayer || nodeLayer.level < 0)) {
                return false;
            }
        }
        return true;
    },
};
