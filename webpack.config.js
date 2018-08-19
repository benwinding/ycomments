const LiveReloadPlugin = require('webpack-livereload-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const webpack = require("webpack");

const devMode = process.env.NODE_ENV !== 'production'
const version = process.env.npm_package_version;
console.log("devMode:", devMode)

const rulesDev = [
  {
    test: /\.(sa|sc|c)ss$/,
    use: [
      MiniCssExtractPlugin.loader,
      'css-loader',
    ],
  },{
    test: /\.(svg)$/,
    loader: 'raw-loader'
  }
]

const rulesProd = [
  {
    test: /\.(css|json|svg)$/,
    use: 'raw-loader'
  },{
    test: /\.(json)$/,
    loader: 'ignore-loader'
  }
]

let plugins = [
  new LiveReloadPlugin(),
  new MiniCssExtractPlugin({
    filename: '[name].css',
    chunkFilename: '[id].css',
  })
]

if (!devMode) {
  plugins.push(
    new webpack.IgnorePlugin(/sample\.json/)
  )
}

module.exports = {
  entry: './src/main.js',
  output: {
    filename: `./rahn-${version}.min.js`,
    filename: `./rahn.min.js`,
  },  
  devtool: devMode ? 'source-map' : false,
  plugins: plugins,
  module: {
    rules: devMode ? rulesDev : rulesProd
  },
  mode: devMode ? 'development' : 'production'
};
