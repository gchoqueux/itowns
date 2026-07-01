// default values
let logDepthBufferSupported = false;
let maxTexturesUnits = 16;    // WebGPU minimum spec guarantee
let maxTextureSize = 8192;    // WebGPU minimum spec guarantee

export default {
    isLogDepthBufferSupported() {
        return logDepthBufferSupported;
    },
    getMaxTextureUnitsCount() {
        return maxTexturesUnits;
    },
    getMaxTextureSize() {
        return maxTextureSize;
    },
    updateCapabilities(renderer) {
        // Try WebGPU path first (no WebGL context exposed)
        const backend = renderer.backend;
        if (backend?.isWebGPUBackend) {
            const device = backend.device;
            if (device) {
                maxTexturesUnits = device.limits?.maxSampledTexturesPerShaderStage ?? 16;
                maxTextureSize = device.limits?.maxTextureDimension2D ?? 8192;
            }
            // WebGPU always has better depth precision — treat log depth as supported
            logDepthBufferSupported = renderer.capabilities?.logarithmicDepthBuffer ?? true;
            return;
        }

        // WebGL fallback path
        const gl = renderer.getContext?.();
        if (gl) {
            maxTexturesUnits = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
            maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
        }
        logDepthBufferSupported = renderer.capabilities?.logarithmicDepthBuffer ?? false;
    },
};
