const HtmlWebpackPlugin = require('html-webpack-plugin')
const VueLoaderPlugin = require('vue-loader/lib/plugin');

const webpack = require('webpack')
const path = require('path');

module.exports = {
  mode: 'development',
  entry: [path.resolve(__dirname, './src', 'index.js')],
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: '[name].bundle.js',
    publicPath: '/',
  },
  devtool: 'inline-source-map',
  resolve: {
    alias: {
      'vue': path.join(__dirname, "node_modules/vue/dist/vue.js")
    },
  },
  devServer: {
    historyApiFallback: true,
    contentBase: path.resolve(__dirname, './dist'),
    compress: true,
    hot: true,
    port: 8080,
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'webpack',
      template: path.resolve(__dirname, './src', 'index.html'),
      filename: 'index.html',
    }),
    new VueLoaderPlugin(),
    new webpack.HotModuleReplacementPlugin()
  ],
  module: {
    rules: [
        {
          test: /\.(sc|sa|c)ss$/,
          use: [
              'vue-style-loader',
              'css-loader',
              'sass-loader'
          ]
        },
        { test: /\.vue$/, use: { loader: 'vue-loader'}},
        { 
          test: /\.(jpg|jpeg|png|svg|ico|woff2?|eot|ttf)$/,
                loader: 'file-loader'
        },
        { test: /\.css$/, use: ['vue-style-loader', 'css-loader']},
    ]
  }
}
