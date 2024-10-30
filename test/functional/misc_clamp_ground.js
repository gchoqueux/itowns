import assert from 'assert';

describe('misc_clamp_ground', function _() {
    let result;
    before(async () => {
        result = await loadExample('examples/misc_clamp_ground.html', this.fullTitle());
    });

    it('should run', async () => {
        assert.ok(result);
    });

    it('should get picking position from depth, with error inferiour to 2‰', async () => {
        // Hide cone the cone and set range
        const destRange = 1500;
        await page.evaluate((range) => {
            view.mesh.material.visible = false;
            return view.controls.setRange(range, false);
        }, destRange);

        // Wait itowns loading new elevation data
        await waitUntilItownsIsIdle();

        // get range value with globeControls method
        const controlsMethod = await page.evaluate(() => view.controls.getRange());

        // get range with depth buffer
        const depthMethod = await page.evaluate(() => view
            .getPickingPositionFromDepth().distanceTo(view.camera3D.position));

        assert.ok(Math.abs(controlsMethod - destRange) / destRange < 0.002);
        assert.ok(Math.abs(depthMethod - destRange) / destRange < 0.002);
    });
});
