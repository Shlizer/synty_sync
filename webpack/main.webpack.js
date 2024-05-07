module.exports = {
  resolve: {
    extensions: ['.ts', '.js']
  },
  entry: './src/back/index.ts',
  module: {
    rules: require('./rules.webpack'),
  }
}