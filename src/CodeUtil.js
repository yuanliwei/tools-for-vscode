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
  static async currentTime() {
    let d = new Date()
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString()
  }
  static async commentAlign(text) {
    var maxLength = 0;
    var lines = text.split('\n');
    lines.forEach(function (item) {
      item = item.replace('//', '#sp#//');
      var items = item.split('#sp#');
      if (items.length == 2) {
        maxLength = Math.max(maxLength, items[0].length);
      }
    });
    var newLines = [];
    var m = /http.?:\/\//;
    lines.forEach(function (item) {
      if (!m.test(item)) {
        item = item.replace('//', '#sp#//');
      }
      var items = item.split('#sp#');
      var newLine = items[0];
      if (items.length == 2) {
        if (items[0].trim().length == 0) {
          newLine += items[1];
        } else {
          var space = maxLength - items[0].length;
          newLine += ' '.repeat(space) + items[1];
        }
      }
      newLines.push(newLine);
    });
    return newLines.join('\n');
  }
}
