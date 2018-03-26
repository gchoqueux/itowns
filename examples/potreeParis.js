/* global itowns, Potree, dat, doItownsCompliant */
var view;

// eslint-disable-next-line no-unused-vars
function showPointcloud() {
    var pointcloud;
    var viewerDiv;
    var positionOnGlobe;
    var info = document.getElementById('info');
    var gui = new dat.GUI();
    var cloudThreeLayer;
    var controller;
    var logarithmicDepthBuffer;
    var paramsPotree = { kiloPoints: 2000,
        opacity: 1.0,
    };

    viewerDiv = document.getElementById('viewerDiv');
    viewerDiv.style.display = 'block';

    positionOnGlobe = { longitude: 2.351323, latitude: 48.856712, altitude: 25000 };

    view = new itowns.GlobeView(viewerDiv, positionOnGlobe, { handleCollision: false });
    view.controls.minDistance = 0;

    logarithmicDepthBuffer = view.mainLoop.gfxEngine.renderer.capabilities.logarithmicDepthBuffer;
    doItownsCompliant(Potree, logarithmicDepthBuffer);

    function addLayerCb(layer) {
        return view.addLayer(layer);
    }

    // Configure Point Cloud layer
    pointcloud = new itowns.GeometryLayer('pointcloud', view.scene);

    pointcloud.preUpdate = function preUpdate(context, cloudLayer) {
        return cloudLayer.object3d.children.filter(function filter(child) {
            return child instanceof Potree.PointCloudOctree;
        });
    };

    cloudThreeLayer = view.mainLoop.gfxEngine.getUniqueThreejsLayer();
    view.camera.camera3D.layers.enable(cloudThreeLayer);

    pointcloud.update = function up(context, layer, element) {
        var result = Potree.updatePointClouds([element],
            context.view.camera.camera3D,
            context.view.mainLoop.gfxEngine.renderer);
        info.textContent = 'Nb points: ' + result.numVisiblePoints.toLocaleString();
        element.traverseVisible(function _(obj) { obj.layers.set(cloudThreeLayer); });
        setTimeout(function _() { context.view.notifyChange(true, element); }, 1000);
    };

    Potree.pointBudget = 2000000;
    Potree.pointLoadLimit = Potree.pointBudget * 2;

    itowns.View.prototype.addLayer.call(view, pointcloud).then(function _(layer) {
        function onLoad(result) {
            var opa;
            result.pointcloud.material.size = 0.333;
            result.pointcloud.material.transparent = true;
            result.pointcloud.material.pointSizeType = Potree.PointSizeType.ADAPTIVE;
            layer.object3d.add(result.pointcloud);
            gui.add(result.pointcloud, 'visible').name('visibility ' + result.pointcloud.name);
            opa = gui.add(paramsPotree, 'opacity').min(0).max(1.0).name('opacity ' + result.pointcloud.name);
            opa.onChange(function c(value) {
                result.pointcloud.material.opacity = value;
            });
            layer.ready = true;
            layer.visible = true;
        }

        Potree.loadPointCloud('../samples/parisAerien/cloud.js', 'Paris', onLoad);
        Potree.loadPointCloud('../samples/parisBalard/cloud.js', 'Balard', onLoad);
    });

    controller = gui.add(paramsPotree, 'kiloPoints').min(0).max(5000);
    controller.onChange(function c(value) {
        Potree.pointBudget = value * 1000;
        Potree.pointLoadLimit = Potree.pointBudget * 2;
    });

    itowns.Fetcher.json('./layers/JSONLayers/IGN_MNT_HIGHRES.json').then(addLayerCb);
    itowns.Fetcher.json('./layers/JSONLayers/Ortho.json').then(addLayerCb);
}
