const path = require('path');

module.exports = {
    // Source files
    src: path.resolve(__dirname, 'src'),

    // Production build files
    build: path.resolve(__dirname, 'dist'),

    // Static files that get copied to build folder
    utils: path.resolve(__dirname, 'utils'),

    test: path.resolve(__dirname, 'test'),

    debug: path.resolve(__dirname, 'debug'),
};
