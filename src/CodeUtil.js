const vkbeautify = require('vkbeautify');

module.exports = class CodeUtil {
  static async formatJSON(text) {
    return vkbeautify.json(text)
  }
  static async formatXML(text) {
    return vkbeautify.xml(text)
  }
  static async formatCSS(text) {
    return vkbeautify.css(text)
  }
  static async formatSQL(text) {
    return vkbeautify.sql(text)
  }
  static async formatJS(text) {
    const js_beautify = require('js-beautify');
    return js_beautify(text)
  }
  static async minJSON(text) {
    return vkbeautify.jsonmin(text)
  }
  static async minXML(text) {
    return vkbeautify.xmlmin(text)
  }
  static async minCSS(text) {
    return vkbeautify.cssmin(text)
  }
  static async minSQL(text) {
    return vkbeautify.sqlmin(text)
  }
}
