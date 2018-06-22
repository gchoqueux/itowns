import precision_qualifier from './Chunk/PrecisionQualifier.glsl';
import project_pars_vertex from './Chunk/project_pars_vertex.glsl';
import elevation_pars_vertex from './Chunk/elevation_pars_vertex.glsl';
import elevation_vertex from './Chunk/elevation_vertex.glsl';
import fog_pars_fragment from './Chunk/fog_pars_fragment.glsl';
import fog_fragment from './Chunk/fog_fragment.glsl';
import pitUV from './Chunk/pitUV.glsl';

const ShaderChunk = {};
ShaderChunk['itowns.precision_qualifier'] = precision_qualifier;
ShaderChunk['itowns.project_pars_vertex'] = project_pars_vertex;
ShaderChunk['itowns.elevation_pars_vertex'] = elevation_pars_vertex;
ShaderChunk['itowns.elevation_vertex'] = elevation_vertex;
ShaderChunk['itowns.fog_pars_fragment'] = fog_pars_fragment;
ShaderChunk['itowns.fog_fragment'] = fog_fragment;
ShaderChunk['itowns.pitUV'] = pitUV;

export default ShaderChunk;
