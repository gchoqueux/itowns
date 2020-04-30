import * as THREE from 'three';
import utf8Decoder from 'Utils/Utf8Decoder';

import BatchTableParser from './BatchTableParser';

export default {
    /** @module PntsParser */
    /** Parse pnts buffer and extract THREE.Points and batch table
     * @function parse
     * @param {ArrayBuffer} buffer - the pnts buffer.
     * @return {Promise} - a promise that resolves with an object containig a THREE.Points (point) and a batch table (batchTable).
     *
     */
    parse: function parse(buffer) {
        if (!buffer) {
            throw new Error('No array buffer provided.');
        }
        const view = new DataView(buffer);

        let byteOffset = 0;
        const pntsHeader = {};
        let batchTable = {};
        let point = {};

        // Magic type is unsigned char [4]
        pntsHeader.magic = utf8Decoder.decode(new Uint8Array(buffer, byteOffset, 4));
        byteOffset += 4;

        if (pntsHeader.magic) {
            // Version, byteLength, batchTableJSONByteLength, batchTableBinaryByteLength and batchTable types are uint32
            pntsHeader.version = view.getUint32(byteOffset, true);
            byteOffset += Uint32Array.BYTES_PER_ELEMENT;

            pntsHeader.byteLength = view.getUint32(byteOffset, true);
            byteOffset += Uint32Array.BYTES_PER_ELEMENT;

            pntsHeader.FTJSONLength = view.getUint32(byteOffset, true);
            byteOffset += Uint32Array.BYTES_PER_ELEMENT;

            pntsHeader.FTBinaryLength = view.getUint32(byteOffset, true);
            byteOffset += Uint32Array.BYTES_PER_ELEMENT;

            pntsHeader.BTJSONLength = view.getUint32(byteOffset, true);
            byteOffset += Uint32Array.BYTES_PER_ELEMENT;

            pntsHeader.BTBinaryLength = view.getUint32(byteOffset, true);
            byteOffset += Uint32Array.BYTES_PER_ELEMENT;

            // binary table
            if (pntsHeader.FTBinaryLength > 0) {
                point = parseFeatureBinary(buffer, byteOffset, pntsHeader.FTJSONLength);
            }

            // batch table
            if (pntsHeader.BTJSONLength > 0) {
                const sizeBegin = 28 + pntsHeader.FTJSONLength + pntsHeader.FTBinaryLength;
                batchTable = BatchTableParser.parse(
                    buffer.slice(sizeBegin, pntsHeader.BTJSONLength + sizeBegin));
            }

            const pnts = { point, batchTable };
            return Promise.resolve(pnts);
        } else {
            throw new Error('Invalid pnts file.');
        }
    },
};

function parseFeatureBinary(array, byteOffset, FTJSONLength) {
    // Init geometry
    const geometry = new THREE.BufferGeometry();


    // init Array feature binary
    const subArrayJson = utf8Decoder.decode(new Uint8Array(array, byteOffset, FTJSONLength));
    const parseJSON = JSON.parse(subArrayJson);
    let lengthFeature;
    if (parseJSON.POINTS_LENGTH) {
        lengthFeature = parseJSON.POINTS_LENGTH;
    }
    if (parseJSON.POSITION) {
        const byteOffsetPos = (parseJSON.POSITION.byteOffset + subArrayJson.length + byteOffset);
        const positionArray = new Float32Array(array, byteOffsetPos, lengthFeature * 3);
        geometry.setAttribute('position', new THREE.BufferAttribute(positionArray, 3));
    }
    if (parseJSON.RGB) {
        const byteOffsetCol = parseJSON.RGB.byteOffset + subArrayJson.length + byteOffset;
        const colorArray = new Uint8Array(array, byteOffsetCol, lengthFeature * 3);
        geometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3, true));
    }
    // eslint-disable-next-line no-debugger
    // debugger;
    if (parseJSON.POSITION_QUANTIZED) {
        const byteOffsetPos = (parseJSON.POSITION_QUANTIZED.byteOffset + subArrayJson.length + byteOffset);
        const qpositionArray = new Uint16Array(array, byteOffsetPos, lengthFeature * 3);
        // console.log('positionArray', qpositionArray);
        const positionArray = new Float32Array(qpositionArray.length);
        for (var i = 0; i < positionArray.length; i += 3) {
            positionArray[i] = qpositionArray[i] *  parseJSON.QUANTIZED_VOLUME_SCALE[0] / 65535.0 + parseJSON.QUANTIZED_VOLUME_OFFSET[0];
            positionArray[i + 1] = qpositionArray[i + 1] *  parseJSON.QUANTIZED_VOLUME_SCALE[1] / 65535.0 + parseJSON.QUANTIZED_VOLUME_OFFSET[1];
            positionArray[i + 2] = qpositionArray[i + 2] *  parseJSON.QUANTIZED_VOLUME_SCALE[2] / 65535.0 + parseJSON.QUANTIZED_VOLUME_OFFSET[2];
        }

        // console.log('positionArray', positionArray);
        // qpositionArray.forEach()

        geometry.setAttribute('position', new THREE.BufferAttribute(positionArray, 3));
        // throw new Error('For pnts loader, POSITION_QUANTIZED: not yet managed');
    }
    // if (parseJSON.RGBA) {
    //     throw new Error('For pnts loader, RGBA: not yet managed');
    // }
    // if (parseJSON.RGB565) {
    //     throw new Error('For pnts loader, RGB565: not yet managed');
    // }
    // if (parseJSON.NORMAL) {
    //     throw new Error('For pnts loader, NORMAL: not yet managed');
    // }
    // if (parseJSON.NORMAL_OCT16P) {
    //     throw new Error('For pnts loader, NORMAL_OCT16P: not yet managed');
    // }
    // if (parseJSON.BATCH_ID) {
    //     throw new Error('For pnts loader, BATCH_ID: not yet managed');
    // }

    // Add RTC feature
    const offset = parseJSON.RTC_CENTER ?
        new THREE.Vector3().fromArray(parseJSON.RTC_CENTER) : undefined;
        // eslint-disable-next-line no-debugger
        // debugger;
    return {
        geometry,
        offset,
    };
}
