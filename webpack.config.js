const path = require('path');
const TypescriptDeclarationPlugin = require('typescript-declaration-webpack-plugin');

module.exports = {
  entry: path.join(__dirname, 'src', 'differify.ts'),
  output: {
    path: path.join(__dirname),
    filename: 'index.js',
    library: 'Differify',
    libraryExport: 'default',
    libraryTarget: 'umd',
    globalObject: 'this',
    umdNamedDefine: true,
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
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        include: [/src/],
      },
      {
        test: /\.(j|t)s$/,
        loader: 'webpack-comment-remover-loader',
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new TypescriptDeclarationPlugin({
      out: 'index.d.ts',
    }),
  ],
  resolve: {
    extensions: ['.ts', '.js'],
  },
};
