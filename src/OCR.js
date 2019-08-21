module.exports = class OCR {
    static async pasteImage(iks) {
        if (!iks) return
        const vscode = require('vscode')
        return vscode.window.withProgress({ location: vscode.ProgressLocation.Window, title: 'pasteImage...' }, async (progress) => {
            const os = require('os')
            const path = require('path')
            const fs = require('fs')
            let imagePath = path.join(os.tmpdir(), `pasteImg-${Date.now()}.png`)
            let resultImgPath = await saveClipboardImageToFileAndGetPath(imagePath)
            if (!fs.existsSync(resultImgPath)) { return }
            let text = await fetchImgTextByOCR(iks, resultImgPath);
            return text
        })
    }
}

async function fetchImgTextByOCR([appId, appKey], imagePath) {
    const Request = require('./Request')
    let r = new Request()
    const querystring = require('querystring')
    const fs = require('fs')

    let md5 = (s) => require('crypto').createHash("md5").update(s).digest('hex')

    let image = fs.readFileSync(imagePath).toString('base64')

    let nonce_str = md5(Math.random().toString())
    let time_stamp = Math.round(Date.now() / 1000)

    let sign = md5(querystring.stringify({
        app_id: appId,
        image: image,
        nonce_str: nonce_str,
        time_stamp: time_stamp,
        app_key: appKey,
    })).toUpperCase()

    let url = `https://api.ai.qq.com/fcgi-bin/ocr/ocr_generalocr`
    let result = await r.post(url, {
        // 'Content-Type': 'application/json',
    }, querystring.stringify({
        app_id: appId,          // 是  int  正整数  1000001  应用标识（AppId）
        time_stamp: time_stamp, // 是  int  正整数  1493468759  请求时间戳（秒级）
        nonce_str: nonce_str,   // 是  string  非空且长度上限32字节  fa577ce340859f9fe  随机字符串
        sign: sign,             // 是  string  非空且长度固定32字节    签名信息，详见接口鉴权
        image: image,           // 是  string  原始图片的base64编码数据（原图大小上限1MB，支持JPG、PNG、BMP格式）
    }))
    let json = JSON.parse(result)
    let arr = json.data.item_list

    let str = ''
    let curX = 0
    let curY = 0

    for (const item of arr) {
        let x = item.itemcoord[0].x
        let y = item.itemcoord[0].y
        let w = item.itemcoord[0].width
        let h = item.itemcoord[0].height
        let lfNum = Math.round((y - curY) / h / 2)
        if (lfNum) {
            curX = 0
            str += '\n'.repeat(lfNum)
        }
        let spaceNum = Math.max(0, Math.round((x - curX) / h))
        let space = ' '.repeat(spaceNum)
        str += space + item.itemstring
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
    if (!imagePath) return;
    const fs = require('fs')
    const path = require('path')
    const { spawn } = require('child_process')
    return new Promise((resolve, reject) => {
        let platform = process.platform
        if (platform === 'win32') {
            // Windows
            const scriptPath = path.join(__dirname, '../res/pc.ps1');

            let command = "C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe";
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
            ]);
            powershell.on('error', function (e) {
                reject(e)
            })
            powershell.stdout.on('data', function (data) {
                resolve(data.toString().trim());
            })
        }
        else if (platform === 'darwin') {
            // Mac
            let scriptPath = path.join(__dirname, '../res/mac.applescript');

            let ascript = spawn('osascript', [scriptPath, imagePath]);
            ascript.on('error', function (e) {
                reject(e)
            })
            ascript.stdout.on('data', function (data) {
                resolve(data.toString().trim());
            })
        } else {
            // Linux 

            let scriptPath = path.join(__dirname, '../../res/linux.sh');

            let ascript = spawn('sh', [scriptPath, imagePath]);
            ascript.on('error', function (e) {
                reject(e)
            });
            ascript.stdout.on('data', function (data) {
                let result = data.toString().trim();
                if (result == "no xclip") {
                    reject('You need to install xclip command first.');
                } else {
                    resolve(result);
                }
            });

        }
    })

}