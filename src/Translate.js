const crypto = require('crypto')
/** @type{import('node-fetch').default} */
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const CodecUtil = require('./CodecUtil')

module.exports = class Translate {
    static async translate(iks, lang, text) {
        return translateBaidu(iks, lang, text)
    }
}

/*
  百度翻译
*/
async function translateBaidu(iks, lang, textString) {
    let MD5 = (text) => {
        const hash = crypto.createHash('md5')
        hash.update(text)
        return hash.digest('hex')
    }

    let appid = iks[0]
    let key = iks[1]
    let salt = Date.now()
    let matches = textString.split('\n').map((item) => {
        return item.trim()
    }).filter((item) => {
        return item.length > 0
    })
    if (!matches) {
        return textString
    }
    console.log('translate words:' + matches.length)
    let query = matches.join('\n')
    let from = 'auto'
    let to = lang
    let str1 = appid + query + salt + key
    let sign = MD5(str1)

    let params = new URLSearchParams()
    params.append('q', query)
    params.append('appid', appid)
    params.append('salt', salt.toFixed(0))
    params.append('from', from)
    params.append('to', to)
    params.append('sign', sign)
    /** @type{Object} */
    let result = await (await fetch(`https://api.fanyi.baidu.com/api/trans/vip/translate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params
    })).json()

    if (result.error_code) {
        let e = new Error(`${result.error_msg}\n${JSON.stringify(result)}`)
        return e.message + '\n\n' + e.stack
    }
    let map = {}
    for (const item of result.trans_result) {
        map[item.src] = await CodecUtil.decodeNative(item.dst)
    }
    return textString.split('\n').map((item) => {
        let k = item.trim()
        let v = map[k]
        if (v) {
            return item.replace(k, v)
        } else {
            return item
        }
    }).join("\n")

}
