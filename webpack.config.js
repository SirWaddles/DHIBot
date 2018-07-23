const webpack = require('webpack');
const path = require('path');

module.exports = {
    mode: 'production',
    entry: './index.js',
    output: {
        filename: 'build.js',
        path: path.resolve(__dirname, 'build/'),
    },
    target: 'node',
};
