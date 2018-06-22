import precision_qualifier from './Chunk/PrecisionQualifier.glsl';
import project_pars_vertex from './Chunk/project_pars_vertex.glsl';
import elevation_pars_vertex from './Chunk/elevation_pars_vertex.glsl';
import elevation_vertex from './Chunk/elevation_vertex.glsl';
import fog_pars_fragment from './Chunk/fog_pars_fragment.glsl';
import fog_fragment from './Chunk/fog_fragment.glsl';
import pitUV from './Chunk/pitUV.glsl';

const ShaderChunk = {
    precision_qualifier,
    project_pars_vertex,
    elevation_pars_vertex,
    elevation_vertex,
    fog_pars_fragment,
    fog_fragment,
    pitUV,
};

ShaderChunk.install = function install(target, path) {
    if (!path) return Object.assign(target, this);
    Object.keys(this).forEach((key) => {
        target[path + key] = this[key];
    });
};

export default ShaderChunk;
