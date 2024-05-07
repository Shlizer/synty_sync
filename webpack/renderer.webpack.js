const path = require("path")

module.exports = {
  resolve: {
    alias: {
      "@utils": path.resolve(__dirname, "../src/front/main/utils"),
      "@context": path.resolve(__dirname, "../src/front/main/context"),
      "@overlay": path.resolve(__dirname, "../src/front/main/overlay"),
      "@content": path.resolve(__dirname, "../src/front/main/components/content"),
      "@layout": path.resolve(__dirname, "../src/front/main/components/layout"),
    },
    extensions: ['.ts', '.tsx', '.js']
  },
  module: {
    rules: require('./rules.webpack'),
  },
}