const LiveReloadPlugin = require('webpack-livereload-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const devMode = process.env.NODE_ENV !== 'production'

console.log("devMode:", devMode)

module.exports = {
  entry: './src/main.js',
  output: {
    filename: './ycomments.min.js'
  },
  devtool: devMode ? 'source-map' : false,
  plugins: [
    new LiveReloadPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css',
    })
  ],
  module: {
    rules: [
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          devMode ? MiniCssExtractPlugin.loader : 'style-loader',
          'css-loader',
        ],
      }
    ]
  },
  mode: devMode ? 'development' : 'production'
};