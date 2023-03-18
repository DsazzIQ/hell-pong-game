const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = (env, argv) => {
    const isProduction = argv.mode === 'production';

    return {
        mode: isProduction ? 'production' : 'development',
        entry: './src/index.ts',
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: 'bundle.js',
            publicPath: '/',
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: [
                                '@babel/preset-env',
                                '@babel/preset-typescript'
                            ]
                        }
                    }
                },
            ],
        },
        resolve: {
            extensions: ['.tsx', '.ts', '.js']
        },
        plugins: [
            new CleanWebpackPlugin(),
            new CopyWebpackPlugin({
                patterns: [
                    { from: 'assets', to: 'assets' },
                ],
            }),
            new HtmlWebpackPlugin({
                template: 'src/index.html',
            }),
        ],
        devtool: isProduction ? 'source-map' : 'inline-source-map',
    };
};