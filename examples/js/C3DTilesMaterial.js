/* global THREE */

class C3DTilesMaterial extends THREE.MeshPhysicalMaterial {
    constructor(options = {}) {
        const { layer } = options;
        delete options.layer;
        options.transparent = true;
        super(options);
        this.layer = layer || {};

        this.uniforms = {
            year: new THREE.Uniform(layer.year),
            years: new THREE.Uniform(new Float32Array(layer.years)),
        };
    }

    onBeforeCompile(shader) {
        shader.uniforms.year = this.uniforms.year;
        shader.uniforms.years = this.uniforms.years;
        shader.fragmentShader = shader.fragmentShader.replace('void main() {',
            `
            varying float BATCHID;

            uniform float year;
            uniform float years[300];

            void main() {
        `);

        shader.fragmentShader = shader.fragmentShader.replace('#include <clipping_planes_fragment>',
            `#include <clipping_planes_fragment>

            float buildyear = years[int(BATCHID)];

            if  (buildyear > year) {
                discard;
            }
            `);

        shader.vertexShader = shader.vertexShader.replace('void main() {',
            `
            varying float BATCHID;
            attribute float _BATCHID;
            void main() {
                BATCHID = _BATCHID;
        `);
    }

    onBeforeRender() {
        this.uniforms.year.value = this.layer.year;
        this.uniforms.years.value = this.layer.years;
        this.needsUpdate = true;
    }
}

// export default C3DTilesMaterial;


