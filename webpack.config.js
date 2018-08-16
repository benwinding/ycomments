const LiveReloadPlugin = require('webpack-livereload-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
// const RawLoaderPlugin = require("raw-loader");

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
  ],
  module: {
    rules: [
      {
        test: /\.css$/,
        use: 'raw-loader'
      }
    ]
  },
  mode: devMode ? 'development' : 'production'
};