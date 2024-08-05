import { UniformsGroup /* , Uniform, Color */ } from 'three';

const defaultValues = {
    opacity: 1.0,
    visible: true,
};

class UniformsGroupLayer extends UniformsGroup {
    constructor(layer, interfaceLayer) {
        super();
        console.log(defaultValues, layer, interfaceLayer);
    }
}

class UniformsGroupGeometryLayer extends UniformsGroupLayer {
    constructor() {
        super();
        console.log(defaultValues);
    }
}

class UniformsGroupRasterLayer extends UniformsGroupLayer {
    constructor() {
        super();
        console.log(defaultValues);
    }
}

export default UniformsGroupLayer;
