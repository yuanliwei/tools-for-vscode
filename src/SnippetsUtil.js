module.exports = class SnippetsUtil {
    static async update() {

    }
    static async upload() {

    }
}

class GiteeStorage {
    constructor(gistId) {
        this.gistId = gistId
        this.r = new Request()
    }
    async save(data) {
        await this.r.request(`PATCH`,`https://gitee.com/api/v5/gists/${this.gistId}`, JSON.stringify({
            "access_token": "xxxx",
            "files": { "temp": { "content": data } }, "description": "临时数据"
        }))
    }
    async load() {
        let result = await this.r.request(`https://gitee.com/api/v5/gists/${this.gistId}?access_token=xxxx`)
        return JSON.parse(result).files.temp.content
    }
}

class Request {

    constructor() {
        this.cookies = {}
        this.defaultHeaders = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36',
            'Accept-Encoding': 'text',
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        }
    }

    request(method, url, data) {
        return new Promise((resolve, reject) => {
            let options = require('url').parse(url)
            options['method'] = method
            options['headers'] = Object.assign({}, this.defaultHeaders)
            let req = require(url.split(':')[0]).request(options, (res) => {
                this.statusCode = res.statusCode
                this.statusMessage = res.statusMessage
                console.log('STATUS:' + res.statusCode);
                res.setEncoding('utf-8')
                let buffer = []
                res.on('data', (chunk) => { buffer.push(chunk) })
                res.on('end', () => { resolve(buffer.join('')) })
            })
            req.on('error', (e) => {
                console.error('request error!!!', e);
                reject(e)
            })
            if (data) { req.write(data) }
            req.end()
        });
    }
}