import { Matrix4 } from 'three';
import Coordinates from 'Coordinates';
import CRS from 'Crs';
import numeric from 'numeric';

// TRY IN EXAMPLE COLLADA

CRS.defs('EPSG:2154', '+proj=lcc +lat_0=46.5 +lon_0=3 +lat_1=49 +lat_2=44 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs');

function calculateHomography3D(cSrcs, cDsts) {
    // const r1 = [srcPts[0], srcPts[1], 1, 0, 0, 0, -1 * dstPts[0] * srcPts[0], -1 * dstPts[0] * srcPts[1]];
    // const r2 = [0, 0, 0, srcPts[0], srcPts[1], 1, -1 * dstPts[1] * srcPts[0], -1 * dstPts[1] * srcPts[1]];
    // const r3 = [srcPts[2], srcPts[3], 1, 0, 0, 0, -1 * dstPts[2] * srcPts[2], -1 * dstPts[2] * srcPts[3]];
    // const r4 = [0, 0, 0, srcPts[2], srcPts[3], 1, -1 * dstPts[3] * srcPts[2], -1 * dstPts[3] * srcPts[3]];
    // const r5 = [srcPts[4], srcPts[5], 1, 0, 0, 0, -1 * dstPts[4] * srcPts[4], -1 * dstPts[4] * srcPts[5]];
    // const r6 = [0, 0, 0, srcPts[4], srcPts[5], 1, -1 * dstPts[5] * srcPts[4], -1 * dstPts[5] * srcPts[5]];
    // const r7 = [srcPts[6], srcPts[7], 1, 0, 0, 0, -1 * dstPts[6] * srcPts[6], -1 * dstPts[6] * srcPts[7]];
    // const r8 = [0, 0, 0, srcPts[6], srcPts[7], 1, -1 * dstPts[7] * srcPts[6], -1 * dstPts[7] * srcPts[7]];

    let mat = [];

    const cSrc0 = cSrcs[0];
    const cDst0 = cDsts[0];
    for (let i = 0; i < cSrcs.length; i++) {
        const cSrci = cSrcs[i];
        const cSrc = cSrci.clone().setFromValues(cSrci.x - cSrc0.x, cSrci.y - cSrc0.y, cSrci.z - cSrc0.z);
        const cDst = cDsts[i].clone().setFromValues(cDsts[i].x - cDst0.x, cDsts[i].y - cDst0.y, cDsts[i].z - cDst0.z);
        // const cDst = cDsts[i];
        mat = mat.concat([cSrc.x, cSrc.y, cSrc.z, 1,  0, 0, 0, 0,   0, 0, 0, 0,  -cDst.x * cSrc.x, -cDst.x * cSrc.y, -cDst.x * cSrc.z]); // , -X0
        mat = mat.concat([0, 0, 0, 0,  cSrc.x, cSrc.y, cSrc.z, 1,   0, 0, 0, 0,  -cDst.y * cSrc.x, -cDst.y * cSrc.y, -cDst.y * cSrc.z]); // , -Y0
        mat = mat.concat([0, 0, 0, 0,  0, 0, 0, 0,   cSrc.x, cSrc.y, cSrc.z, 1,  -cDst.z * cSrc.x, -cDst.z * cSrc.y, -cDst.z * cSrc.z]); // , -Z0
    }

    // mat[12 + 0] = [0, 0, 1, 0,  0, 0, 0, 0,   0, 0, 0, 0,  0, 0, cDsts[4].x]; // , -X0
    // mat[12 + 1] = [0, 0, 0, 0,  0, 0, 1, 0,   0, 0, 0, 0,  0, 0, cDsts[4].y]; // , -Y0
    // mat[12 + 2] = [0, 0, 0, 0,  0, 0, 0, 0,   0, 0, 1, 0,  0, 0, cDsts[4].z]; // , -Z0

    // P0,P1,P2,P3 :
    // x0,y0,z0,1,  0, 0, 0, 0,   0, 0, 0, 0,  -X0*x0, -X0*y0, -X0*z0//, -X0
    // 0, 0, 0, 0,  x0,y0,z0,1,   0, 0, 0, 0,  -Y0*x0, -Y0*y0, -Y0*z0//, -Y0
    // 0, 0, 0, 0,  0, 0, 0, 0,   x0,y0,z0,1,  -Z0*x0, -Z0*y0, -Z0*z0//, -Z0


    // 0, 0, 1, 0,  0, 0, 0, 0,   0, 0, 0, 0,  0, 0, -X4//, 0
    // 0, 0, 0, 0,  0, 0, 1, 0,   0, 0, 0, 0,  0, 0, -Y4//, 0
    // 0, 0, 0, 0,  0, 0, 0, 0,   0, 0, 1, 0,  0, 0, -Z4//, 0

    // x0,y0,z0,w0,  0, 0, 0, 0,   0, 0, 0, 0,  -X0*x0, -X0*y0, -X0*z0//, -X0*w0
    // 0, 0, 0, 0,  x0,y0,z0,w0,   0, 0, 0, 0,  -Y0*x0, -Y0*y0, -Y0*z0//, -Y0*w0
    // 0, 0, 0, 0,  0, 0, 0, 0,   x0,y0,z0,w0,  -Z0*x0, -Z0*y0, -Z0*z0//, -Z0*w0


    // const matA = [r1, r2, r3, r4, r5, r6, r7, r8];

    const matA = mat;
    console.log('matA', matA);
    // const matB = cDsts; // X0,Y0,Z0, X1,Y1,Z1, X2,Y2,Z2, X3,Y3,Z3, 0,0,0
    const matB = cDsts.map(a => a.toArray()).flat(); // .slice(0, -3).concat([0, 0, 0]);
    // let matC;
    try {
        const matC = numeric.inv(numeric.dotMMsmall(numeric.transpose(matA), matA));
        const matD = numeric.dotMMsmall(matC, numeric.transpose(matA));
        const matX = numeric.dotMV(matD, matB);
        // console.log('matX', matX.map(a => Math.round(a * 6) / 6));

        // matX = matX.map(a => Math.round(a * 6) / 6);
        const res = numeric.dotMV(matA, matX);
        // console.log('res', res);
        matX[15] = 1;

        const H = new Matrix4().fromArray(matX).transpose();
        return H;
    } catch (e) {
        return new Matrix4().fromArray([1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1]);
    }
}

const srcs = [
    new Coordinates('EPSG:4326', 4.00005, 44.00008, 0),
    new Coordinates('EPSG:4326', 4.00006, 44.00008, 0),
    new Coordinates('EPSG:4326', 4.00006, 44.00009, 0),
    new Coordinates('EPSG:4326', 4.00005, 44.00009, 0),
    new Coordinates('EPSG:4326', 4.00005, 44.00008, 10),
    new Coordinates('EPSG:4326', 4.00006, 44.00008, 10),
    new Coordinates('EPSG:4326', 4.00006, 44.00009, 10),
    new Coordinates('EPSG:4326', 4.00005, 44.00009, 10),
].map(a => a.as('EPSG:2154'));

const srcs_map = srcs.map(c => c.clone().setFromValues(c.x - srcs[0].x, c.y - srcs[0].y, c.z - srcs[0].z));
// const srcs = [
//     new Coordinates('EPSG:4326', 0, 0, 3),
//     new Coordinates('EPSG:4326', 1, 0, 0),
//     new Coordinates('EPSG:4326', 0, 1, 5),
//     new Coordinates('EPSG:4326', 1, 2, 7),
//     new Coordinates('EPSG:4326', 0.5, 0.5, 1)];

// const dsts = [
//     new Coordinates('EPSG:4326', 1, 2, 2),
//     new Coordinates('EPSG:4326', 0, 1, 0),
//     new Coordinates('EPSG:4326', 1, 0, 4),
//     new Coordinates('EPSG:4326', 2, 3, 0),
//     new Coordinates('EPSG:4326', 1, 1, 1)];

const dsts = srcs.map(a => a.as('EPSG:4978'));
const dsts_map = dsts.map(c => c.clone().setFromValues(c.x - dsts[0].x, c.y - dsts[0].y, c.z - dsts[0].z));


// const hMat = calculateHomography3D(srcs, dsts);
const hMat = calculateHomography3D(srcs_map, dsts_map);

const hCoords = srcs_map.map(a => a.clone().applyMatrix4(hMat));

console.log('dsts', dsts_map.map(a => a.toArray()));
console.log('hCoords', hCoords.map(a => a.toArray()));

export default calculateHomography3D;

