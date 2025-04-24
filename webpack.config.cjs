const path = require('path');
const ESLintPlugin = require('eslint-webpack-plugin');

const mode = process.env.NODE_ENV;
const noInline = process.env.noInline;
const debugBuild = mode === 'development';

// For each file, this config is merged with its local babel configuration.
// See https://babeljs.io/docs/configuration#how-babel-merges-config-items
const babelConf = {
    rootMode: 'upward',
    plugins: [
        ['minify-replace', {
            replacements: [{
                identifierName: '__DEBUG__',
                replacement: {
                    type: 'booleanLiteral',
                    value: debugBuild,
                },
            }],
        }],
    ],
};

const include = [
    path.resolve(__dirname, 'packages/Geographic/src'),
    path.resolve(__dirname, 'packages/Main/src'),
    path.resolve(__dirname, 'packages/Debug/src'),
    path.resolve(__dirname, 'packages/Widgets/src'),
];

const exclude = [
    path.resolve(__dirname, '.git'),
    path.resolve(__dirname, 'node_modules'),
];

module.exports = () => {
    const babelLoaderOptions = [];
    if (!noInline) {
        babelLoaderOptions.push('babel-inline-import-loader');
    }
    babelLoaderOptions.push({
        loader: 'babel-loader',
        options: babelConf,
    });

    const config = (format) => {
        const isESM = format === 'esm';

        const output = {
            path: path.resolve(__dirname, 'dist'),
        };

        if (isESM) {
            output.filename = '[name].esm.js';
            output.libraryTarget = 'module';
        } else {
            output.filename = '[name].umd.js';
            output.libraryTarget = 'umd';
            output.umdNamedDefine = true;
        }

        const cfg = {
            mode,
            context: path.resolve(__dirname),
            resolve: {
                extensions: ['.ts', '.js'],
                extensionAlias: {
                    '.js': ['.ts', '.js'],
                },
                alias: {
                    itowns: path.resolve(__dirname, 'packages/Main/src/Main.js'),
                    '@itowns/geographic': path.resolve(__dirname, 'packages/Geographic/src/Main.js'),
                },
            },
            externals: {
                three: 'three',
            },
            entry: {
                itowns: [
                    'core-js',
                    './packages/Main/src/Main.js',
                ],
                debug: {
                    import: './packages/Debug/src/Main.js',
                    dependOn: 'itowns',
                },
                itowns_widgets: {
                    import: './packages/Widgets/src/Main.js',
                    dependOn: 'itowns',
                },
                itowns_potree2worker: {
                    import: './packages/Main/src/Worker/Potree2Worker.js',
                },
                itowns_lasworker: {
                    import: './packages/Main/src/Worker/LASLoaderWorker.js',
                },
            },
            devtool: 'source-map',
            output,
            module: {
                rules: [
                    {
                        test: /\.(js|ts)$/,
                        exclude,
                        include,
                        use: babelLoaderOptions,
                    },
                ],
            },
            plugins: [
                new ESLintPlugin({
                    files: include,
                }),
            ],
            devServer: {
                devMiddleware: {
                    publicPath: '/dist/',
                },
                static: {
                    directory: path.resolve(__dirname, './'),
                    watch: {
                        ignored: exclude,
                    },
                },
                client: {
                    overlay: {
                        errors: true,
                        runtimeErrors: false,
                        warnings: false,
                    },
                },
            },
        };

        if (isESM) {
            cfg.target = 'es2022';
            cfg.resolve.fallback = {
                os: false,
                fs: false,
                zlib: false,
                http: false,
                tty: false,
                url: false,
                util: false,
                child_process: false,
                module: false,
                // child_process: require.resolve('child_process'),
                // path: require.resolve('path-browserify'),
                // 'https-browserify': require.resolve('https-browserify'),
                // https: require.resolve('https-browserify')
                path: false,
                'https-browserify': false,
                https: false,
                stream: false,
            };
            cfg.resolve.alias['node:module'] = false;
            cfg.experiments = {
                outputModule: isESM,
            };
        }

        return cfg;
    };

    return debugBuild ? config('esm') : [config('umd'), config('esm')];
};
