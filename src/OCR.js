const vscode = require('vscode')
const os = require('os')
const path = require('path')
const crypto = require('crypto')
const fs = require('fs')
/** @type{import('node-fetch').default} */
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args))
const { spawn } = require('child_process')
module.exports = class OCR {
    static async pasteImage(iks) {
        if (!iks) return
        return vscode.window.withProgress({ location: vscode.ProgressLocation.Window, title: 'pasteImage...' }, async () => {
            let imagePath = path.join(os.tmpdir(), `pasteImg-${Date.now()}.png`)
            let resultImgPath = await saveClipboardImageToFileAndGetPath(imagePath)
            if (!fs.existsSync(resultImgPath)) { return }
            let text = await fetchImgTextByOCR(iks, resultImgPath)
            return text
        })
    }
}

async function fetchImgTextByOCR([appId, appKey], imagePath) {

    let base64 = fs.readFileSync(imagePath).toString('base64')

    function sha256(message, secret = '', encoding) {
        const hmac = crypto.createHmac('sha256', secret)
        return hmac.update(message).digest(encoding)
    }

    function getHash(message) {
        const hash = crypto.createHash('sha256')
        return hash.update(message).digest('hex')
    }

    function getDate(timestamp) {
        const date = new Date(timestamp * 1000)
        const year = date.getUTCFullYear()
        const month = ('0' + (date.getUTCMonth() + 1)).slice(-2)
        const day = ('0' + date.getUTCDate()).slice(-2)
        return `${year}-${month}-${day}`
    }

    // 密钥参数
    const SECRET_ID = appId
    const SECRET_KEY = appKey

    // https://cloud.tencent.com/document/api/866/33526
    const endpoint = "ocr.tencentcloudapi.com"
    const service = "ocr"
    const region = "ap-guangzhou"
    const action = "GeneralBasicOCR"
    const version = "2018-11-19"

    const timestamp = (Date.now() / 1000).toFixed(0)
    //时间处理, 获取世界时间日期
    const date = getDate(timestamp)

    // ************* 步骤 1：拼接规范请求串 *************
    const signedHeaders = "content-type;host"

    const payload = JSON.stringify({
        ImageBase64: base64
    })

    const hashedRequestPayload = getHash(payload)
    const httpRequestMethod = "POST"
    const canonicalUri = "/"
    const canonicalQueryString = ""
    const canonicalHeaders = "content-type:application/json; charset=utf-8\n" + "host:" + endpoint + "\n"

    const canonicalRequest = httpRequestMethod + "\n"
        + canonicalUri + "\n"
        + canonicalQueryString + "\n"
        + canonicalHeaders + "\n"
        + signedHeaders + "\n"
        + hashedRequestPayload
    console.log(canonicalRequest)

    // ************* 步骤 2：拼接待签名字符串 *************
    const algorithm = "TC3-HMAC-SHA256"
    const hashedCanonicalRequest = getHash(canonicalRequest)
    const credentialScope = date + "/" + service + "/" + "tc3_request"
    const stringToSign = algorithm + "\n" +
        timestamp + "\n" +
        credentialScope + "\n" +
        hashedCanonicalRequest
    console.log(stringToSign)

    // ************* 步骤 3：计算签名 *************
    const kDate = sha256(date, 'TC3' + SECRET_KEY)
    const kService = sha256(service, kDate)
    const kSigning = sha256('tc3_request', kService)
    const signature = sha256(stringToSign, kSigning, 'hex')
    console.log(signature)

    // ************* 步骤 4：拼接 Authorization *************
    const authorization = algorithm + " " +
        "Credential=" + SECRET_ID + "/" + credentialScope + ", " +
        "SignedHeaders=" + signedHeaders + ", " +
        "Signature=" + signature
    console.log(authorization)

    /** @type{Object} */
    let json = await (await fetch("https://" + endpoint, {
        method: 'POST',
        headers: {
            "Authorization": authorization,
            "Content-Type": "application/json; charset=utf-8",
            "Host": endpoint,
            "X-TC-Action": action,
            "X-TC-Timestamp": timestamp,
            "X-TC-Version": version,
            "X-TC-Region": region,
        },
        body: payload
    })).json()

    let arr = json.Response.TextDetections

    let str = ''
    let curX = 0
    let curY = 0

    for (const item of arr) {
        let x = item.ItemPolygon.X
        let y = item.ItemPolygon.Y
        let w = item.ItemPolygon.Width
        let h = item.ItemPolygon.Height
        let lfNum = Math.round((y - curY) / h / 2)
        if (lfNum) {
            curX = 0
            str += '\n'.repeat(lfNum)
        }
        let spaceNum = Math.max(0, Math.round((x - curX) / h))
        let space = ' '.repeat(spaceNum)
        str += space + item.DetectedText
        if (curX == 0) { curX = x }
        curX += w
        curY = y
    }
    return str
}

/**
 * code from https://github.com/mushanshitiancai/vscode-paste-image
 * @param {string} imagePath 
 */
async function saveClipboardImageToFileAndGetPath(imagePath) {
    if (!imagePath) return
    return new Promise((resolve, reject) => {
        let platform = process.platform
        if (platform === 'win32') {
            // Windows
            const scriptPath = path.join(__dirname, '../res/pc.ps1')

            let command = "C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe"
            let powershellExisted = fs.existsSync(command)
            if (!powershellExisted) {
                command = "powershell"
            }

            const powershell = spawn(command, [
                '-noprofile',
                '-noninteractive',
                '-nologo',
                '-sta',
                '-executionpolicy', 'unrestricted',
                '-windowstyle', 'hidden',
                '-file', scriptPath,
                imagePath
            ])
            powershell.on('error', function (e) {
                reject(e)
            })
            powershell.stdout.on('data', function (data) {
                resolve(data.toString().trim())
            })
        }
        else if (platform === 'darwin') {
            // Mac
            let scriptPath = path.join(__dirname, '../res/mac.applescript')

            let ascript = spawn('osascript', [scriptPath, imagePath])
            ascript.on('error', function (e) {
                reject(e)
            })
            ascript.stdout.on('data', function (data) {
                resolve(data.toString().trim())
            })
        } else {
            // Linux 

            let scriptPath = path.join(__dirname, '../../res/linux.sh')

            let ascript = spawn('sh', [scriptPath, imagePath])
            ascript.on('error', function (e) {
                reject(e)
            })
            ascript.stdout.on('data', function (data) {
                let result = data.toString().trim()
                if (result == "no xclip") {
                    reject('You need to install xclip command first.')
                } else {
                    resolve(result)
                }
            })

        }
    })

}