module.exports = class CodecUtil {
  static async parseJSON(text) {
    return JSON.parse(text)
  }
  static async stringify(text) {
    return JSON.stringify(text)
  }
  static async encodeUri(text) {
    return encodeURIComponent(text)
  }
  static async encodeBase64(text) {
    return Buffer.from(text).toString('base64')
  }
  static async encodeHex(text) {
    return Buffer.from(text, 'utf-8').toString('hex');
  }
  static async encodeHtml(text) {
    const he = require('he');
    return he.encode(text)
  }
  static async escapeSimple(text) {
    const he = require('he');
    return he.escape(text)
  }
  static async escapeWithcrlf(text) {
    const he = require('he');
    return he.escape(text).replace(/\r/g, '&#13;').replace(/\n/g, '&#10;')
  }
  static async encodeNative(text) {
    return native2ascii(text)
  }
  static async encodeUnicode(text) {
    return toUnicode(text)
  }
  static async encodeEscape(text) {
    return escape(text)
  }

  static async decodeUri(text) {
    return decodeURIComponent(text)
  }
  static async decodeBase64(text) {
    return Buffer.from(text, 'base64').toString('utf-8')
  }
  static async decodeHex(text) {
    return Buffer.from(text, 'hex').toString('utf8');
  }
  static async decodeHtml(text) {
    const he = require('he');
    return he.decode(text)
  }
  static async decodeNative(text) {
    return ascii2native(text)
  }
  static async decodeUnicode(text) {
    return fromUnicode(text)
  }
  static async decodeUnescape(text) {
    return unescape(text)
  }

  static async decodeCoffee(text) {
    const coffee = require('coffeescript')
    return coffee.compile(text, { bare: true })
  }

  static async decodeLess(text) {
    return new Promise((resolve, reject) => {
      const less = require('less')
      less.render(text, (err, output) => {
        if (err) {
          console.error(err);
          reject(err)
        } else {
          resolve(output.css)
        }
      })
    })
  }

  static async markdownToHtml(text) {
    return require('markdown-it')({
      html: true,
      linkify: true,
      typographer: true
    }).render(text)
  }
}

/*
 * ascii2native
 */
var ascii2native = function (ascii) {
  var code, i, j, len, native1, words;
  words = ascii.split('\\u');
  native1 = words[0];
  for (i = j = 0, len = words.length; j < len; i = ++j) {
    code = words[i];
    if (!(i !== 0)) {
      continue;
    }
    native1 += String.fromCharCode(parseInt("0x" + (code.substr(0, 4))));
    if (code.length > 4) {
      native1 += code.substr(4, code.length);
    }
  }
  return native1;
};

/*
 * native2ascii
 */
var native2ascii = function (native_) {
  var ascii, charAscii, chars, code, i, j, len;
  chars = native_.split('');
  ascii = '';
  for (i = j = 0, len = chars.length; j < len; i = ++j) {
    code = Number(chars[i].charCodeAt(0));
    if (code > 127) {
      charAscii = code.toString(16);
      charAscii = new String('0000').substr(charAscii.length, 4) + charAscii;
      ascii += '\\u' + charAscii;
    } else {
      ascii += chars[i];
    }
  }
  return ascii;
};

var toUnicode = function (str) {
  var codes = []
  for (var i = 0; i < str.length; i++) {
    codes.push(("000" + str.charCodeAt(i).toString(16)).slice(-4))
  }
  return "\\u" + codes.join("\\u");
}

var fromUnicode = function (str) {
  return unescape(str.replace(/\\/g, "%"));
}
