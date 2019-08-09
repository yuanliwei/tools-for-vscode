module.exports = class EncodeUtil {
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
    return new Buffer(text, 'utf-8').toString('hex');
  }
  static async encodeHtml(text) {
    const he = require('he');
    return he.encode(text)
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
    return new Buffer(text, 'hex').toString('utf8');
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
    const coffee = require('coffee-script')
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

  static async translate(iks, lang, text) {
    return new Promise((resolve, reject) => {
      translate(iks, lang, text, (err, output) => {
        if (err) {
          console.error(err);
          reject(err)
        } else {
          resolve(output)
        }
      })
    })
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

/*
  百度翻译
*/
var translate = (iks, lang, textString, callback) => {
  const querystring = require('querystring');
  const http = require('http');

  var MD5 = (text) => {
    const crypto = require('crypto');
    const hash = crypto.createHash('md5');
    hash.update(text)
    return hash.digest('hex')
  }

  var appid = iks[0];
  var key = iks[1];
  var salt = Date.now();
  var matches = textString.split('\n').map((item) => {
    return item.trim()
  }).filter((item) => {
    return item.length > 0
  })
  if (!matches) {
    callback(null, textString)
    return
  }
  console.log('translate words:' + matches.length);
  var query = matches.join('\n');
  var from = 'auto';
  var to = lang;
  var str1 = appid + query + salt + key;
  var sign = MD5(str1);

  var postData = querystring.stringify({
    q: query,
    appid: appid,
    salt: salt,
    from: from,
    to: to,
    sign: sign
  })

  const options = {
    hostname: 'api.fanyi.baidu.com',
    port: 80,
    path: '/api/trans/vip/translate',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData)
    }
  }

  const req = http.request(options, (res) => {
    var buffer = []
    res.on('data', (d) => {
      buffer.push(d)
    });
    res.on('end', () => {
      var result = JSON.parse(Buffer.concat(buffer).toString('utf-8'))
      if (result.error_code) {
        callback(new Error(`${result.error_msg}\n${JSON.stringify(result)}`))
      } else {
        let map = {}
        result.trans_result.forEach((item) => {
          map[item.src] = ascii2native(item.dst)
        })
        callback(null, textString.split('\n').map((item) => {
          let k = item.trim()
          let v = map[k]
          if (v) {
            return item.replace(k, v);
          } else {
            return item
          }
        }).join("\n"))
      }
    });
  });
  req.on('error', (e) => {
    console.error(e);
    callback(e)
  });
  req.write(postData);
  req.end();

}
