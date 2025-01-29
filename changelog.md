<a name="2.47.2"></a>
## [2.47.2](https://github.com/gchoqueux/itowns/compare/v2.47.0...v2.47.2) (2025-01-29)


### Workflow and chores

* release v2.47.2 ([d67b4da](https://github.com/gchoqueux/itowns/commit/d67b4da))
* release v2.47.1 ([c232b88](https://github.com/gchoqueux/itowns/commit/c232b88))
* add echo ([f48d333](https://github.com/gchoqueux/itowns/commit/f48d333))



<a name="2.47.1"></a>
## [2.47.1](https://github.com/gchoqueux/itowns/compare/v2.47.0...v2.47.1) (2025-01-29)


### Workflow and chores

* release v2.47.1 ([c259d64](https://github.com/gchoqueux/itowns/commit/c259d64))
* add echo ([f48d333](https://github.com/gchoqueux/itowns/commit/f48d333))



<a name="2.47.0"></a>
# [2.47.0](https://github.com/gchoqueux/itowns/compare/v2.44.2...v2.47.0) (2025-01-29)


### Features

* **3dtiles:** add deprecation warning to C3DTilesLayer. Use OGC3DTilesLayer instead ([cbfd1bb](https://github.com/gchoqueux/itowns/commit/cbfd1bb))
* **3dtiles:** add tiles-load-start and tiles-load-end events ([3d89169](https://github.com/gchoqueux/itowns/commit/3d89169))
* **3dtiles:** update 3d-tiles-renderer to 0.3.39 ([565ba36](https://github.com/gchoqueux/itowns/commit/565ba36))
* add `enableMeshoptDecoder` function for GLTFs ([3a9784c](https://github.com/gchoqueux/itowns/commit/3a9784c))
* add publiccode ([#2417](https://github.com/gchoqueux/itowns/issues/2417)) ([cfb9d0f](https://github.com/gchoqueux/itowns/commit/cfb9d0f))
* **ci:** bump node to next LTS (v22) ([#2452](https://github.com/gchoqueux/itowns/issues/2452)) ([8df42d2](https://github.com/gchoqueux/itowns/commit/8df42d2))
* **controls:** add state controls at view init ([868889f](https://github.com/gchoqueux/itowns/commit/868889f))
* **controls:** disabled multi actions when zooming ([89bbbd8](https://github.com/gchoqueux/itowns/commit/89bbbd8))
* deprecate Coordinates constructor with array and vector3 ([efe9c58](https://github.com/gchoqueux/itowns/commit/efe9c58))
* **eslint:** remove preference for default export ([#2447](https://github.com/gchoqueux/itowns/issues/2447)) ([4e7bcd2](https://github.com/gchoqueux/itowns/commit/4e7bcd2))
* **globeControls:** zoom on mouse position while using wheel ([85ce178](https://github.com/gchoqueux/itowns/commit/85ce178))
* **index.html:** auto-redirect to examples ([#2478](https://github.com/gchoqueux/itowns/issues/2478)) ([1e171ff](https://github.com/gchoqueux/itowns/commit/1e171ff))
* **MVT:** change mapBox package to mapLib ([b81e8e9](https://github.com/gchoqueux/itowns/commit/b81e8e9))
* **VectorTile:** add support for relative url in style ([09f7adb](https://github.com/gchoqueux/itowns/commit/09f7adb))
* **wms:** use proj4 crs axis param ([7d67ec4](https://github.com/gchoqueux/itowns/commit/7d67ec4))


### Bug Fixes

* **3dtiles:** add layer to object returned by OGC3DTilesLayer.pickObjectsAt ([25467e5](https://github.com/gchoqueux/itowns/commit/25467e5))
* **3DTiles:** correctly handle all layer config (e.g. layer name) ([0acb0a4](https://github.com/gchoqueux/itowns/commit/0acb0a4))
* **babel:** include ts files in prerequisites ([eb73b45](https://github.com/gchoqueux/itowns/commit/eb73b45))
* **C3DTilesLayer:** updateStyle works with new style API ([a4f0d22](https://github.com/gchoqueux/itowns/commit/a4f0d22))
* **COG:** Fix extent in COG parser ([452ca7e](https://github.com/gchoqueux/itowns/commit/452ca7e))
* **Crs:** correctly renamed reasonableEpsilon function ([205c27f](https://github.com/gchoqueux/itowns/commit/205c27f))
* **crs:** fix proj4 unit 'meter' and add 'foot' ([07c3f63](https://github.com/gchoqueux/itowns/commit/07c3f63))
* **deploy:** add commit prerelease ([18e6463](https://github.com/gchoqueux/itowns/commit/18e6463))
* **deploy:** no publish provenance in geographic package ([efca7a5](https://github.com/gchoqueux/itowns/commit/efca7a5))
* **doc:** fix doc generation error ([fc2d3ab](https://github.com/gchoqueux/itowns/commit/fc2d3ab))
* **examples:** fix linked with zoom properties well used ([d947233](https://github.com/gchoqueux/itowns/commit/d947233))
* **fetcher:** improve image loading error log ([dc347d1](https://github.com/gchoqueux/itowns/commit/dc347d1))
* **GlobeView:** remove default directional light ([0a098af](https://github.com/gchoqueux/itowns/commit/0a098af))
* **i3dm:** use instanceId to get info ([683e55d](https://github.com/gchoqueux/itowns/commit/683e55d))
* **LabelLayer:** gestion simplified of line and polygon Label ([cb3c3b7](https://github.com/gchoqueux/itowns/commit/cb3c3b7))
* **Label:** Multiple labels with same textContent ([a2cfd3a](https://github.com/gchoqueux/itowns/commit/a2cfd3a))
* **MVTLayers:** add MVTLayer where MVTStyle.layer has 'ref' properties ([497ac8c](https://github.com/gchoqueux/itowns/commit/497ac8c))
* **MVTParser:** supp use of layer.style.zoom in parser ([6b0e287](https://github.com/gchoqueux/itowns/commit/6b0e287))
* **MVTStyle:** Doing recoloring only with sdf icons. ([11d10ea](https://github.com/gchoqueux/itowns/commit/11d10ea))
* **MVTStyle:** icon properties -> fix return of function when id includes {} ([fffecc9](https://github.com/gchoqueux/itowns/commit/fffecc9))
* **OGC3DTilesLayer:** handle multiple views ([#2435](https://github.com/gchoqueux/itowns/issues/2435)) ([b991878](https://github.com/gchoqueux/itowns/commit/b991878))
* **publiccode.yml:** fix the logo URL ([822c63b](https://github.com/gchoqueux/itowns/commit/822c63b))
* **publish:** to remove ([4bc2d23](https://github.com/gchoqueux/itowns/commit/4bc2d23))
* **release:** to large changelog ([765011d](https://github.com/gchoqueux/itowns/commit/765011d))
* **source:** support urls already containing query parameters for wms, wmts, and wfs ([4f53025](https://github.com/gchoqueux/itowns/commit/4f53025))
* **Style:** cropValueDefault ([fe68e41](https://github.com/gchoqueux/itowns/commit/fe68e41))
* **Style:** Don't draw Polygon when fill.color is undefined ([21b0900](https://github.com/gchoqueux/itowns/commit/21b0900))
* **Style:** Don't draw stroke when width is 0 ([b8a13d9](https://github.com/gchoqueux/itowns/commit/b8a13d9))
* **Style:** dont draw icon when size is 0 ([858b89e](https://github.com/gchoqueux/itowns/commit/858b89e))
* **Style:** take style.zoom into account for LabelLayer and Feature2Texture ([5ec037b](https://github.com/gchoqueux/itowns/commit/5ec037b))
* **Terrain:** fix terrain subdivision when a terrain tile only has values that should be clamped ([cb96727](https://github.com/gchoqueux/itowns/commit/cb96727))
* **test:** fix local unit tests behind proxy ([9b9d52a](https://github.com/gchoqueux/itowns/commit/9b9d52a))
* **test:** increase time out ([2a55e71](https://github.com/gchoqueux/itowns/commit/2a55e71))
* **tests:** re set --no-sandbox ([c4629d6](https://github.com/gchoqueux/itowns/commit/c4629d6))
* **TileBuilder:** use cached buffers correctly ([#2491](https://github.com/gchoqueux/itowns/issues/2491)) ([f3d2e90](https://github.com/gchoqueux/itowns/commit/f3d2e90))
* **TiledGeometryLayer:** remove subdivision checking code ([#2344](https://github.com/gchoqueux/itowns/issues/2344)) ([e386637](https://github.com/gchoqueux/itowns/commit/e386637))
* **TiledGeometryLayer:** replace get data by the new getPropertyArray ([ec665c3](https://github.com/gchoqueux/itowns/commit/ec665c3))
* **TiledGeometryLayer:** set autoRefreshToken to true ([ebf37dd](https://github.com/gchoqueux/itowns/commit/ebf37dd))
* **VectorTile:** fix {z}/{y}/{x} ([9250fd8](https://github.com/gchoqueux/itowns/commit/9250fd8))
* **VectorTile:** supp order in Style as it's only a Label properties in VT ([3dc135e](https://github.com/gchoqueux/itowns/commit/3dc135e))
* **wms:** assign axis order param from source ([aec3ebf](https://github.com/gchoqueux/itowns/commit/aec3ebf))
* **wms:** take wms 1.1.1 version into account for axis order ([0499f95](https://github.com/gchoqueux/itowns/commit/0499f95))
* **xbilparser:** apply zmin / zmax for any texture subsampling size ([745ab2c](https://github.com/gchoqueux/itowns/commit/745ab2c))
* **Zoom:** use zoom state ([426fe29](https://github.com/gchoqueux/itowns/commit/426fe29))


### Examples

* **3DTiles:** create an only 3D tiles example that can load any 3D tiles ([3eb7a23](https://github.com/gchoqueux/itowns/commit/3eb7a23))
* **MVT:** add example with official MapBox style file ([d1abe5a](https://github.com/gchoqueux/itowns/commit/d1abe5a))
* **PointCloud:** fix errors ([8dc71f9](https://github.com/gchoqueux/itowns/commit/8dc71f9))


### Code Refactoring

* **CopcSource:** use metadata.wkt to set source.crs ([69ed2f4](https://github.com/gchoqueux/itowns/commit/69ed2f4))
* **Crs:** cleanup unit handling ([ea397ee](https://github.com/gchoqueux/itowns/commit/ea397ee))
* **Crs:** remove tms/epsg family of functions ([83eb0d9](https://github.com/gchoqueux/itowns/commit/83eb0d9))
* **Crs:** rename toUnit to getUnit ([2fdf15a](https://github.com/gchoqueux/itowns/commit/2fdf15a))
* **Crs:** use named exports instead of default export ([fca5a29](https://github.com/gchoqueux/itowns/commit/fca5a29))
* **entwineSource:** read crs from metadata.srs ([1ecc6aa](https://github.com/gchoqueux/itowns/commit/1ecc6aa))
* **Layer:** remove Object.assign of config ([cf41e8d](https://github.com/gchoqueux/itowns/commit/cf41e8d))
* migrate Coordinates to typescript ([ec79573](https://github.com/gchoqueux/itowns/commit/ec79573))
* migrate Crs to typescript ([d884ba6](https://github.com/gchoqueux/itowns/commit/d884ba6))
* migrate Ellipsoid to typescript ([a3fb6c5](https://github.com/gchoqueux/itowns/commit/a3fb6c5))
* **MVTParser:** 1 feature per vtfeature ([25db866](https://github.com/gchoqueux/itowns/commit/25db866))
* **PointCloudLayer:** delete onPointsCreated callback ([628ed94](https://github.com/gchoqueux/itowns/commit/628ed94))
* **PointCloudLayer:** promise.catch/finally instead of then(CallBack, errCallBack) ([b2bcb7f](https://github.com/gchoqueux/itowns/commit/b2bcb7f))
* split Extent between geographic/tiled ([4b57498](https://github.com/gchoqueux/itowns/commit/4b57498))
* **test:** change timeout ([327b914](https://github.com/gchoqueux/itowns/commit/327b914))
* **TileBuilder:** migrate to TypeScript ([#2440](https://github.com/gchoqueux/itowns/issues/2440)) ([3207dcd](https://github.com/gchoqueux/itowns/commit/3207dcd))
* URLBuilder as pure functions ([8ba1376](https://github.com/gchoqueux/itowns/commit/8ba1376))
* **VectorTileParser:** cleanup ([fdf4b0a](https://github.com/gchoqueux/itowns/commit/fdf4b0a))


### Workflow and chores

* release v2.47.0 ([fee81ab](https://github.com/gchoqueux/itowns/commit/fee81ab))
* release v2.46.17 ([f656d99](https://github.com/gchoqueux/itowns/commit/f656d99))
* release v2.46.16 ([b90c7a5](https://github.com/gchoqueux/itowns/commit/b90c7a5))
* release v2.46.15 ([d1b6a7b](https://github.com/gchoqueux/itowns/commit/d1b6a7b))
* release v2.46.14 ([0407e7a](https://github.com/gchoqueux/itowns/commit/0407e7a))
* release v2.45.13 ([1fde5b8](https://github.com/gchoqueux/itowns/commit/1fde5b8))
* **architecture:** monorepo structure ([4fb18d3](https://github.com/gchoqueux/itowns/commit/4fb18d3))
* **Crs:** update and refine documentation ([d467a29](https://github.com/gchoqueux/itowns/commit/d467a29))
* **deps-dev:** bump undici from 7.2.0 to 7.2.3 ([f01365d](https://github.com/gchoqueux/itowns/commit/f01365d))
* **deps:** bump [@tweenjs](https://github.com/tweenjs)/tween.js from 23.1.2 to 25.0.0 ([63e2194](https://github.com/gchoqueux/itowns/commit/63e2194))
* **deps:** bump 3d-tiles-renderer from 0.3.37 to 0.3.38 ([837c044](https://github.com/gchoqueux/itowns/commit/837c044))
* **deps:** bump cookie and express ([f602ac7](https://github.com/gchoqueux/itowns/commit/f602ac7))
* **deps:** bump developer dependencies ([4d034b5](https://github.com/gchoqueux/itowns/commit/4d034b5))
* **deps:** bump nanoid from 3.3.7 to 3.3.8 ([09a016f](https://github.com/gchoqueux/itowns/commit/09a016f))
* **deps:** bump proj4 from 2.11.0 to 2.12.1 ([804c65f](https://github.com/gchoqueux/itowns/commit/804c65f))
* **deps:** bump shpjs from 6.0.1 to 6.1.0 ([4937064](https://github.com/gchoqueux/itowns/commit/4937064))
* **deps:** bump three from 0.165.0 to 0.168.0 ([f7303de](https://github.com/gchoqueux/itowns/commit/f7303de))
* **deps:** remove node-fetch from dev dependencies ([1d9ffe9](https://github.com/gchoqueux/itowns/commit/1d9ffe9))
* echo npm version ([609e63e](https://github.com/gchoqueux/itowns/commit/609e63e))
* **Ellipsoid:** add method return types ([fe189be](https://github.com/gchoqueux/itowns/commit/fe189be))
* **eslint:** add no-use-before-define and change max-len rules ([f8021b4](https://github.com/gchoqueux/itowns/commit/f8021b4))
* **eslint:** update config to support TypeScript ([0d6b611](https://github.com/gchoqueux/itowns/commit/0d6b611))
* FIXES NEED TO MERGE ([908710a](https://github.com/gchoqueux/itowns/commit/908710a))
* remove istanbul and editor comments ([#2479](https://github.com/gchoqueux/itowns/issues/2479)) ([c975752](https://github.com/gchoqueux/itowns/commit/c975752))
* rool back copy examples three js ([bec33a4](https://github.com/gchoqueux/itowns/commit/bec33a4))
* to remove ([c1d2496](https://github.com/gchoqueux/itowns/commit/c1d2496))
* to remove ([2ec58b5](https://github.com/gchoqueux/itowns/commit/2ec58b5))
* to remove ([e8f80a7](https://github.com/gchoqueux/itowns/commit/e8f80a7))
* update babel and webpack configs to support TypeScript ([8830d6d](https://github.com/gchoqueux/itowns/commit/8830d6d))


### Documentation

* **contributors:** add Tim Ebben ([b65d8ae](https://github.com/gchoqueux/itowns/commit/b65d8ae))
* **Coordinates:** update and refine documentation ([6cb7416](https://github.com/gchoqueux/itowns/commit/6cb7416))
* **Ellipsoid:** update and refine documentation ([f922530](https://github.com/gchoqueux/itowns/commit/f922530))
* **test:** update command to run one functional test ([c862ca7](https://github.com/gchoqueux/itowns/commit/c862ca7))


### Tests

* **lasparser:** add test for parseChunk ([50a17a6](https://github.com/gchoqueux/itowns/commit/50a17a6))
* **VectorTileSource:** fix test ([a80b95f](https://github.com/gchoqueux/itowns/commit/a80b95f))


### BREAKING CHANGES

* **Crs:** CRS.isEPSG and CRS.isTMS have been removed
* **Crs:** CRS.formatToESPG and CRS.formatToTMS have been removed
* **Crs:** CRS.toUnit renamed to CRS.getUnit
* **Crs:** CRS.reasonnableEspsilon renamed to CRS.reasonableEpsilon
* **controls:** disabled multi actions when zooming



<a name="2.46.17"></a>
## [2.46.17](https://github.com/gchoqueux/itowns/compare/v2.44.2...v2.46.17) (2025-01-29)


### Features

* **3dtiles:** add deprecation warning to C3DTilesLayer. Use OGC3DTilesLayer instead ([cbfd1bb](https://github.com/gchoqueux/itowns/commit/cbfd1bb))
* **3dtiles:** add tiles-load-start and tiles-load-end events ([3d89169](https://github.com/gchoqueux/itowns/commit/3d89169))
* **3dtiles:** update 3d-tiles-renderer to 0.3.39 ([565ba36](https://github.com/gchoqueux/itowns/commit/565ba36))
* add `enableMeshoptDecoder` function for GLTFs ([3a9784c](https://github.com/gchoqueux/itowns/commit/3a9784c))
* add publiccode ([#2417](https://github.com/gchoqueux/itowns/issues/2417)) ([cfb9d0f](https://github.com/gchoqueux/itowns/commit/cfb9d0f))
* **ci:** bump node to next LTS (v22) ([#2452](https://github.com/gchoqueux/itowns/issues/2452)) ([8df42d2](https://github.com/gchoqueux/itowns/commit/8df42d2))
* **controls:** add state controls at view init ([868889f](https://github.com/gchoqueux/itowns/commit/868889f))
* **controls:** disabled multi actions when zooming ([89bbbd8](https://github.com/gchoqueux/itowns/commit/89bbbd8))
* deprecate Coordinates constructor with array and vector3 ([efe9c58](https://github.com/gchoqueux/itowns/commit/efe9c58))
* **eslint:** remove preference for default export ([#2447](https://github.com/gchoqueux/itowns/issues/2447)) ([4e7bcd2](https://github.com/gchoqueux/itowns/commit/4e7bcd2))
* **globeControls:** zoom on mouse position while using wheel ([85ce178](https://github.com/gchoqueux/itowns/commit/85ce178))
* **index.html:** auto-redirect to examples ([#2478](https://github.com/gchoqueux/itowns/issues/2478)) ([1e171ff](https://github.com/gchoqueux/itowns/commit/1e171ff))
* **MVT:** change mapBox package to mapLib ([b81e8e9](https://github.com/gchoqueux/itowns/commit/b81e8e9))
* **VectorTile:** add support for relative url in style ([09f7adb](https://github.com/gchoqueux/itowns/commit/09f7adb))
* **wms:** use proj4 crs axis param ([7d67ec4](https://github.com/gchoqueux/itowns/commit/7d67ec4))


### Bug Fixes

* **3dtiles:** add layer to object returned by OGC3DTilesLayer.pickObjectsAt ([25467e5](https://github.com/gchoqueux/itowns/commit/25467e5))
* **3DTiles:** correctly handle all layer config (e.g. layer name) ([0acb0a4](https://github.com/gchoqueux/itowns/commit/0acb0a4))
* **babel:** include ts files in prerequisites ([eb73b45](https://github.com/gchoqueux/itowns/commit/eb73b45))
* **C3DTilesLayer:** updateStyle works with new style API ([a4f0d22](https://github.com/gchoqueux/itowns/commit/a4f0d22))
* **COG:** Fix extent in COG parser ([452ca7e](https://github.com/gchoqueux/itowns/commit/452ca7e))
* **Crs:** correctly renamed reasonableEpsilon function ([205c27f](https://github.com/gchoqueux/itowns/commit/205c27f))
* **crs:** fix proj4 unit 'meter' and add 'foot' ([07c3f63](https://github.com/gchoqueux/itowns/commit/07c3f63))
* **deploy:** add commit prerelease ([18e6463](https://github.com/gchoqueux/itowns/commit/18e6463))
* **deploy:** no publish provenance in geographic package ([efca7a5](https://github.com/gchoqueux/itowns/commit/efca7a5))
* **doc:** fix doc generation error ([fc2d3ab](https://github.com/gchoqueux/itowns/commit/fc2d3ab))
* **examples:** fix linked with zoom properties well used ([d947233](https://github.com/gchoqueux/itowns/commit/d947233))
* **fetcher:** improve image loading error log ([dc347d1](https://github.com/gchoqueux/itowns/commit/dc347d1))
* **GlobeView:** remove default directional light ([0a098af](https://github.com/gchoqueux/itowns/commit/0a098af))
* **i3dm:** use instanceId to get info ([683e55d](https://github.com/gchoqueux/itowns/commit/683e55d))
* **LabelLayer:** gestion simplified of line and polygon Label ([cb3c3b7](https://github.com/gchoqueux/itowns/commit/cb3c3b7))
* **Label:** Multiple labels with same textContent ([a2cfd3a](https://github.com/gchoqueux/itowns/commit/a2cfd3a))
* **MVTLayers:** add MVTLayer where MVTStyle.layer has 'ref' properties ([497ac8c](https://github.com/gchoqueux/itowns/commit/497ac8c))
* **MVTParser:** supp use of layer.style.zoom in parser ([6b0e287](https://github.com/gchoqueux/itowns/commit/6b0e287))
* **MVTStyle:** Doing recoloring only with sdf icons. ([11d10ea](https://github.com/gchoqueux/itowns/commit/11d10ea))
* **MVTStyle:** icon properties -> fix return of function when id includes {} ([fffecc9](https://github.com/gchoqueux/itowns/commit/fffecc9))
* **OGC3DTilesLayer:** handle multiple views ([#2435](https://github.com/gchoqueux/itowns/issues/2435)) ([b991878](https://github.com/gchoqueux/itowns/commit/b991878))
* **publiccode.yml:** fix the logo URL ([822c63b](https://github.com/gchoqueux/itowns/commit/822c63b))
* **publish:** to remove ([4bc2d23](https://github.com/gchoqueux/itowns/commit/4bc2d23))
* **release:** to large changelog ([765011d](https://github.com/gchoqueux/itowns/commit/765011d))
* **source:** support urls already containing query parameters for wms, wmts, and wfs ([4f53025](https://github.com/gchoqueux/itowns/commit/4f53025))
* **Style:** cropValueDefault ([fe68e41](https://github.com/gchoqueux/itowns/commit/fe68e41))
* **Style:** Don't draw Polygon when fill.color is undefined ([21b0900](https://github.com/gchoqueux/itowns/commit/21b0900))
* **Style:** Don't draw stroke when width is 0 ([b8a13d9](https://github.com/gchoqueux/itowns/commit/b8a13d9))
* **Style:** dont draw icon when size is 0 ([858b89e](https://github.com/gchoqueux/itowns/commit/858b89e))
* **Style:** take style.zoom into account for LabelLayer and Feature2Texture ([5ec037b](https://github.com/gchoqueux/itowns/commit/5ec037b))
* **Terrain:** fix terrain subdivision when a terrain tile only has values that should be clamped ([cb96727](https://github.com/gchoqueux/itowns/commit/cb96727))
* **test:** fix local unit tests behind proxy ([9b9d52a](https://github.com/gchoqueux/itowns/commit/9b9d52a))
* **test:** increase time out ([2a55e71](https://github.com/gchoqueux/itowns/commit/2a55e71))
* **tests:** re set --no-sandbox ([c4629d6](https://github.com/gchoqueux/itowns/commit/c4629d6))
* **TileBuilder:** use cached buffers correctly ([#2491](https://github.com/gchoqueux/itowns/issues/2491)) ([f3d2e90](https://github.com/gchoqueux/itowns/commit/f3d2e90))
* **TiledGeometryLayer:** remove subdivision checking code ([#2344](https://github.com/gchoqueux/itowns/issues/2344)) ([e386637](https://github.com/gchoqueux/itowns/commit/e386637))
* **TiledGeometryLayer:** replace get data by the new getPropertyArray ([ec665c3](https://github.com/gchoqueux/itowns/commit/ec665c3))
* **TiledGeometryLayer:** set autoRefreshToken to true ([ebf37dd](https://github.com/gchoqueux/itowns/commit/ebf37dd))
* **VectorTile:** fix {z}/{y}/{x} ([9250fd8](https://github.com/gchoqueux/itowns/commit/9250fd8))
* **VectorTile:** supp order in Style as it's only a Label properties in VT ([3dc135e](https://github.com/gchoqueux/itowns/commit/3dc135e))
* **wms:** assign axis order param from source ([aec3ebf](https://github.com/gchoqueux/itowns/commit/aec3ebf))
* **wms:** take wms 1.1.1 version into account for axis order ([0499f95](https://github.com/gchoqueux/itowns/commit/0499f95))
* **xbilparser:** apply zmin / zmax for any texture subsampling size ([745ab2c](https://github.com/gchoqueux/itowns/commit/745ab2c))
* **Zoom:** use zoom state ([426fe29](https://github.com/gchoqueux/itowns/commit/426fe29))


### Examples

* **3DTiles:** create an only 3D tiles example that can load any 3D tiles ([3eb7a23](https://github.com/gchoqueux/itowns/commit/3eb7a23))
* **MVT:** add example with official MapBox style file ([d1abe5a](https://github.com/gchoqueux/itowns/commit/d1abe5a))
* **PointCloud:** fix errors ([8dc71f9](https://github.com/gchoqueux/itowns/commit/8dc71f9))


### Code Refactoring

* **CopcSource:** use metadata.wkt to set source.crs ([69ed2f4](https://github.com/gchoqueux/itowns/commit/69ed2f4))
* **Crs:** cleanup unit handling ([ea397ee](https://github.com/gchoqueux/itowns/commit/ea397ee))
* **Crs:** remove tms/epsg family of functions ([83eb0d9](https://github.com/gchoqueux/itowns/commit/83eb0d9))
* **Crs:** rename toUnit to getUnit ([2fdf15a](https://github.com/gchoqueux/itowns/commit/2fdf15a))
* **Crs:** use named exports instead of default export ([fca5a29](https://github.com/gchoqueux/itowns/commit/fca5a29))
* **entwineSource:** read crs from metadata.srs ([1ecc6aa](https://github.com/gchoqueux/itowns/commit/1ecc6aa))
* **Layer:** remove Object.assign of config ([cf41e8d](https://github.com/gchoqueux/itowns/commit/cf41e8d))
* migrate Coordinates to typescript ([ec79573](https://github.com/gchoqueux/itowns/commit/ec79573))
* migrate Crs to typescript ([d884ba6](https://github.com/gchoqueux/itowns/commit/d884ba6))
* migrate Ellipsoid to typescript ([a3fb6c5](https://github.com/gchoqueux/itowns/commit/a3fb6c5))
* **MVTParser:** 1 feature per vtfeature ([25db866](https://github.com/gchoqueux/itowns/commit/25db866))
* **PointCloudLayer:** delete onPointsCreated callback ([628ed94](https://github.com/gchoqueux/itowns/commit/628ed94))
* **PointCloudLayer:** promise.catch/finally instead of then(CallBack, errCallBack) ([b2bcb7f](https://github.com/gchoqueux/itowns/commit/b2bcb7f))
* split Extent between geographic/tiled ([4b57498](https://github.com/gchoqueux/itowns/commit/4b57498))
* **test:** change timeout ([327b914](https://github.com/gchoqueux/itowns/commit/327b914))
* **TileBuilder:** migrate to TypeScript ([#2440](https://github.com/gchoqueux/itowns/issues/2440)) ([3207dcd](https://github.com/gchoqueux/itowns/commit/3207dcd))
* URLBuilder as pure functions ([8ba1376](https://github.com/gchoqueux/itowns/commit/8ba1376))
* **VectorTileParser:** cleanup ([fdf4b0a](https://github.com/gchoqueux/itowns/commit/fdf4b0a))


### Workflow and chores

* release v2.46.17 ([41f1e50](https://github.com/gchoqueux/itowns/commit/41f1e50))
* release v2.46.16 ([b90c7a5](https://github.com/gchoqueux/itowns/commit/b90c7a5))
* release v2.46.15 ([d1b6a7b](https://github.com/gchoqueux/itowns/commit/d1b6a7b))
* release v2.46.14 ([0407e7a](https://github.com/gchoqueux/itowns/commit/0407e7a))
* release v2.45.13 ([1fde5b8](https://github.com/gchoqueux/itowns/commit/1fde5b8))
* **architecture:** monorepo structure ([4fb18d3](https://github.com/gchoqueux/itowns/commit/4fb18d3))
* **Crs:** update and refine documentation ([d467a29](https://github.com/gchoqueux/itowns/commit/d467a29))
* **deps-dev:** bump undici from 7.2.0 to 7.2.3 ([f01365d](https://github.com/gchoqueux/itowns/commit/f01365d))
* **deps:** bump [@tweenjs](https://github.com/tweenjs)/tween.js from 23.1.2 to 25.0.0 ([63e2194](https://github.com/gchoqueux/itowns/commit/63e2194))
* **deps:** bump 3d-tiles-renderer from 0.3.37 to 0.3.38 ([837c044](https://github.com/gchoqueux/itowns/commit/837c044))
* **deps:** bump cookie and express ([f602ac7](https://github.com/gchoqueux/itowns/commit/f602ac7))
* **deps:** bump developer dependencies ([4d034b5](https://github.com/gchoqueux/itowns/commit/4d034b5))
* **deps:** bump nanoid from 3.3.7 to 3.3.8 ([09a016f](https://github.com/gchoqueux/itowns/commit/09a016f))
* **deps:** bump proj4 from 2.11.0 to 2.12.1 ([804c65f](https://github.com/gchoqueux/itowns/commit/804c65f))
* **deps:** bump shpjs from 6.0.1 to 6.1.0 ([4937064](https://github.com/gchoqueux/itowns/commit/4937064))
* **deps:** bump three from 0.165.0 to 0.168.0 ([f7303de](https://github.com/gchoqueux/itowns/commit/f7303de))
* **deps:** remove node-fetch from dev dependencies ([1d9ffe9](https://github.com/gchoqueux/itowns/commit/1d9ffe9))
* echo npm version ([90135ba](https://github.com/gchoqueux/itowns/commit/90135ba))
* **Ellipsoid:** add method return types ([fe189be](https://github.com/gchoqueux/itowns/commit/fe189be))
* **eslint:** add no-use-before-define and change max-len rules ([f8021b4](https://github.com/gchoqueux/itowns/commit/f8021b4))
* **eslint:** update config to support TypeScript ([0d6b611](https://github.com/gchoqueux/itowns/commit/0d6b611))
* FIXES NEED TO MERGE ([908710a](https://github.com/gchoqueux/itowns/commit/908710a))
* remove istanbul and editor comments ([#2479](https://github.com/gchoqueux/itowns/issues/2479)) ([c975752](https://github.com/gchoqueux/itowns/commit/c975752))
* rool back copy examples three js ([bec33a4](https://github.com/gchoqueux/itowns/commit/bec33a4))
* to remove ([e8f80a7](https://github.com/gchoqueux/itowns/commit/e8f80a7))
* update babel and webpack configs to support TypeScript ([8830d6d](https://github.com/gchoqueux/itowns/commit/8830d6d))


### Documentation

* **contributors:** add Tim Ebben ([b65d8ae](https://github.com/gchoqueux/itowns/commit/b65d8ae))
* **Coordinates:** update and refine documentation ([6cb7416](https://github.com/gchoqueux/itowns/commit/6cb7416))
* **Ellipsoid:** update and refine documentation ([f922530](https://github.com/gchoqueux/itowns/commit/f922530))
* **test:** update command to run one functional test ([c862ca7](https://github.com/gchoqueux/itowns/commit/c862ca7))


### Tests

* **lasparser:** add test for parseChunk ([50a17a6](https://github.com/gchoqueux/itowns/commit/50a17a6))
* **VectorTileSource:** fix test ([a80b95f](https://github.com/gchoqueux/itowns/commit/a80b95f))


### BREAKING CHANGES

* **Crs:** CRS.isEPSG and CRS.isTMS have been removed
* **Crs:** CRS.formatToESPG and CRS.formatToTMS have been removed
* **Crs:** CRS.toUnit renamed to CRS.getUnit
* **Crs:** CRS.reasonnableEspsilon renamed to CRS.reasonableEpsilon
* **controls:** disabled multi actions when zooming



<a name="2.46.16"></a>
## [2.46.16](https://github.com/gchoqueux/itowns/compare/v2.44.2...v2.46.16) (2025-01-29)


### Features

* **3dtiles:** add deprecation warning to C3DTilesLayer. Use OGC3DTilesLayer instead ([cbfd1bb](https://github.com/gchoqueux/itowns/commit/cbfd1bb))
* **3dtiles:** add tiles-load-start and tiles-load-end events ([3d89169](https://github.com/gchoqueux/itowns/commit/3d89169))
* **3dtiles:** update 3d-tiles-renderer to 0.3.39 ([565ba36](https://github.com/gchoqueux/itowns/commit/565ba36))
* add `enableMeshoptDecoder` function for GLTFs ([3a9784c](https://github.com/gchoqueux/itowns/commit/3a9784c))
* add publiccode ([#2417](https://github.com/gchoqueux/itowns/issues/2417)) ([cfb9d0f](https://github.com/gchoqueux/itowns/commit/cfb9d0f))
* **ci:** bump node to next LTS (v22) ([#2452](https://github.com/gchoqueux/itowns/issues/2452)) ([8df42d2](https://github.com/gchoqueux/itowns/commit/8df42d2))
* **controls:** add state controls at view init ([868889f](https://github.com/gchoqueux/itowns/commit/868889f))
* **controls:** disabled multi actions when zooming ([89bbbd8](https://github.com/gchoqueux/itowns/commit/89bbbd8))
* deprecate Coordinates constructor with array and vector3 ([efe9c58](https://github.com/gchoqueux/itowns/commit/efe9c58))
* **eslint:** remove preference for default export ([#2447](https://github.com/gchoqueux/itowns/issues/2447)) ([4e7bcd2](https://github.com/gchoqueux/itowns/commit/4e7bcd2))
* **globeControls:** zoom on mouse position while using wheel ([85ce178](https://github.com/gchoqueux/itowns/commit/85ce178))
* **index.html:** auto-redirect to examples ([#2478](https://github.com/gchoqueux/itowns/issues/2478)) ([1e171ff](https://github.com/gchoqueux/itowns/commit/1e171ff))
* **MVT:** change mapBox package to mapLib ([b81e8e9](https://github.com/gchoqueux/itowns/commit/b81e8e9))
* **VectorTile:** add support for relative url in style ([09f7adb](https://github.com/gchoqueux/itowns/commit/09f7adb))
* **wms:** use proj4 crs axis param ([7d67ec4](https://github.com/gchoqueux/itowns/commit/7d67ec4))


### Bug Fixes

* **3dtiles:** add layer to object returned by OGC3DTilesLayer.pickObjectsAt ([25467e5](https://github.com/gchoqueux/itowns/commit/25467e5))
* **3DTiles:** correctly handle all layer config (e.g. layer name) ([0acb0a4](https://github.com/gchoqueux/itowns/commit/0acb0a4))
* **babel:** include ts files in prerequisites ([eb73b45](https://github.com/gchoqueux/itowns/commit/eb73b45))
* **C3DTilesLayer:** updateStyle works with new style API ([a4f0d22](https://github.com/gchoqueux/itowns/commit/a4f0d22))
* **COG:** Fix extent in COG parser ([452ca7e](https://github.com/gchoqueux/itowns/commit/452ca7e))
* **Crs:** correctly renamed reasonableEpsilon function ([205c27f](https://github.com/gchoqueux/itowns/commit/205c27f))
* **crs:** fix proj4 unit 'meter' and add 'foot' ([07c3f63](https://github.com/gchoqueux/itowns/commit/07c3f63))
* **deploy:** add commit prerelease ([18e6463](https://github.com/gchoqueux/itowns/commit/18e6463))
* **deploy:** no publish provenance in geographic package ([efca7a5](https://github.com/gchoqueux/itowns/commit/efca7a5))
* **doc:** fix doc generation error ([fc2d3ab](https://github.com/gchoqueux/itowns/commit/fc2d3ab))
* **examples:** fix linked with zoom properties well used ([d947233](https://github.com/gchoqueux/itowns/commit/d947233))
* **fetcher:** improve image loading error log ([dc347d1](https://github.com/gchoqueux/itowns/commit/dc347d1))
* **GlobeView:** remove default directional light ([0a098af](https://github.com/gchoqueux/itowns/commit/0a098af))
* **i3dm:** use instanceId to get info ([683e55d](https://github.com/gchoqueux/itowns/commit/683e55d))
* **LabelLayer:** gestion simplified of line and polygon Label ([cb3c3b7](https://github.com/gchoqueux/itowns/commit/cb3c3b7))
* **Label:** Multiple labels with same textContent ([a2cfd3a](https://github.com/gchoqueux/itowns/commit/a2cfd3a))
* **MVTLayers:** add MVTLayer where MVTStyle.layer has 'ref' properties ([497ac8c](https://github.com/gchoqueux/itowns/commit/497ac8c))
* **MVTParser:** supp use of layer.style.zoom in parser ([6b0e287](https://github.com/gchoqueux/itowns/commit/6b0e287))
* **MVTStyle:** Doing recoloring only with sdf icons. ([11d10ea](https://github.com/gchoqueux/itowns/commit/11d10ea))
* **MVTStyle:** icon properties -> fix return of function when id includes {} ([fffecc9](https://github.com/gchoqueux/itowns/commit/fffecc9))
* **OGC3DTilesLayer:** handle multiple views ([#2435](https://github.com/gchoqueux/itowns/issues/2435)) ([b991878](https://github.com/gchoqueux/itowns/commit/b991878))
* **publiccode.yml:** fix the logo URL ([822c63b](https://github.com/gchoqueux/itowns/commit/822c63b))
* **publish:** to remove ([4bc2d23](https://github.com/gchoqueux/itowns/commit/4bc2d23))
* **release:** to large changelog ([765011d](https://github.com/gchoqueux/itowns/commit/765011d))
* **source:** support urls already containing query parameters for wms, wmts, and wfs ([4f53025](https://github.com/gchoqueux/itowns/commit/4f53025))
* **Style:** cropValueDefault ([fe68e41](https://github.com/gchoqueux/itowns/commit/fe68e41))
* **Style:** Don't draw Polygon when fill.color is undefined ([21b0900](https://github.com/gchoqueux/itowns/commit/21b0900))
* **Style:** Don't draw stroke when width is 0 ([b8a13d9](https://github.com/gchoqueux/itowns/commit/b8a13d9))
* **Style:** dont draw icon when size is 0 ([858b89e](https://github.com/gchoqueux/itowns/commit/858b89e))
* **Style:** take style.zoom into account for LabelLayer and Feature2Texture ([5ec037b](https://github.com/gchoqueux/itowns/commit/5ec037b))
* **Terrain:** fix terrain subdivision when a terrain tile only has values that should be clamped ([cb96727](https://github.com/gchoqueux/itowns/commit/cb96727))
* **test:** fix local unit tests behind proxy ([9b9d52a](https://github.com/gchoqueux/itowns/commit/9b9d52a))
* **test:** increase time out ([2a55e71](https://github.com/gchoqueux/itowns/commit/2a55e71))
* **tests:** re set --no-sandbox ([c4629d6](https://github.com/gchoqueux/itowns/commit/c4629d6))
* **TileBuilder:** use cached buffers correctly ([#2491](https://github.com/gchoqueux/itowns/issues/2491)) ([f3d2e90](https://github.com/gchoqueux/itowns/commit/f3d2e90))
* **TiledGeometryLayer:** remove subdivision checking code ([#2344](https://github.com/gchoqueux/itowns/issues/2344)) ([e386637](https://github.com/gchoqueux/itowns/commit/e386637))
* **TiledGeometryLayer:** replace get data by the new getPropertyArray ([ec665c3](https://github.com/gchoqueux/itowns/commit/ec665c3))
* **TiledGeometryLayer:** set autoRefreshToken to true ([ebf37dd](https://github.com/gchoqueux/itowns/commit/ebf37dd))
* **VectorTile:** fix {z}/{y}/{x} ([9250fd8](https://github.com/gchoqueux/itowns/commit/9250fd8))
* **VectorTile:** supp order in Style as it's only a Label properties in VT ([3dc135e](https://github.com/gchoqueux/itowns/commit/3dc135e))
* **wms:** assign axis order param from source ([aec3ebf](https://github.com/gchoqueux/itowns/commit/aec3ebf))
* **wms:** take wms 1.1.1 version into account for axis order ([0499f95](https://github.com/gchoqueux/itowns/commit/0499f95))
* **xbilparser:** apply zmin / zmax for any texture subsampling size ([745ab2c](https://github.com/gchoqueux/itowns/commit/745ab2c))
* **Zoom:** use zoom state ([426fe29](https://github.com/gchoqueux/itowns/commit/426fe29))


### Examples

* **3DTiles:** create an only 3D tiles example that can load any 3D tiles ([3eb7a23](https://github.com/gchoqueux/itowns/commit/3eb7a23))
* **MVT:** add example with official MapBox style file ([d1abe5a](https://github.com/gchoqueux/itowns/commit/d1abe5a))
* **PointCloud:** fix errors ([8dc71f9](https://github.com/gchoqueux/itowns/commit/8dc71f9))


### Code Refactoring

* **CopcSource:** use metadata.wkt to set source.crs ([69ed2f4](https://github.com/gchoqueux/itowns/commit/69ed2f4))
* **Crs:** cleanup unit handling ([ea397ee](https://github.com/gchoqueux/itowns/commit/ea397ee))
* **Crs:** remove tms/epsg family of functions ([83eb0d9](https://github.com/gchoqueux/itowns/commit/83eb0d9))
* **Crs:** rename toUnit to getUnit ([2fdf15a](https://github.com/gchoqueux/itowns/commit/2fdf15a))
* **Crs:** use named exports instead of default export ([fca5a29](https://github.com/gchoqueux/itowns/commit/fca5a29))
* **entwineSource:** read crs from metadata.srs ([1ecc6aa](https://github.com/gchoqueux/itowns/commit/1ecc6aa))
* **Layer:** remove Object.assign of config ([cf41e8d](https://github.com/gchoqueux/itowns/commit/cf41e8d))
* migrate Coordinates to typescript ([ec79573](https://github.com/gchoqueux/itowns/commit/ec79573))
* migrate Crs to typescript ([d884ba6](https://github.com/gchoqueux/itowns/commit/d884ba6))
* migrate Ellipsoid to typescript ([a3fb6c5](https://github.com/gchoqueux/itowns/commit/a3fb6c5))
* **MVTParser:** 1 feature per vtfeature ([25db866](https://github.com/gchoqueux/itowns/commit/25db866))
* **PointCloudLayer:** delete onPointsCreated callback ([628ed94](https://github.com/gchoqueux/itowns/commit/628ed94))
* **PointCloudLayer:** promise.catch/finally instead of then(CallBack, errCallBack) ([b2bcb7f](https://github.com/gchoqueux/itowns/commit/b2bcb7f))
* split Extent between geographic/tiled ([4b57498](https://github.com/gchoqueux/itowns/commit/4b57498))
* **test:** change timeout ([327b914](https://github.com/gchoqueux/itowns/commit/327b914))
* **TileBuilder:** migrate to TypeScript ([#2440](https://github.com/gchoqueux/itowns/issues/2440)) ([3207dcd](https://github.com/gchoqueux/itowns/commit/3207dcd))
* URLBuilder as pure functions ([8ba1376](https://github.com/gchoqueux/itowns/commit/8ba1376))
* **VectorTileParser:** cleanup ([fdf4b0a](https://github.com/gchoqueux/itowns/commit/fdf4b0a))


### Workflow and chores

* release v2.46.16 ([cb71a0a](https://github.com/gchoqueux/itowns/commit/cb71a0a))
* release v2.46.15 ([d1b6a7b](https://github.com/gchoqueux/itowns/commit/d1b6a7b))
* release v2.46.14 ([0407e7a](https://github.com/gchoqueux/itowns/commit/0407e7a))
* release v2.45.13 ([1fde5b8](https://github.com/gchoqueux/itowns/commit/1fde5b8))
* **architecture:** monorepo structure ([4fb18d3](https://github.com/gchoqueux/itowns/commit/4fb18d3))
* **Crs:** update and refine documentation ([d467a29](https://github.com/gchoqueux/itowns/commit/d467a29))
* **deps-dev:** bump undici from 7.2.0 to 7.2.3 ([f01365d](https://github.com/gchoqueux/itowns/commit/f01365d))
* **deps:** bump [@tweenjs](https://github.com/tweenjs)/tween.js from 23.1.2 to 25.0.0 ([63e2194](https://github.com/gchoqueux/itowns/commit/63e2194))
* **deps:** bump 3d-tiles-renderer from 0.3.37 to 0.3.38 ([837c044](https://github.com/gchoqueux/itowns/commit/837c044))
* **deps:** bump cookie and express ([f602ac7](https://github.com/gchoqueux/itowns/commit/f602ac7))
* **deps:** bump developer dependencies ([4d034b5](https://github.com/gchoqueux/itowns/commit/4d034b5))
* **deps:** bump nanoid from 3.3.7 to 3.3.8 ([09a016f](https://github.com/gchoqueux/itowns/commit/09a016f))
* **deps:** bump proj4 from 2.11.0 to 2.12.1 ([804c65f](https://github.com/gchoqueux/itowns/commit/804c65f))
* **deps:** bump shpjs from 6.0.1 to 6.1.0 ([4937064](https://github.com/gchoqueux/itowns/commit/4937064))
* **deps:** bump three from 0.165.0 to 0.168.0 ([f7303de](https://github.com/gchoqueux/itowns/commit/f7303de))
* **deps:** remove node-fetch from dev dependencies ([1d9ffe9](https://github.com/gchoqueux/itowns/commit/1d9ffe9))
* **Ellipsoid:** add method return types ([fe189be](https://github.com/gchoqueux/itowns/commit/fe189be))
* **eslint:** add no-use-before-define and change max-len rules ([f8021b4](https://github.com/gchoqueux/itowns/commit/f8021b4))
* **eslint:** update config to support TypeScript ([0d6b611](https://github.com/gchoqueux/itowns/commit/0d6b611))
* FIXES NEED TO MERGE ([908710a](https://github.com/gchoqueux/itowns/commit/908710a))
* remove istanbul and editor comments ([#2479](https://github.com/gchoqueux/itowns/issues/2479)) ([c975752](https://github.com/gchoqueux/itowns/commit/c975752))
* rool back copy examples three js ([bec33a4](https://github.com/gchoqueux/itowns/commit/bec33a4))
* to remove ([e8f80a7](https://github.com/gchoqueux/itowns/commit/e8f80a7))
* update babel and webpack configs to support TypeScript ([8830d6d](https://github.com/gchoqueux/itowns/commit/8830d6d))


### Documentation

* **contributors:** add Tim Ebben ([b65d8ae](https://github.com/gchoqueux/itowns/commit/b65d8ae))
* **Coordinates:** update and refine documentation ([6cb7416](https://github.com/gchoqueux/itowns/commit/6cb7416))
* **Ellipsoid:** update and refine documentation ([f922530](https://github.com/gchoqueux/itowns/commit/f922530))
* **test:** update command to run one functional test ([c862ca7](https://github.com/gchoqueux/itowns/commit/c862ca7))


### Tests

* **lasparser:** add test for parseChunk ([50a17a6](https://github.com/gchoqueux/itowns/commit/50a17a6))
* **VectorTileSource:** fix test ([a80b95f](https://github.com/gchoqueux/itowns/commit/a80b95f))


### BREAKING CHANGES

* **Crs:** CRS.isEPSG and CRS.isTMS have been removed
* **Crs:** CRS.formatToESPG and CRS.formatToTMS have been removed
* **Crs:** CRS.toUnit renamed to CRS.getUnit
* **Crs:** CRS.reasonnableEspsilon renamed to CRS.reasonableEpsilon
* **controls:** disabled multi actions when zooming



<a name="2.46.15"></a>
## [2.46.15](https://github.com/gchoqueux/itowns/compare/v2.44.2...v2.46.15) (2025-01-29)


### Features

* **3dtiles:** add deprecation warning to C3DTilesLayer. Use OGC3DTilesLayer instead ([cbfd1bb](https://github.com/gchoqueux/itowns/commit/cbfd1bb))
* **3dtiles:** add tiles-load-start and tiles-load-end events ([3d89169](https://github.com/gchoqueux/itowns/commit/3d89169))
* **3dtiles:** update 3d-tiles-renderer to 0.3.39 ([565ba36](https://github.com/gchoqueux/itowns/commit/565ba36))
* add `enableMeshoptDecoder` function for GLTFs ([3a9784c](https://github.com/gchoqueux/itowns/commit/3a9784c))
* add publiccode ([#2417](https://github.com/gchoqueux/itowns/issues/2417)) ([cfb9d0f](https://github.com/gchoqueux/itowns/commit/cfb9d0f))
* **ci:** bump node to next LTS (v22) ([#2452](https://github.com/gchoqueux/itowns/issues/2452)) ([8df42d2](https://github.com/gchoqueux/itowns/commit/8df42d2))
* **controls:** add state controls at view init ([868889f](https://github.com/gchoqueux/itowns/commit/868889f))
* **controls:** disabled multi actions when zooming ([89bbbd8](https://github.com/gchoqueux/itowns/commit/89bbbd8))
* deprecate Coordinates constructor with array and vector3 ([efe9c58](https://github.com/gchoqueux/itowns/commit/efe9c58))
* **eslint:** remove preference for default export ([#2447](https://github.com/gchoqueux/itowns/issues/2447)) ([4e7bcd2](https://github.com/gchoqueux/itowns/commit/4e7bcd2))
* **globeControls:** zoom on mouse position while using wheel ([85ce178](https://github.com/gchoqueux/itowns/commit/85ce178))
* **index.html:** auto-redirect to examples ([#2478](https://github.com/gchoqueux/itowns/issues/2478)) ([1e171ff](https://github.com/gchoqueux/itowns/commit/1e171ff))
* **MVT:** change mapBox package to mapLib ([b81e8e9](https://github.com/gchoqueux/itowns/commit/b81e8e9))
* **VectorTile:** add support for relative url in style ([09f7adb](https://github.com/gchoqueux/itowns/commit/09f7adb))
* **wms:** use proj4 crs axis param ([7d67ec4](https://github.com/gchoqueux/itowns/commit/7d67ec4))


### Bug Fixes

* **3dtiles:** add layer to object returned by OGC3DTilesLayer.pickObjectsAt ([25467e5](https://github.com/gchoqueux/itowns/commit/25467e5))
* **3DTiles:** correctly handle all layer config (e.g. layer name) ([0acb0a4](https://github.com/gchoqueux/itowns/commit/0acb0a4))
* **babel:** include ts files in prerequisites ([eb73b45](https://github.com/gchoqueux/itowns/commit/eb73b45))
* **C3DTilesLayer:** updateStyle works with new style API ([a4f0d22](https://github.com/gchoqueux/itowns/commit/a4f0d22))
* **COG:** Fix extent in COG parser ([452ca7e](https://github.com/gchoqueux/itowns/commit/452ca7e))
* **Crs:** correctly renamed reasonableEpsilon function ([205c27f](https://github.com/gchoqueux/itowns/commit/205c27f))
* **crs:** fix proj4 unit 'meter' and add 'foot' ([07c3f63](https://github.com/gchoqueux/itowns/commit/07c3f63))
* **deploy:** add commit prerelease ([18e6463](https://github.com/gchoqueux/itowns/commit/18e6463))
* **deploy:** no publish provenance in geographic package ([efca7a5](https://github.com/gchoqueux/itowns/commit/efca7a5))
* **doc:** fix doc generation error ([fc2d3ab](https://github.com/gchoqueux/itowns/commit/fc2d3ab))
* **examples:** fix linked with zoom properties well used ([d947233](https://github.com/gchoqueux/itowns/commit/d947233))
* **fetcher:** improve image loading error log ([dc347d1](https://github.com/gchoqueux/itowns/commit/dc347d1))
* **GlobeView:** remove default directional light ([0a098af](https://github.com/gchoqueux/itowns/commit/0a098af))
* **i3dm:** use instanceId to get info ([683e55d](https://github.com/gchoqueux/itowns/commit/683e55d))
* **LabelLayer:** gestion simplified of line and polygon Label ([cb3c3b7](https://github.com/gchoqueux/itowns/commit/cb3c3b7))
* **Label:** Multiple labels with same textContent ([a2cfd3a](https://github.com/gchoqueux/itowns/commit/a2cfd3a))
* **MVTLayers:** add MVTLayer where MVTStyle.layer has 'ref' properties ([497ac8c](https://github.com/gchoqueux/itowns/commit/497ac8c))
* **MVTParser:** supp use of layer.style.zoom in parser ([6b0e287](https://github.com/gchoqueux/itowns/commit/6b0e287))
* **MVTStyle:** Doing recoloring only with sdf icons. ([11d10ea](https://github.com/gchoqueux/itowns/commit/11d10ea))
* **MVTStyle:** icon properties -> fix return of function when id includes {} ([fffecc9](https://github.com/gchoqueux/itowns/commit/fffecc9))
* **OGC3DTilesLayer:** handle multiple views ([#2435](https://github.com/gchoqueux/itowns/issues/2435)) ([b991878](https://github.com/gchoqueux/itowns/commit/b991878))
* **publiccode.yml:** fix the logo URL ([822c63b](https://github.com/gchoqueux/itowns/commit/822c63b))
* **publish:** to remove ([4bc2d23](https://github.com/gchoqueux/itowns/commit/4bc2d23))
* **release:** to large changelog ([765011d](https://github.com/gchoqueux/itowns/commit/765011d))
* **source:** support urls already containing query parameters for wms, wmts, and wfs ([4f53025](https://github.com/gchoqueux/itowns/commit/4f53025))
* **Style:** cropValueDefault ([fe68e41](https://github.com/gchoqueux/itowns/commit/fe68e41))
* **Style:** Don't draw Polygon when fill.color is undefined ([21b0900](https://github.com/gchoqueux/itowns/commit/21b0900))
* **Style:** Don't draw stroke when width is 0 ([b8a13d9](https://github.com/gchoqueux/itowns/commit/b8a13d9))
* **Style:** dont draw icon when size is 0 ([858b89e](https://github.com/gchoqueux/itowns/commit/858b89e))
* **Style:** take style.zoom into account for LabelLayer and Feature2Texture ([5ec037b](https://github.com/gchoqueux/itowns/commit/5ec037b))
* **Terrain:** fix terrain subdivision when a terrain tile only has values that should be clamped ([cb96727](https://github.com/gchoqueux/itowns/commit/cb96727))
* **test:** fix local unit tests behind proxy ([9b9d52a](https://github.com/gchoqueux/itowns/commit/9b9d52a))
* **test:** increase time out ([2a55e71](https://github.com/gchoqueux/itowns/commit/2a55e71))
* **tests:** re set --no-sandbox ([c4629d6](https://github.com/gchoqueux/itowns/commit/c4629d6))
* **TileBuilder:** use cached buffers correctly ([#2491](https://github.com/gchoqueux/itowns/issues/2491)) ([f3d2e90](https://github.com/gchoqueux/itowns/commit/f3d2e90))
* **TiledGeometryLayer:** remove subdivision checking code ([#2344](https://github.com/gchoqueux/itowns/issues/2344)) ([e386637](https://github.com/gchoqueux/itowns/commit/e386637))
* **TiledGeometryLayer:** replace get data by the new getPropertyArray ([ec665c3](https://github.com/gchoqueux/itowns/commit/ec665c3))
* **TiledGeometryLayer:** set autoRefreshToken to true ([ebf37dd](https://github.com/gchoqueux/itowns/commit/ebf37dd))
* **VectorTile:** fix {z}/{y}/{x} ([9250fd8](https://github.com/gchoqueux/itowns/commit/9250fd8))
* **VectorTile:** supp order in Style as it's only a Label properties in VT ([3dc135e](https://github.com/gchoqueux/itowns/commit/3dc135e))
* **wms:** assign axis order param from source ([aec3ebf](https://github.com/gchoqueux/itowns/commit/aec3ebf))
* **wms:** take wms 1.1.1 version into account for axis order ([0499f95](https://github.com/gchoqueux/itowns/commit/0499f95))
* **xbilparser:** apply zmin / zmax for any texture subsampling size ([745ab2c](https://github.com/gchoqueux/itowns/commit/745ab2c))
* **Zoom:** use zoom state ([426fe29](https://github.com/gchoqueux/itowns/commit/426fe29))


### Examples

* **3DTiles:** create an only 3D tiles example that can load any 3D tiles ([3eb7a23](https://github.com/gchoqueux/itowns/commit/3eb7a23))
* **MVT:** add example with official MapBox style file ([d1abe5a](https://github.com/gchoqueux/itowns/commit/d1abe5a))
* **PointCloud:** fix errors ([8dc71f9](https://github.com/gchoqueux/itowns/commit/8dc71f9))


### Code Refactoring

* **CopcSource:** use metadata.wkt to set source.crs ([69ed2f4](https://github.com/gchoqueux/itowns/commit/69ed2f4))
* **Crs:** cleanup unit handling ([ea397ee](https://github.com/gchoqueux/itowns/commit/ea397ee))
* **Crs:** remove tms/epsg family of functions ([83eb0d9](https://github.com/gchoqueux/itowns/commit/83eb0d9))
* **Crs:** rename toUnit to getUnit ([2fdf15a](https://github.com/gchoqueux/itowns/commit/2fdf15a))
* **Crs:** use named exports instead of default export ([fca5a29](https://github.com/gchoqueux/itowns/commit/fca5a29))
* **entwineSource:** read crs from metadata.srs ([1ecc6aa](https://github.com/gchoqueux/itowns/commit/1ecc6aa))
* **Layer:** remove Object.assign of config ([cf41e8d](https://github.com/gchoqueux/itowns/commit/cf41e8d))
* migrate Coordinates to typescript ([ec79573](https://github.com/gchoqueux/itowns/commit/ec79573))
* migrate Crs to typescript ([d884ba6](https://github.com/gchoqueux/itowns/commit/d884ba6))
* migrate Ellipsoid to typescript ([a3fb6c5](https://github.com/gchoqueux/itowns/commit/a3fb6c5))
* **MVTParser:** 1 feature per vtfeature ([25db866](https://github.com/gchoqueux/itowns/commit/25db866))
* **PointCloudLayer:** delete onPointsCreated callback ([628ed94](https://github.com/gchoqueux/itowns/commit/628ed94))
* **PointCloudLayer:** promise.catch/finally instead of then(CallBack, errCallBack) ([b2bcb7f](https://github.com/gchoqueux/itowns/commit/b2bcb7f))
* split Extent between geographic/tiled ([4b57498](https://github.com/gchoqueux/itowns/commit/4b57498))
* **test:** change timeout ([327b914](https://github.com/gchoqueux/itowns/commit/327b914))
* **TileBuilder:** migrate to TypeScript ([#2440](https://github.com/gchoqueux/itowns/issues/2440)) ([3207dcd](https://github.com/gchoqueux/itowns/commit/3207dcd))
* URLBuilder as pure functions ([8ba1376](https://github.com/gchoqueux/itowns/commit/8ba1376))
* **VectorTileParser:** cleanup ([fdf4b0a](https://github.com/gchoqueux/itowns/commit/fdf4b0a))


### Workflow and chores

* release v2.46.15 ([f1301de](https://github.com/gchoqueux/itowns/commit/f1301de))
* release v2.46.14 ([0407e7a](https://github.com/gchoqueux/itowns/commit/0407e7a))
* release v2.45.13 ([1fde5b8](https://github.com/gchoqueux/itowns/commit/1fde5b8))
* **architecture:** monorepo structure ([4fb18d3](https://github.com/gchoqueux/itowns/commit/4fb18d3))
* **Crs:** update and refine documentation ([d467a29](https://github.com/gchoqueux/itowns/commit/d467a29))
* **deps-dev:** bump undici from 7.2.0 to 7.2.3 ([f01365d](https://github.com/gchoqueux/itowns/commit/f01365d))
* **deps:** bump [@tweenjs](https://github.com/tweenjs)/tween.js from 23.1.2 to 25.0.0 ([63e2194](https://github.com/gchoqueux/itowns/commit/63e2194))
* **deps:** bump 3d-tiles-renderer from 0.3.37 to 0.3.38 ([837c044](https://github.com/gchoqueux/itowns/commit/837c044))
* **deps:** bump cookie and express ([f602ac7](https://github.com/gchoqueux/itowns/commit/f602ac7))
* **deps:** bump developer dependencies ([4d034b5](https://github.com/gchoqueux/itowns/commit/4d034b5))
* **deps:** bump nanoid from 3.3.7 to 3.3.8 ([09a016f](https://github.com/gchoqueux/itowns/commit/09a016f))
* **deps:** bump proj4 from 2.11.0 to 2.12.1 ([804c65f](https://github.com/gchoqueux/itowns/commit/804c65f))
* **deps:** bump shpjs from 6.0.1 to 6.1.0 ([4937064](https://github.com/gchoqueux/itowns/commit/4937064))
* **deps:** bump three from 0.165.0 to 0.168.0 ([f7303de](https://github.com/gchoqueux/itowns/commit/f7303de))
* **deps:** remove node-fetch from dev dependencies ([1d9ffe9](https://github.com/gchoqueux/itowns/commit/1d9ffe9))
* **Ellipsoid:** add method return types ([fe189be](https://github.com/gchoqueux/itowns/commit/fe189be))
* **eslint:** add no-use-before-define and change max-len rules ([f8021b4](https://github.com/gchoqueux/itowns/commit/f8021b4))
* **eslint:** update config to support TypeScript ([0d6b611](https://github.com/gchoqueux/itowns/commit/0d6b611))
* FIXES NEED TO MERGE ([908710a](https://github.com/gchoqueux/itowns/commit/908710a))
* remove istanbul and editor comments ([#2479](https://github.com/gchoqueux/itowns/issues/2479)) ([c975752](https://github.com/gchoqueux/itowns/commit/c975752))
* rool back copy examples three js ([bec33a4](https://github.com/gchoqueux/itowns/commit/bec33a4))
* update babel and webpack configs to support TypeScript ([8830d6d](https://github.com/gchoqueux/itowns/commit/8830d6d))


### Documentation

* **contributors:** add Tim Ebben ([b65d8ae](https://github.com/gchoqueux/itowns/commit/b65d8ae))
* **Coordinates:** update and refine documentation ([6cb7416](https://github.com/gchoqueux/itowns/commit/6cb7416))
* **Ellipsoid:** update and refine documentation ([f922530](https://github.com/gchoqueux/itowns/commit/f922530))
* **test:** update command to run one functional test ([c862ca7](https://github.com/gchoqueux/itowns/commit/c862ca7))


### Tests

* **lasparser:** add test for parseChunk ([50a17a6](https://github.com/gchoqueux/itowns/commit/50a17a6))
* **VectorTileSource:** fix test ([a80b95f](https://github.com/gchoqueux/itowns/commit/a80b95f))


### BREAKING CHANGES

* **Crs:** CRS.isEPSG and CRS.isTMS have been removed
* **Crs:** CRS.formatToESPG and CRS.formatToTMS have been removed
* **Crs:** CRS.toUnit renamed to CRS.getUnit
* **Crs:** CRS.reasonnableEspsilon renamed to CRS.reasonableEpsilon
* **controls:** disabled multi actions when zooming



<a name="2.46.14"></a>
## [2.46.14](https://github.com/gchoqueux/itowns/compare/v2.46.13...v2.46.14) (2025-01-29)


### Workflow and chores

* release v2.46.14 ([cbad257](https://github.com/gchoqueux/itowns/commit/cbad257))



<a name="2.46.13"></a>
## [2.46.13](https://github.com/gchoqueux/itowns/compare/v2.46.6...v2.46.13) (2025-01-29)


### Workflow and chores

* release v2.46.13 ([50dc661](https://github.com/gchoqueux/itowns/commit/50dc661))
* release v2.46.12 ([aad99e9](https://github.com/gchoqueux/itowns/commit/aad99e9))
* release v2.46.11 ([a957bb7](https://github.com/gchoqueux/itowns/commit/a957bb7))
* release v2.46.10 ([00288d9](https://github.com/gchoqueux/itowns/commit/00288d9))
* release v2.46.9 ([48e33f0](https://github.com/gchoqueux/itowns/commit/48e33f0))
* release v2.46.8 ([6e6d68c](https://github.com/gchoqueux/itowns/commit/6e6d68c))
* release v2.46.7 ([a9959e5](https://github.com/gchoqueux/itowns/commit/a9959e5))
* try to debug github ([9fd3404](https://github.com/gchoqueux/itowns/commit/9fd3404))
* try to debug github ([dfae920](https://github.com/gchoqueux/itowns/commit/dfae920))



<a name="2.46.12"></a>
## [2.46.12](https://github.com/gchoqueux/itowns/compare/v2.46.6...v2.46.12) (2025-01-29)


### Workflow and chores

* release v2.46.12 ([f567cb1](https://github.com/gchoqueux/itowns/commit/f567cb1))
* release v2.46.11 ([a957bb7](https://github.com/gchoqueux/itowns/commit/a957bb7))
* release v2.46.10 ([00288d9](https://github.com/gchoqueux/itowns/commit/00288d9))
* release v2.46.9 ([48e33f0](https://github.com/gchoqueux/itowns/commit/48e33f0))
* release v2.46.8 ([6e6d68c](https://github.com/gchoqueux/itowns/commit/6e6d68c))
* release v2.46.7 ([a9959e5](https://github.com/gchoqueux/itowns/commit/a9959e5))
* try to debug github ([9fd3404](https://github.com/gchoqueux/itowns/commit/9fd3404))
* try to debug github ([dfae920](https://github.com/gchoqueux/itowns/commit/dfae920))



<a name="2.46.11"></a>
## [2.46.11](https://github.com/gchoqueux/itowns/compare/v2.46.6...v2.46.11) (2025-01-29)


### Workflow and chores

* release v2.46.11 ([058d83f](https://github.com/gchoqueux/itowns/commit/058d83f))
* release v2.46.10 ([00288d9](https://github.com/gchoqueux/itowns/commit/00288d9))
* release v2.46.9 ([48e33f0](https://github.com/gchoqueux/itowns/commit/48e33f0))
* release v2.46.8 ([6e6d68c](https://github.com/gchoqueux/itowns/commit/6e6d68c))
* release v2.46.7 ([a9959e5](https://github.com/gchoqueux/itowns/commit/a9959e5))
* try to debug github ([9fd3404](https://github.com/gchoqueux/itowns/commit/9fd3404))
* try to debug github ([dfae920](https://github.com/gchoqueux/itowns/commit/dfae920))



<a name="2.46.10"></a>
## [2.46.10](https://github.com/gchoqueux/itowns/compare/v2.46.6...v2.46.10) (2025-01-29)


### Workflow and chores

* release v2.46.10 ([83bcbce](https://github.com/gchoqueux/itowns/commit/83bcbce))
* release v2.46.9 ([48e33f0](https://github.com/gchoqueux/itowns/commit/48e33f0))
* release v2.46.8 ([6e6d68c](https://github.com/gchoqueux/itowns/commit/6e6d68c))
* release v2.46.7 ([a9959e5](https://github.com/gchoqueux/itowns/commit/a9959e5))
* try to debug github ([9fd3404](https://github.com/gchoqueux/itowns/commit/9fd3404))
* try to debug github ([dfae920](https://github.com/gchoqueux/itowns/commit/dfae920))



<a name="2.46.9"></a>
## [2.46.9](https://github.com/gchoqueux/itowns/compare/v2.46.6...v2.46.9) (2025-01-29)


### Workflow and chores

* release v2.46.9 ([d9d0f4c](https://github.com/gchoqueux/itowns/commit/d9d0f4c))
* release v2.46.8 ([97978f4](https://github.com/gchoqueux/itowns/commit/97978f4))
* release v2.46.7 ([ddb9926](https://github.com/gchoqueux/itowns/commit/ddb9926))
* try to debug github ([dfae920](https://github.com/gchoqueux/itowns/commit/dfae920))



<a name="2.46.8"></a>
## [2.46.8](https://github.com/gchoqueux/itowns/compare/v2.46.6...v2.46.8) (2025-01-29)


### Workflow and chores

* release v2.46.8 ([3744081](https://github.com/gchoqueux/itowns/commit/3744081))
* release v2.46.7 ([ddb9926](https://github.com/gchoqueux/itowns/commit/ddb9926))
* try to debug github ([dfae920](https://github.com/gchoqueux/itowns/commit/dfae920))



<a name="2.46.7"></a>
## [2.46.7](https://github.com/gchoqueux/itowns/compare/v2.46.6...v2.46.7) (2025-01-29)


### Workflow and chores

* release v2.46.7 ([dc35a92](https://github.com/gchoqueux/itowns/commit/dc35a92))
* try to debug github ([49f7428](https://github.com/gchoqueux/itowns/commit/49f7428))



<a name="2.46.6"></a>
## [2.46.6](https://github.com/gchoqueux/itowns/compare/v2.46.1...v2.46.6) (2025-01-29)


### Bug Fixes

* **deploy:** remove verbose ([51d6ea7](https://github.com/gchoqueux/itowns/commit/51d6ea7))
* **publish:** add debug git ([09c6a73](https://github.com/gchoqueux/itowns/commit/09c6a73))
* **publish:** add submodule checkout ([47613d2](https://github.com/gchoqueux/itowns/commit/47613d2))
* **publish:** add submodule checkout recursive ([95f9f32](https://github.com/gchoqueux/itowns/commit/95f9f32))
* **publish:** add submodule checkout recursive ([dad064a](https://github.com/gchoqueux/itowns/commit/dad064a))


### Workflow and chores

* release v2.46.6 ([2210fb9](https://github.com/gchoqueux/itowns/commit/2210fb9))
* release v2.46.5 ([ad5159e](https://github.com/gchoqueux/itowns/commit/ad5159e))
* release v2.46.4 ([8c230e6](https://github.com/gchoqueux/itowns/commit/8c230e6))
* release v2.46.3 ([6c03eb9](https://github.com/gchoqueux/itowns/commit/6c03eb9))
* release v2.46.2 ([28ef771](https://github.com/gchoqueux/itowns/commit/28ef771))
* enable debug ([1403c90](https://github.com/gchoqueux/itowns/commit/1403c90))
* try to debug github ([6c3f72e](https://github.com/gchoqueux/itowns/commit/6c3f72e))
* Update integration.yml ([f838b17](https://github.com/gchoqueux/itowns/commit/f838b17))



<a name="2.46.5"></a>
## [2.46.5](https://github.com/gchoqueux/itowns/compare/v2.46.1...v2.46.5) (2025-01-29)


### Bug Fixes

* **deploy:** remove verbose ([51d6ea7](https://github.com/gchoqueux/itowns/commit/51d6ea7))
* **publish:** add debug git ([09c6a73](https://github.com/gchoqueux/itowns/commit/09c6a73))
* **publish:** add submodule checkout ([47613d2](https://github.com/gchoqueux/itowns/commit/47613d2))
* **publish:** add submodule checkout recursive ([95f9f32](https://github.com/gchoqueux/itowns/commit/95f9f32))
* **publish:** add submodule checkout recursive ([dad064a](https://github.com/gchoqueux/itowns/commit/dad064a))


### Workflow and chores

* release v2.46.5 ([ab86e4e](https://github.com/gchoqueux/itowns/commit/ab86e4e))
* release v2.46.4 ([8c230e6](https://github.com/gchoqueux/itowns/commit/8c230e6))
* release v2.46.3 ([6c03eb9](https://github.com/gchoqueux/itowns/commit/6c03eb9))
* release v2.46.2 ([28ef771](https://github.com/gchoqueux/itowns/commit/28ef771))
* enable debug ([1403c90](https://github.com/gchoqueux/itowns/commit/1403c90))
* Update integration.yml ([f838b17](https://github.com/gchoqueux/itowns/commit/f838b17))



<a name="2.46.4"></a>
## [2.46.4](https://github.com/gchoqueux/itowns/compare/v2.46.1...v2.46.4) (2025-01-29)


### Bug Fixes

* **deploy:** remove verbose ([51d6ea7](https://github.com/gchoqueux/itowns/commit/51d6ea7))
* **publish:** add debug git ([09c6a73](https://github.com/gchoqueux/itowns/commit/09c6a73))
* **publish:** add submodule checkout ([47613d2](https://github.com/gchoqueux/itowns/commit/47613d2))
* **publish:** add submodule checkout recursive ([95f9f32](https://github.com/gchoqueux/itowns/commit/95f9f32))
* **publish:** add submodule checkout recursive ([dad064a](https://github.com/gchoqueux/itowns/commit/dad064a))


### Workflow and chores

* release v2.46.4 ([9153472](https://github.com/gchoqueux/itowns/commit/9153472))
* release v2.46.3 ([6c03eb9](https://github.com/gchoqueux/itowns/commit/6c03eb9))
* release v2.46.2 ([28ef771](https://github.com/gchoqueux/itowns/commit/28ef771))
* Update integration.yml ([f838b17](https://github.com/gchoqueux/itowns/commit/f838b17))



<a name="2.46.3"></a>
## [2.46.3](https://github.com/gchoqueux/itowns/compare/v2.46.1...v2.46.3) (2025-01-29)


### Bug Fixes

* **deploy:** remove verbose ([51d6ea7](https://github.com/gchoqueux/itowns/commit/51d6ea7))
* **publish:** add debug git ([09c6a73](https://github.com/gchoqueux/itowns/commit/09c6a73))
* **publish:** add submodule checkout ([47613d2](https://github.com/gchoqueux/itowns/commit/47613d2))
* **publish:** add submodule checkout recursive ([95f9f32](https://github.com/gchoqueux/itowns/commit/95f9f32))
* **publish:** add submodule checkout recursive ([dad064a](https://github.com/gchoqueux/itowns/commit/dad064a))


### Workflow and chores

* release v2.46.3 ([6f1f7af](https://github.com/gchoqueux/itowns/commit/6f1f7af))
* release v2.46.2 ([28ef771](https://github.com/gchoqueux/itowns/commit/28ef771))
* Update integration.yml ([f838b17](https://github.com/gchoqueux/itowns/commit/f838b17))



<a name="2.46.2"></a>
## [2.46.2](https://github.com/gchoqueux/itowns/compare/v2.46.1...v2.46.2) (2025-01-29)


### Bug Fixes

* **publish:** add debug git ([09c6a73](https://github.com/gchoqueux/itowns/commit/09c6a73))
* **publish:** add submodule checkout ([47613d2](https://github.com/gchoqueux/itowns/commit/47613d2))
* **publish:** add submodule checkout recursive ([95f9f32](https://github.com/gchoqueux/itowns/commit/95f9f32))
* **publish:** add submodule checkout recursive ([dad064a](https://github.com/gchoqueux/itowns/commit/dad064a))


### Workflow and chores

* release v2.46.2 ([ba91e2b](https://github.com/gchoqueux/itowns/commit/ba91e2b))
* Update integration.yml ([f838b17](https://github.com/gchoqueux/itowns/commit/f838b17))



<a name="2.46.1"></a>
## [2.46.1](https://github.com/gchoqueux/itowns/compare/v2.46.0...v2.46.1) (2025-01-28)


### Bug Fixes

* **deplay:** try to add modified ([6247fe7](https://github.com/gchoqueux/itowns/commit/6247fe7))


### Workflow and chores

* release v2.46.1 ([734f5dd](https://github.com/gchoqueux/itowns/commit/734f5dd))



<a name="2.46.0"></a>
# [2.46.0](https://github.com/gchoqueux/itowns/compare/v2.45.13...v2.46.0) (2025-01-28)


### Bug Fixes

* **publish:** to remove ([a9b365c](https://github.com/gchoqueux/itowns/commit/a9b365c))


### Workflow and chores

* release v2.46.0 ([9234806](https://github.com/gchoqueux/itowns/commit/9234806))



