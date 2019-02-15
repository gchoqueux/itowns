import * as THREE from 'three';
import html2canvas from 'html2canvas';



export function spriteHtml2canvas(view, position, message, div) {
    if (!div) {
        div = document.createElement('div');
        document.getElementsByTagName('BODY')[0].append(div);
        div.className = 'label';
        div.textContent = message || 'Message';
        div.style.marginTop = '-1em';
        div.style.display = 'inline-block';
    }

    html2canvas(div, { backgroundColor: null }).then((canvas) => {
        const texture = new THREE.CanvasTexture(canvas);
        texture.generateMipmaps = false;
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;

        const material = new THREE.SpriteMaterial({ map: texture, sizeAttenuation: false });
        material.transparent = true;
        const width = material.map.image.width;
        const height = material.map.image.height;
        const sprite = new THREE.Sprite(material);
        sprite.center.set(0.5, 0.0);
        const ratio = view.mainLoop.gfxEngine.width / view.mainLoop.gfxEngine.height;
        const scale = 1 / view.mainLoop.gfxEngine.height / 1.859756098;

        sprite.scale.set(width * scale, height * scale, 1);
        console.log(width);
        position.as(view.referenceCrs).xyz(sprite.position);
        view.scene.add(sprite);
        sprite.updateMatrixWorld(true);
        view.notifyChange();
    });
}

/*
// R2Texture
const framebuffer = this.mainLoop.gfxEngine.renderer.context.createFramebuffer();

// const dpr = window.devicePixelRatio;
const vector = new THREE.Vector2(0, 500);
this.addFrameRequester(MAIN_LOOP_EVENTS.AFTER_RENDER, () => {
    if (textureTarget) {
        this.mainLoop.gfxEngine.renderer.copyFramebufferToTexture(vector, textureTarget);
        textureTarget.needsUpdate = true;

        var texturePorperties = renderer.properties.get(textureTarget);

        const gl = this.mainLoop.gfxEngine.renderer.context;
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texturePorperties.__webglTexture, 0);

        gl.readPixels(0, 0, textureSize, textureSize, gl.RGB, gl.UNSIGNED_BYTE, textureTarget.image.data); // read data back to array buffer
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
});
*/


export function spriteR2Texture(view, position, textureTarget) {
    const material = new THREE.SpriteMaterial({ map: textureTarget, sizeAttenuation: false });
    material.transparent = true;
    const width = material.map.image.width;
    const height = material.map.image.height;
    const sprite = new THREE.Sprite(material);

    sprite.scale.set(width / view.mainLoop.gfxEngine.width / 2.56, height / view.mainLoop.gfxEngine.width / 2.56, 1);

    position.setAltitude(100);
    position.as('EPSG:4978').xyz(sprite.position);
    view.scene.add(sprite);
    sprite.updateMatrixWorld(true);
}
