import * as THREE from 'three';
import { FEATURE_TYPES } from 'Core/Feature';
import Extent from 'Core/Geographic/Extent';
import { readExpression } from 'Core/Style';
import Coordinates from 'Core/Geographic/Coordinates';

const _extent = new Extent('EPSG:4326', [0, 0, 0, 0]);
const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
const matrix = svg.createSVGMatrix();

function drawPolygon(ctx, vertices, indices = [{ offset: 0, count: 1 }], style = {}, size, extent, invCtxScale, canBeFilled, featureCtx) {
    if (vertices.length === 0) {
        return;
    }

    if (style.length) {
        for (const s of style) {
            _drawPolygon(ctx, vertices, indices, s, size, extent, invCtxScale, canBeFilled, featureCtx);
        }
    } else {
        _drawPolygon(ctx, vertices, indices, style, size, extent, invCtxScale, canBeFilled, featureCtx);
    }
}

function _drawPolygon(ctx, vertices, indices, style, size, extent, invCtxScale, canBeFilled, featureCtx) {
    // build contour
    ctx.beginPath();
    for (const indice of indices) {
        if (indice.extent && indice.extent.intersectsExtent(extent)) {
            const offset = indice.offset * size;
            const count = offset + indice.count * size;
            ctx.moveTo(vertices[offset], vertices[offset + 1]);
            for (let j = offset + size; j < count; j += size) {
                ctx.lineTo(vertices[j], vertices[j + 1]);
            }
        }
    }

    // draw line or edge of polygon
    if (style.stroke.color) {
        strokeStyle(style, ctx, invCtxScale, featureCtx);
        ctx.stroke();
    }

    // fill polygon only
    if (canBeFilled && (style.fill.color || style.fill.pattern)) {
        fillStyle(style, ctx, invCtxScale, featureCtx);
        ctx.fill();
    }
}

function fillStyle(style, ctx, invCtxScale, featureCtx) {
    if (style.fill.pattern && ctx.fillStyle.src !== style.fill.pattern.src) {
        ctx.fillStyle = ctx.createPattern(style.fill.pattern, 'repeat');
        if (ctx.fillStyle.setTransform) {
            ctx.fillStyle.setTransform(matrix.scale(invCtxScale));
        } else {
            console.warn('Raster pattern isn\'t completely supported on Ie and edge');
        }
    } else if (style.fill.color) {
        const fillStyle = readExpression(style.fill.color, featureCtx);
        if (ctx.fillStyle !== fillStyle) {
            ctx.fillStyle = fillStyle;
        }
    }

    const opacity = readExpression(style.fill.opacity, featureCtx);
    if (opacity !== ctx.globalAlpha) {
        ctx.globalAlpha = opacity;
    }
}

function strokeStyle(style, ctx, invCtxScale, featureCtx) {
    const strokeStyle = readExpression(style.stroke.color, featureCtx);
    if (ctx.strokeStyle !== strokeStyle) {
        ctx.strokeStyle = strokeStyle;
    }
    const width = (readExpression(style.stroke.width, featureCtx) || 2.0) * invCtxScale;
    if (ctx.lineWidth !== width) {
        ctx.lineWidth = width;
    }
    const opacity = readExpression(style.stroke.opacity, featureCtx);
    const alpha = opacity == undefined ? 1.0 : opacity;
    if (alpha !== ctx.globalAlpha && typeof alpha == 'number') {
        ctx.globalAlpha = alpha;
    }
    const lineCap = readExpression(style.stroke.lineCap, featureCtx);
    if (ctx.lineCap !== lineCap) {
        ctx.lineCap = lineCap;
    }
    const dasharray = readExpression(style.stroke.dasharray, featureCtx);
    ctx.setLineDash(dasharray.map(a => a * invCtxScale * 2));
}

function drawPoint(ctx, x, y, style = {}, invCtxScale, featureCtx) {
    ctx.beginPath();
    let opacity = readExpression(style.point.opacity, featureCtx);
    opacity = opacity == undefined ? 1.0 : opacity;
    if (opacity !== ctx.globalAlpha) {
        ctx.globalAlpha = opacity;
    }

    const radius = readExpression(style.point.radius, featureCtx);
    ctx.arc(x, y, (radius || 3.0) * invCtxScale, 0, 2 * Math.PI, false);
    const color = readExpression(style.point.color, featureCtx);
    if (color) {
        ctx.fillStyle = color;
        ctx.fill();
    }

    const line = readExpression(style.point.line, featureCtx);
    if (line) {
        const lineWidth = (readExpression(style.point.width, featureCtx) || 1.0) * invCtxScale;
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = line;
        ctx.stroke();
    }
}

const coord = new Coordinates('EPSG:4326', 0, 0, 0);

function drawFeature(ctx, feature, extent, style, invCtxScale) {
    const extentDim = extent.dimensions();
    const scaleRadius = extentDim.x / ctx.canvas.width;

    for (const geometry of feature.geometries) {
        if (geometry.extent.intersectsExtent(extent)) {
            const geoStyle = geometry.properties.style || style;
            const geomCtx = { globals: { zoom: extent.zoom }, properties: () => geometry.properties };
            if (feature.type === FEATURE_TYPES.POINT) {
                // cross multiplication to know in the extent system the real size of
                // the point
                const px = (Math.round(geoStyle.point.radius * invCtxScale) || 3 * invCtxScale) * scaleRadius;
                for (const indice of geometry.indices) {
                    const offset = indice.offset * feature.size;
                    const count = offset + indice.count * feature.size;
                    for (let j = offset; j < count; j += feature.size) {
                        coord.setFromArray(feature.vertices, j);
                        if (extent.isPointInside(coord, px)) {
                            drawPoint(ctx, feature.vertices[j], feature.vertices[j + 1], geoStyle, invCtxScale, geomCtx);
                        }
                    }
                }
            } else {
                drawPolygon(ctx, feature.vertices, geometry.indices, geoStyle, feature.size, extent, invCtxScale, (feature.type == FEATURE_TYPES.POLYGON), geomCtx);
            }
        }
    }
}

const origin = new THREE.Vector2();
const dimension = new THREE.Vector2();
const scale = new THREE.Vector2();
const extentTransformed = new Extent('EPSG:4326', 0, 0, 0, 0);

export default {
    // backgroundColor is a THREE.Color to specify a color to fill the texture
    // with, given there is no feature passed in parameter
    createTextureFromFeature(collection, extent, sizeTexture, style, backgroundColor) {
        let texture;

        if (collection) {
            // A texture is instancied drawn canvas
            // origin and dimension are used to transform the feature's coordinates to canvas's space
            extent.dimensions(dimension);
            const c = document.createElement('canvas');

            coord.crs = extent.crs;

            c.width = sizeTexture;
            c.height = sizeTexture;
            const ctx = c.getContext('2d');
            if (backgroundColor) {
                ctx.fillStyle = backgroundColor.getStyle();
                ctx.fillRect(0, 0, sizeTexture, sizeTexture);
            }
            ctx.globalCompositeOperation = style.globalCompositeOperation || 'source-over';
            ctx.imageSmoothingEnabled = false;
            ctx.lineJoin = 'round';

            const ex = collection.crs == extent.crs ? extent : extent.as(collection.crs, _extent);
            const t = collection.translation;
            const s = collection.scale;
            extentTransformed.transformedCopy(t, s, ex);

            scale.set(ctx.canvas.width, ctx.canvas.width).divide(dimension);
            origin.set(extent.west, extent.south).add(t).multiply(scale).negate();
            ctx.setTransform(scale.x / s.x, 0, 0, scale.y / s.y, origin.x, origin.y);

            // to scale line width and radius circle
            const invCtxScale = s.x / scale.x;

            // Draw the canvas
            for (const feature of collection.features) {
                drawFeature(ctx, feature, extentTransformed, feature.style || style, invCtxScale);
            }

            texture = new THREE.CanvasTexture(c);
            texture.flipY = false;
        } else if (backgroundColor) {
            const data = new Uint8Array(3);
            data[0] = backgroundColor.r * 255;
            data[1] = backgroundColor.g * 255;
            data[2] = backgroundColor.b * 255;
            texture = new THREE.DataTexture(data, 1, 1, THREE.RGBFormat);
        } else {
            texture = new THREE.Texture();
        }

        return texture;
    },
};
