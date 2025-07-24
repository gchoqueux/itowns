import { Vector2, Vector3, Vector4, Matrix4 } from 'three';
import { textureMatrix } from 'photogrammetric-camera';
import PointsMaterial from 'Renderer/PointsMaterial';
import CommonMaterial from 'Renderer/CommonMaterial';

class ProjectingTexturePointsMaterial extends PointsMaterial {
    constructor(options) {
        const map = options.map;
        delete options.map;

        super(options);

        this.defines.USE_PROJECTIVE_TEXTURING = '';
        this.map = map;

        const textureCameraPosition = new Vector3();
        const textureCameraPreTransform = new Matrix4();
        const textureCameraPostTransform = new Matrix4();
        const uvDistortion = { R: new Vector4(), C: new Vector3() };
        const depthMap = null;

        CommonMaterial.setUniformProperty(this, 'textureCameraPosition', textureCameraPosition);
        CommonMaterial.setUniformProperty(this, 'textureCameraPreTransform', textureCameraPreTransform);
        CommonMaterial.setUniformProperty(this, 'textureCameraPostTransform', textureCameraPostTransform);
        CommonMaterial.setUniformProperty(this, 'uvDistortion', uvDistortion);
        CommonMaterial.setUniformProperty(this, 'depthMap', depthMap);
    }

    setCamera(camera) {
        camera.getWorldPosition(this.textureCameraPosition);
        this.textureCameraPreTransform.copy(camera.matrixWorldInverse);
        this.textureCameraPreTransform.setPosition(0, 0, 0);
        this.textureCameraPreTransform.premultiply(camera.preProjectionMatrix);
        this.textureCameraPostTransform.copy(camera.postProjectionMatrix);
        this.textureCameraPostTransform.premultiply(textureMatrix);

        if (camera.distos && camera.distos.length == 1 && camera.distos[0].isRadialDistortion) {
            this.uvDistortion = camera.distos[0];
        } else {
            this.uvDistortion = { C: new Vector2(), R: new Vector4() };
            this.uvDistortion.R.w = Infinity;
        }
    }
}

export default ProjectingTexturePointsMaterial;
