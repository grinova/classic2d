const path = require('path');

const buildDir = path.resolve(__dirname, 'build');
const srcDir = path.resolve(__dirname, 'src');

module.exports = {
  entry: './src/sandbox/index.ts',
  output: {
    filename: 'bundle.js',
    path: buildDir
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
    modules: [srcDir, 'node_modules']
  }
};
