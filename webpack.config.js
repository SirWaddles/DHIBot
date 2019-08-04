const webpack = require('webpack');
const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
    mode: 'development',
    entry: './index.js',
    output: {
        filename: 'build.js',
        path: path.resolve(__dirname, 'build/'),
    },
    target: 'node',
    externals: [nodeExternals()],
    resolve: {
        extensions: ['.js', '.json'],
    },
};
