/* global Potree */

function doItownsCompliant(potree, logarithmicDepthBuffer) {
    var linesVS = Potree.Shaders['pointcloud.vs'].split('\n');
    var re = linesVS.splice(0, 3);
    linesVS.unshift('#include <logdepthbuf_pars_vertex>');
    linesVS.unshift('#define EPSILON 1e-6');
    linesVS.unshift(re[0], re[1]);
    var l = linesVS.lastIndexOf('}');
    linesVS.splice(l, 0, '#include <logdepthbuf_vertex>');
    Potree.Shaders['pointcloud.vs'] = linesVS.join('\n');

    var linesFS = Potree.Shaders['pointcloud.fs'].split('\n');
    re = linesFS.splice(0, 3);
    linesFS.unshift('#include <logdepthbuf_pars_fragment>');
    linesFS.unshift(re[0], re[1]);
    l = linesFS.lastIndexOf('void main() {');
    linesFS.splice(l + 1, 0, '#include <logdepthbuf_fragment>');
    Potree.Shaders['pointcloud.fs'] = linesFS.join('\n');

    Potree.PointCloudMaterial = class PointCloudMaterial extends Potree.PointCloudMaterial {
        constructor() {
            super();
            if (logarithmicDepthBuffer) {
                this.defines = {
                    USE_LOGDEPTHBUF: 1,
                    USE_LOGDEPTHBUF_EXT: 1,
                };
            } else {
                this.defines = {};
            }
        }
    };
};

