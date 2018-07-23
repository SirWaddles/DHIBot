const webpack = require('webpack');
const path = require('path');

module.exports = {
    mode: 'development',
    entry: './index.js',
    output: {
        filename: 'build.js',
        path: path.resolve(__dirname, 'build/'),
    },
    target: 'node',
    resolve: {
        extensions: ['.js', '.json'],
    },
};
