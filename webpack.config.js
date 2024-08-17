'use strict';

const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
/** @typedef {import('webpack').Configuration} WebpackConfig **/

/** @type WebpackConfig */
const extensionConfig = {
  target: 'node', // VS Code extensions run in a Node.js-context 📖 -> https://webpack.js.org/configuration/node/
	mode: 'development', // this leaves the source code as close as possible to the original (when packaging we set this to 'production')
  entry: './src/extension.ts', // the entry point of this extension, 📖 -> https://webpack.js.org/configuration/entry-context/
  output: {
    // the bundle is stored in the 'dist' folder (check package.json), 📖 -> https://webpack.js.org/configuration/output/
    publicPath: 'dist',
    path: path.resolve(__dirname, 'dist'),
    filename: 'extension.js',
    libraryTarget: 'commonjs2'
  },
  externals: {
    vscode: 'commonjs vscode'
  
  },
  resolve: {
    // support reading TypeScript and JavaScript files, 📖 -> https://github.com/TypeStrong/ts-loader
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader'
          }
        ]
      }
    ]
  },
  devtool: 'nosources-source-map',
  infrastructureLogging: {
    level: "log",
  },
};
/** @type WebpackConfig */
const webviewConfig = {
  target: 'web',
  mode: 'development',
  entry: './src/webview/index.tsx',
  output: {
    path: path.resolve(__dirname, 'out', 'webview'),
    filename: 'bundle.js',
    publicPath: 'out/webview/',
  },
  resolve: {
    alias: {
      'src': path.resolve(__dirname, 'src')
    },
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
            'css-loader',
            'postcss-loader'
        ]
    },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
        filename: 'styles/index.css',
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'resources', to: 'resources' }
      ],
    }),
],
  devtool: 'source-map',
};
module.exports = [ extensionConfig,webviewConfig ];