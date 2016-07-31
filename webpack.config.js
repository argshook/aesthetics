const webpack = require('webpack');

module.exports = {
  entry: {
    bundle: './src/index.js'
  },

  output: {
    path: '.',
    filename: '[name].min.js',
    publichPath: '/'
  },

  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: ['node_modules'],
        loader: 'babel-loader',
        query: {
          presets: ['es2015']
        }
      }
    ]
  },

  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ],

  devServer: {
    inline: true,
    hot: true,
    stats: {
      colors: true
    }
  }
};

