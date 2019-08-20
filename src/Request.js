module.exports = class Request {

    constructor(cookies) {
        this.status = 200
        this.statusMessage = ''
        this.cookies = cookies || {}
        this.defaultHeaders = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36',
            'Accept-Encoding': 'gzip, deflate',
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        }
    }

    getCookies(url_) {
        let old = this.cookies[require('url').parse(url_).host]
        if (old) { return old.join('; ') }
        return ';'
    }

    saveCookie(headers, host) {
        if (!headers["set-cookie"]) return
        let old = this.cookies[host] || []
        headers["set-cookie"].map(o => o.split(';')[0].trim()).forEach(o => { old.push(o) });
        let map = {}, arr = this.cookies[host] = []
        old.map((o) => o.split('=')).forEach(o => map[o[0]] = o[1].trim())
        for (const k in map) { arr.push(`${k}=${map[k]}`) }
    }

    get(url, headers) { return this.request("GET", url, headers) }

    post(url, headers, data) { return this.request("POST", url, headers, data) }

    put(url, headers, data) { return this.request("PUT", url, headers, data) }

    request(method, url, headers, data) {
        return new Promise((resolve, reject) => {
            let options = require('url').parse(url)
            // @ts-ignore
            options.method = method
            // @ts-ignore
            options.headers = Object.assign({}, this.defaultHeaders, { 'Cookie': this.getCookies(url) }, headers)
            let req = require(url.split(':')[0]).request(options, (res) => {
                this.statusCode = res.statusCode
                this.statusMessage = res.statusMessage
                console.log('STATUS:' + res.statusCode);
                this.saveCookie(res.headers, options.host)
                let isGzip = res.headers['content-encoding'] == 'gzip'
                if (!isGzip) { res.setEncoding('utf-8') }
                let decodeGzip = () => require('zlib').gunzipSync(Buffer.concat(buffer)).toString()
                let buffer = []
                res.on('data', (chunk) => { buffer.push(chunk) })
                res.on('end', () => { isGzip ? resolve(decodeGzip()) : resolve(buffer.join('')) })
            })
            req.on('error', (e) => {
                console.error('request error!!!', e);
                reject(e)
            })
            if (data) { req.write(data) }
            req.end()
        })
    }
}