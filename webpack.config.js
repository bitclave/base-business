const Path = require('path');

module.exports = {
    entry: './src/Business.ts',
    devtool: 'source-map',
    mode: 'none',
    node: {
        fs: 'empty',
        child_process: 'empty'
    },
    target: 'node',
    module: {
        rules: [
            {
                test: /\.ts(x?)$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        modules: [Path.resolve('./node_modules'), Path.resolve('./src')],
        extensions: ['.tsx', '.ts', '.js']
    },
    output: {
        filename: 'Business.js',
        path: Path.resolve(__dirname, 'build')
    },
    plugins: []
};
