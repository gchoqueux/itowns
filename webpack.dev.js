const webpack = require('webpack');
const path = require('path');
const { merge } = require('webpack-merge');
const paths = require('./paths');
const common = require('./webpack.common.js');

module.exports = merge(common, {
    // Set the mode to development or production
    mode: 'development',

    // Control how source maps are generated
    devtool: 'inline-source-map',
    // inline-source-map

    // Spin up a server for quick development
    // devServer: {
    //     // historyApiFallback: true,
    //     // contentBase: paths.build,
    //     // publicPath: paths.build,
    //     publicPath: path.resolve(__dirname, './dist'),
    //     contentBase: path.resolve(__dirname, './'),
    //     // contentBase: path.resolve(__dirname),
    //     open: true,
    //     compress: true,
    //     // hot: true,
    //     port: 8080,
    //     // inline: true,
    //     watchContentBase: true,
    // },

    // plugins: [
    //     // Only update what has changed on hot reload
    //     new webpack.HotModuleReplacementPlugin(),
    // ],
});
