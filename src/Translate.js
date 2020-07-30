const CodecUtil = require('./CodecUtil');

module.exports = class Translate {
    static async translate(iks, lang, text) {
        return translateBaidu(iks, lang, text)
    }
}

/*
  百度翻译
*/
function translateBaidu(iks, lang, textString) {
    return new Promise((resolve) => {
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
            resolve(textString)
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
            res.on('data', (d) => { buffer.push(d) });
            res.on('end', async () => {
                var result = JSON.parse(Buffer.concat(buffer).toString('utf-8'))
                if (result.error_code) {
                    let e = new Error(`${result.error_msg}\n${JSON.stringify(result)}`)
                    resolve(e.message + '\n\n' + e.stack)
                } else {
                    let map = {}
                    for (const item of result.trans_result) {
                        map[item.src] = await CodecUtil.decodeNative(item.dst)
                    }
                    resolve(textString.split('\n').map((item) => {
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
            resolve(e.message + '\n\n' + e.stack)
        });
        req.write(postData);
        req.end();
    })

}
