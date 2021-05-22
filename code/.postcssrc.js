// https://github.com/michael-ciniawsky/postcss-load-config
// 用于兼容各种各样的浏览器的配置
module.exports = {
    "plugins": {
      // to edit target browsers: use "browserlist" field in package.json
      // https://github.com/ai/browserslist#config-file
      "autoprefixer": {
        browsers: ['defaults', 'ios >= 6.0']
      }
    }
}
