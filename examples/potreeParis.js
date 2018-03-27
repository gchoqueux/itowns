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

    // proj4.defs('EPSG:3946',
    // '+proj=lcc +lat_1=45.25 +lat_2=46.75 +lat_0=46 +lon_0=3 +x_0=1700000 +y_0=5200000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs');


    proj4.defs('EPSG:32644',
    '+proj=utm +zone=44 +datum=WGS84 +units=m +no_defs');


    // var extent = new itowns.Extent(
    // 'EPSG:32644',
    //     -1023000, -1022000,
    //     3931800, 3932000);
    //

    var extent = new itowns.Extent('EPSG:3857',
            5087648,
            11662456,
            -156543,
            6261721);


    viewerDiv = document.getElementById('viewerDiv');
    viewerDiv.style.display = 'block';

    positionOnGlobe = { longitude: 2.351323, latitude: 48.856712, altitude: 25000 };


    view = new itowns.PlanarView(viewerDiv, extent);
    // view = new itowns.GlobeView(viewerDiv, positionOnGlobe, { handleCollision: false });
    // view.controls.minDistance = 0;

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

    view.tileLayer.object3d.position.z = 1889;
    view.tileLayer.object3d.updateMatrixWorld(true);

    var center_pm = new itowns.Coordinates('EPSG:3857', 500000, 4649776, 0).xyz();
    var center_pm = new itowns.Coordinates('EPSG:4326', 78, 0, 0).as('EPSG:3857');
    var position_utm = new itowns.Coordinates('EPSG:32644', -1022675, 3931923, 1889);
    var position_pm = position_utm.as('EPSG:3857');
    var position = position_pm.xyz().sub(position_utm.xyz());

    itowns.View.prototype.addLayer.call(view, pointcloud).then(function _(layer) {
        function onLoad(result) {
            var opa;
            result.pointcloud.material.size = 0.333;
            result.pointcloud.material.transparent = true;
            result.pointcloud.material.pointSizeType = Potree.PointSizeType.ADAPTIVE;
            console.log(result.pointcloud);
            console.log(result.pointcloud.position.x, result.pointcloud.position.y);
            result.pointcloud.position.copy(position);
            result.pointcloud.scale.set(100, 100, 10000);
            layer.object3d.add(result.pointcloud);
            result.pointcloud.updateMatrixWorld(true);
            gui.add(result.pointcloud, 'visible').name('visibility ' + result.pointcloud.name);
            opa = gui.add(paramsPotree, 'opacity').min(0).max(1.0).name('opacity ' + result.pointcloud.name);
            opa.onChange(function c(value) {
                result.pointcloud.material.opacity = value;
            });
            layer.ready = true;
            layer.visible = true;
        }

        // Potree.loadPointCloud('../samples/parisAerien/cloud.js', 'Paris', onLoad);
        Potree.loadPointCloud('http://192.168.12.95:8080/pointclouds/jam_minaret/cloud.js', 'Balard', onLoad);
    });

    controller = gui.add(paramsPotree, 'kiloPoints').min(0).max(5000);
    controller.onChange(function c(value) {
        Potree.pointBudget = value * 1000;
        Potree.pointLoadLimit = Potree.pointBudget * 2;
    });

    view.camera.setPosition(new itowns.Coordinates('EPSG:32644', extent.west(), extent.south(), 200000));
    // Then look at extent's center
    view.camera.camera3D.lookAt(extent.center().xyz());

    // instanciate controls
    // eslint-disable-next-line no-new
    // new itowns.FirstPersonControls(view, {focusOnClick: true});

    view.controls = new THREE.OrbitControls(view.camera.camera3D, viewerDiv);
    view.controls.target.copy(position);
    view.controls.update();

    // Request redraw
    view.notifyChange(true);

    view.addFrameRequester(itowns.MAIN_LOOP_EVENTS.BEFORE_CAMERA_UPDATE, () => {
        view.controls.update.bind(view.controls);
        view.notifyChange(true);
    });

    view.addLayer({
        type: 'color',
        id: 'ortho',
        protocol: 'xyz',
        networkOptions: { crossOrigin: 'anonymous' },
        url: 'http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}.jpg',
        format: "image/jpg",
        extent: new itowns.Extent('EPSG:3857',
            5087648,
            11662456,
            -156543,
            6261721),
    })

    // itowns.Fetcher.json('./layers/JSONLayers/IGN_MNT_HIGHRES.json').then(addLayerCb);
    // itowns.Fetcher.json('./layers/JSONLayers/Ortho.json').then(addLayerCb);
}
