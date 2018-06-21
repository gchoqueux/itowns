const FINAL = 0;
const DEPTH = 1;
const ID = 2;

function changeState(material, state) {
    if (material === undefined || material.defines === undefined || material.state == state) {
        return;
    }
    delete material.defines.DEPTH_MODE;
    delete material.defines.MATTE_ID_MODE;
    switch (state) {
        case DEPTH:
            material.defines.DEPTH_MODE = 1;
            break;
        case ID:
            material.defines.MATTE_ID_MODE = 1;
            break;
        default:
            break;
    }
    material.state = state;
    material.needsUpdate = true;
}

function pushRenderState(object3d, state) {
    const _state = object3d.state !== undefined ? object3d.state : FINAL;
    if (_state != state) {
        object3d.traverse(n => changeState(n.material, state));
    }
    return (_state === undefined || _state == state) ?
        () => { } :
        () => { object3d.traverse(n => changeState(n.material, _state)); };
}

// state to render
// According to the state rendering, the material's object switches
// to the correct state material
export default {
    // final color
    FINAL,
    // depth buffer
    DEPTH,
    // id object
    ID,

    pushRenderState,
};

