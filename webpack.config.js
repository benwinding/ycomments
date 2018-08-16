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
      devMode ? {
        test: /\.(sa|sc|c)ss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
        ],
      } : {
        test: /\.(css|json)$/,
        use: 'raw-loader'
      }
    ]
  },
  mode: devMode ? 'development' : 'production'
};
