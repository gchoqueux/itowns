import color_layers_pars_fragment from './Chunk/color_layers_pars_fragment.glsl';
import elevation_pars_vertex from './Chunk/elevation_pars_vertex.glsl';
import elevation_vertex from './Chunk/elevation_vertex.glsl';
import fog_fragment from './Chunk/fog_fragment.glsl';
import fog_pars_fragment from './Chunk/fog_pars_fragment.glsl';
import lighting_fragment from './Chunk/lighting_fragment.glsl';
import lighting_pars_fragment from './Chunk/lighting_pars_fragment.glsl';
import mode_pars_fragment from './Chunk/mode_pars_fragment.glsl';
import mode_depth_fragment from './Chunk/mode_depth_fragment.glsl';
import mode_id_fragment from './Chunk/mode_id_fragment.glsl';
import overlay_fragment from './Chunk/overlay_fragment.glsl';
import overlay_pars_fragment from './Chunk/overlay_pars_fragment.glsl';
import pitUV from './Chunk/pitUV.glsl';
import precision_qualifier from './Chunk/PrecisionQualifier.glsl';
import project_pars_vertex from './Chunk/project_pars_vertex.glsl';

const ShaderChunk = {
    color_layers_pars_fragment,
    elevation_pars_vertex,
    elevation_vertex,
    fog_fragment,
    fog_pars_fragment,
    lighting_fragment,
    lighting_pars_fragment,
    mode_depth_fragment,
    mode_id_fragment,
    mode_pars_fragment,
    overlay_fragment,
    overlay_pars_fragment,
    pitUV,
    precision_qualifier,
    project_pars_vertex,
};

ShaderChunk.install = function install(target, path) {
    if (!path) return Object.assign(target, this);
    Object.keys(this).forEach((key) => {
        target[path + key] = this[key];
    });
};

export default ShaderChunk;
