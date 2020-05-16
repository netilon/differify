const path = require('path');

module.exports = {
  entry: path.join(__dirname, 'src', 'differify'),
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'index.js',
    library: 'Differify',
    libraryExport: 'default',
    libraryTarget: 'umd',
    globalObject: 'this',
  },
  mode: 'production',
  module: {
    rules: [
      {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env'],
        },
      },
    ],
  },
};
