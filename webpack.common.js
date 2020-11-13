const fs = require('fs');
// eslint-disable-next-line import/no-unresolved
const path = require('path');
const paths = require('./paths');

const include = [
    path.resolve(__dirname, 'src'),
    path.resolve(__dirname, 'test'),
    path.resolve(__dirname, 'utils'),
];

const mode = process.env.NODE_ENV || 'production';
const debugBuild = mode === 'development';

/*
   configuring babel:
   - when babel runs alone (for `test-unit` for instance), we let him deal with
   ES6 modules, because node doesn't support them yet (planned for v10 lts).
   - however, webpack also has ES6 module support and these 2 don't play well
   together. When running webpack (either `build` or `start` script), we prefer
   to rely on webpack loaders (much more powerful and gives more possibilities),
   so let's disable modules for babel here.
   - we also dynamise the value of __DEBUG__ according to the env var
*/
// Note that we don't support .babelrc in parent folders
var babelrc = fs.readFileSync(path.resolve(__dirname, '.babelrc'));
var babelConf = JSON.parse(babelrc);
var newPresets = [];
for (var preset of babelConf.presets) {
    if (!Array.isArray(preset)) {
        preset = [preset];
    }
    // preset.push({ modules: false });
    newPresets.push(preset);
}

babelConf.presets = newPresets;
babelConf.babelrc = false; // disabel babelrc reading, as we've just done it
const replacementPluginConf = babelConf.plugins.find(plugin => Array.isArray(plugin) && plugin[0] === 'minify-replace');
replacementPluginConf[1].replacements.find(decl => decl.identifierName === '__DEBUG__').replacement.value = debugBuild;

const babelLoaderOptions = [];
// if (!(env && env.noInline)) {
//     babelLoaderOptions.push('babel-inline-import-loader');
// }
babelLoaderOptions.push({
    loader: 'babel-loader',
    options: babelConf,
});

// babelConf.plugins.push(['module-resolver',  { root: [paths.src] }]);
module.exports = {
    context: path.resolve(__dirname),
    // Where webpack looks to start building the bundle
    resolve: {
        modules: [paths.src, 'node_modules'],
    },
    entry: {
        itowns: {
            import: ['@babel/polyfill', 'url-polyfill', 'whatwg-fetch', `${paths.src}/MainBundle.js`],
        },
        debug: {
            import: `${paths.utils}/debug/Main.js`,
            dependOn: 'itowns',
        },
    },

    // Where webpack outputs the assets and bundles
    output: {
        path: paths.build,
        filename: '[name].js',
        library: '[name]',
        libraryTarget: 'umd',
        umdNamedDefine: true,
    },
    // Determine how modules within the project are treated
    module: {
        rules: [
            {
                test: /\.js$/,
                enforce: 'pre',
                include,
                loader: 'eslint-loader',
            },
            {
                test: /\.js$/,
                include,
                use: babelLoaderOptions,
            },
        ],
    },
};

