import * as THREE from 'three';
import DEMUtils from 'Utils/DEMUtils';
import Coordinates from 'Core/Geographic/Coordinates';

const coord = new Coordinates('EPSG:4326');
let rect;

// set it once
let STYLE_TRANSFORM = '';
if (document.documentElement.style.transform !== undefined) {
    STYLE_TRANSFORM = 'transform';
} else if (document.documentElement.style.webkitTransform !== undefined) {
    STYLE_TRANSFORM = 'webkitTransform';
} else if (document.documentElement.style.mozTransform !== undefined) {
    STYLE_TRANSFORM = 'mozTransform';
} else if (document.documentElement.style.oTransform !== undefined) {
    STYLE_TRANSFORM = 'oTransform';
} else {
    STYLE_TRANSFORM = 'transform';
}


function makeTextCanvas(text, size) {
    // const size = 15;
    const borderSize = 0;
    const doubleBorderSize = borderSize * 2;

    const textCtx = document.createElement('canvas').getContext('2d');
    textCtx.font = '20px monospace';
    const textWidth = textCtx.measureText(text).width;

    textCtx.canvas.width  = textWidth + doubleBorderSize;
    textCtx.canvas.height = size + doubleBorderSize;
    textCtx.font = `${size}px monospace`;
    textCtx.textAlign = 'center';
    textCtx.textBaseline = 'middle';
    textCtx.clearRect(0, 0, textCtx.canvas.width, textCtx.canvas.height);
    textCtx.strokeStyle = 'white';
    textCtx.lineWidth = 2;
    textCtx.strokeText(text, textCtx.canvas.width * 0.5, textCtx.canvas.height * 0.5);
    textCtx.fillStyle = 'black';
    textCtx.fillText(text, textCtx.canvas.width * 0.5, textCtx.canvas.height * 0.5);
    return textCtx.canvas;
}

/**
 * An object that handles the display of a text and/or an icon, linked to a 3D
 * position. The content of the `Label` is managed through a DOM object, in a
 * `<div>` handled by the `Label2DRenderer`.
 *
 * @property {boolean} isLabel - Used to checkout whether this object is a
 * Label. Default is true. You should not change this, as it is used internally
 * for optimisation.
 * @property {Element} content - The DOM object that contains the content of the
 * label. The style and the position are applied on this object. All labels
 * contain the `itowns-label` class, as well as a specific class related to the
 * layer linked to it: `itowns-label-[layer-id]` (replace `[layer-id]` by the
 * correct string).
 * @property {THREE.Vector3} position - The position in the 3D world of the
 * label.
 * @property {number} padding - sets the padding area on all four sides of an element at once.
 * @property {Coordinates} coordinates - The coordinates of the label.
 * @property {number} order - Order of the label that will be read from the
 * style. It helps sorting and prioritizing a Label during render.
 */
class Label extends THREE.Sprite {
    /**
     * @param {Element|string} content - The content; can be a
     * string, with or without HTML tags in it, or it can be an Element.
     * @param {Coordinates} coordinates - The world coordinates, where to place
     * the Label.
     * @param {Style} style - The style to apply to the content. Once the style
     * is applied, it cannot be changed directly. However, if it really needed,
     * it can be accessed through `label.content.style`, but it is highly
     * discouraged to do so.
     * @param {Object} [sprites] the sprites.
     */
    constructor(content = '', coordinates, style = {}, sprites) {
        if (coordinates == undefined) {
            throw new Error('coordinates are mandatory to add a Label');
        }

        coordinates.z = 500;

        // const base = 100;

        const fontsize = 20;

        // const c = makeLabelCanvas(base, fontsize, content);
        const c = makeTextCanvas(content, fontsize);

        const map = new THREE.CanvasTexture(c);

        const material = new THREE.SpriteMaterial({ map });

        // map.magFilter = THREE.NearestFilter;
        // map.minFilter = THREE.NearestFilter;
        // map.generateMipmaps = false;
        material.sizeAttenuation = false;
        material.depthWrite = false;

        super(material);

        this.frustumCulled = false;

        this.isLabel = true;
        this.coordinates = coordinates;

        this.projectedPosition = { x: 0, y: 0 };
        this.boundaries = { left: 0, right: 0, top: 0, bottom: 0 };

        this.content = document.createElement('div');
        this.baseContent = content;

        if (style.isStyle) {
            this.anchor = style.getTextAnchorPosition();
            if (style.text.haloWidth > 0) {
                this.content.classList.add('itowns-stroke-single');
            }
            // style.applyToHTML(this.content, sprites);
        } else {
            this.anchor = [0, 0];
        }

        this.zoom = {
            min: style.zoom && style.zoom.min != undefined ? style.zoom.min : 2,
            max: style.zoom && style.zoom.max != undefined ? style.zoom.max : 24,
        };

        this.order = style.order || 0;
        // Padding value, to avoid labels being too close to each
        // other. This value has been choosen arbitrarily.
        this.padding = 7;

        this.offset = {
            left: c.width * this.anchor[0],
            top: c.height * this.anchor[1],
        };
        this.offset.right = this.offset.left + c.width;
        this.offset.bottom = this.offset.top + c.height;
    }

    /**
     * Moves a label on the screen, using screen coordinates. It updates the
     * boundaries as it moves it.
     *
     * @param {number} x - X coordinates in pixels, from left.
     * @param {number} y - Y coordinates in pixels, from top.
     */
    updateProjectedPosition(x, y) {
        const X = Math.round(x);
        const Y = Math.round(y);
        if (X != this.projectedPosition.x || Y != this.projectedPosition.y) {
            this.projectedPosition.x = X;
            this.projectedPosition.y = Y;

            this.boundaries.left = x + this.offset.left - this.padding;
            this.boundaries.right = x + this.offset.right + this.padding;
            this.boundaries.top = y + this.offset.top - this.padding;
            this.boundaries.bottom = y + this.offset.bottom + this.padding;
        }
    }

    update3dPosition(crs) {
        this.coordinates.as(crs, coord);
        coord.toVector3(this.position);
        this.parent.worldToLocal(this.position);
        this.updateMatrixWorld();
    }

    updateElevationFromLayer(layer) {
        const elevation = DEMUtils.getElevationValueAt(layer, this.coordinates, DEMUtils.FAST_READ_Z);
        if (elevation && elevation != this.coordinates.z) {
            this.coordinates.z = elevation;
            this.updateHorizonCullingPoint();
            return true;
        }
    }

    updateHorizonCullingPoint() {
        if (this.horizonCullingPoint) {
            this.getWorldPosition(this.horizonCullingPoint);
        }
    }
}

export default Label;
