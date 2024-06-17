import vkbeautify from 'vkbeautify'
import js_beautify from 'js-beautify'
import dayjs from 'dayjs'
import { createHash, randomBytes } from 'crypto'
import { runInNewContext } from 'vm'
import he from 'he'
import fetch from 'node-fetch'
import coffee from 'coffeescript'
import less from 'less'
import MarkdownIt from 'markdown-it'
import fs from 'fs'
import path, { sep } from 'path'
import os from 'os'
import vscode from 'vscode'
import { JSONInfo } from 'json-info'
import { evalParser } from 'extract-json-from-string-y'
import { flatten } from 'flat'
import { table } from 'table'
import { runWithLoading } from './view.js'

export async function parseJSON(text) {
    return JSON.parse(text)
}
export async function stringify(text) {
    return JSON.stringify(text)
}
export async function encodeUri(text) {
    return encodeURIComponent(text)
}
export async function encodeBase64(text) {
    return Buffer.from(text).toString('base64')
}
export async function encodeHex(text) {
    return Buffer.from(text, 'utf-8').toString('hex')
}
export async function encodeHtml(text) {
    return he.encode(text)
}
export async function escapeSimple(text) {
    return he.escape(text)
}
export async function escapeWithcrlf(text) {
    return he.escape(text).replace(/\r/g, '&#13;').replace(/\n/g, '&#10;')
}
export async function encodeNative(text) {
    return native2ascii(text)
}
export async function encodeUnicode(text) {
    return toUnicode(text)
}
export async function encodeEscape(text) {
    return escape(text)
}

export async function decodeUri(text) {
    return decodeURIComponent(text)
}
export async function decodeBase64(text) {
    return Buffer.from(text, 'base64').toString('utf-8')
}
export async function decodeHex(text) {
    return Buffer.from(text, 'hex').toString('utf8')
}
export async function decodeHtml(text) {
    return he.decode(text)
}
export async function decodeNative(text) {
    return ascii2native(text)
}
export async function decodeUnicode(text) {
    return fromUnicode(text)
}
export async function decodeUnescape(text) {
    return unescape(text)
}

export async function decodeCoffee(text) {
    return coffee.compile(text, { bare: true })
}

export async function decodeLess(text) {
    return new Promise((resolve, reject) => {
        less.render(text, (err, output) => {
            if (err) {
                console.error(err)
                reject(err)
            } else {
                resolve(output.css)
            }
        })
    })
}

export async function markdownToHtml(text) {
    return MarkdownIt({
        html: true,
        linkify: true,
        typographer: true
    }).render(text)
}


/*
 * ascii2native
 */
function ascii2native(ascii) {
    let code, i, j, len, native1, words
    words = ascii.split('\\u')
    native1 = words[0]
    for (i = j = 0, len = words.length; j < len; i = ++j) {
        code = words[i]
        if (!(i !== 0)) {
            continue
        }
        native1 += String.fromCharCode(parseInt("0x" + (code.substring(0, 4))))
        if (code.length > 4) {
            native1 += code.substring(4, code.length)
        }
    }
    return native1
}

/**
 * @param {string} native 
 * native2ascii
 */
function native2ascii(native) {
    let ascii, charAscii, chars, code, i, j, len
    chars = native.split('')
    ascii = ''
    for (i = j = 0, len = chars.length; j < len; i = ++j) {
        code = Number(chars[i].charCodeAt(0))
        if (code > 127) {
            charAscii = code.toString(16)
            charAscii = new String('0000').substring(charAscii.length, 4) + charAscii
            ascii += '\\u' + charAscii
        } else {
            ascii += chars[i]
        }
    }
    return ascii
}

/**
 * @param {string} str 
 * @returns 
 */
function toUnicode(str) {
    let codes = []
    for (let i = 0; i < str.length; i++) {
        codes.push(("000" + str.charCodeAt(i).toString(16)).slice(-4))
    }
    return "\\u" + codes.join("\\u")
}

/**
 * @param {string} str 
 * @returns 
 */
function fromUnicode(str) {
    return unescape(str.replace(/\\/g, "%"))
}

export async function lineRemoveDuplicate(text) {
    return [...new Set(text.split('\n'))].join('\n')
}
export async function lineRemoveIncludeSelect(selText, text) {
    return text.split('\n').filter(o => !o.includes(selText)).join('\n')
}
export async function lineRemoveExcludeSelect(selText, text) {
    return text.split('\n').filter(o => o.includes(selText)).join('\n')
}
export async function lineRemoveEmpty(text) {
    return text.split('\n').filter(o => o.trim()).join('\n')
}

/**
 * @param {string} text 
 * @param {string} regexp 
 * @returns 
 */
export async function lineRemoveMatchRegexp(text, regexp) {
    if (!regexp) return text
    let reg = new RegExp(regexp)
    return text.split('\n').filter(o => !o.match(reg)).join('\n')
}

/**
 * @param {string} text 
 * @param {string} regexp 
 * @returns 
 */
export async function lineRemoveNotMatchRegexp(text, regexp) {
    if (!regexp) return text
    let reg = new RegExp(regexp)
    return text.split('\n').filter(o => o.match(reg)).join('\n')
}
export async function lineSortAsc(text) {
    return text.split('\n').sort().join('\n')
}
export async function lineSortDesc(text) {
    return text.split('\n').sort().reverse().join('\n')
}
export async function lineTrim(text) {
    return text.split('\n').map(o => o.trim()).join('\n')
}
export async function lineTrimLeft(text) {
    return text.split('\n').map(o => o.trimLeft()).join('\n')
}
export async function lineTrimRight(text) {
    return text.split('\n').map(o => o.trimRight()).join('\n')
}
export async function addLineNumber(text) {
    let num = 1
    return text.split('\n').map(o => `${(num++).toString().padStart(4, ' ')} ${o}`).join('\n')
}

/**
 * @param {string} text 
 * @param {string} separator 
 * @returns 
 */
export async function addLineNumberWithSeparator(text, separator) {
    let num = 1
    return text.split('\n').map(o => `${(num++).toString().padStart(4, ' ')}${separator}${o}`).join('\n')
}

/**
 * 
 * @param {string} text 
 * @param {number} startNum 
 * @returns 
 */
export async function addLineNumberFromInput(text, startNum) {
    let num = startNum
    return text.split('\n').map(o => `${(num++).toString().padStart(4, ' ')} ${o}`).join('\n')
}
/**
 * 下划线转驼峰
 * 
 * @param {string} text 
 */
export async function separatorUnderlineToHump(text) {
    return text.replace(/_(\w)/g, (_, b) => b.toUpperCase())
}
/**
 * 驼峰转下划线
 * 
 * @param {string} text 
 */
export async function separatorHumpToUnderline(text) {
    return text.replace(/[A-Z]/g, (a) => `_${a.toLowerCase()}`).replace(/(\W)_/g, (a, b) => b)
}
/**
 * 首字母小写
 * 
 * @param {string} text 
 */
export async function firstLetterLowercase(text) {
    console.log(text)
    return text.replace(/^\w/, (a) => a.toLowerCase()).replace(/(\W)(\w)/g, (_, b, c) => `${b}${c.toLowerCase()}`)
}
/**
 * 首字母大写
 * 
 * @param {string} text 
 */
export async function firstLetterUppercase(text) {
    return text.replace(/^\w/, (a) => a.toUpperCase()).replace(/(\W)(\w)/g, (_, b, c) => `${b}${c.toUpperCase()}`)
}
/**
 * 统计重复行数
 * 
 * @param {string} text 
 */
export async function lineGroupDuplicate(text) {
    let map = {}
    let lines = text.split('\n')
    let arr = []
    for (const line of lines) {
        if (map[line]) {
            map[line].count++
        } else {
            map[line] = { count: 1, line: line }
            arr.push(map[line])
        }
    }
    return arr.map(o => `${o.count.toString().padStart(5)}  ${o.line}`).join('\n')
}
/**
 * 按数字大小排序文本行
 * 
 * @param {string} text 
 */
export async function lineSortNumber(text) {
    function toNum(value) {
        let match = value.match(/(\d+\.?\d*e-\d+)|(\d+\.?\d*e\d+)|(\d*\.\d+)|(\d+)/g) || []
        let nums = match.map((o) => parseFloat(o))
        return nums[0] ?? Infinity
    }
    let lines = text.split('\n')
    lines.sort((l, h) => toNum(l) - toNum(h))
    return lines.join('\n')
}
/**
 * 反向排序文本行
 * 
 * @param {string} text 
 */
export async function lineReverse(text) {
    let lines = text.split('\n')
    return lines.reverse().join('\n')
}

export async function formatJSON(text) {
    return vkbeautify.json(text)
}
export async function formatXML(text) {
    return vkbeautify.xml(text)
}
export async function formatCSS(text) {
    return js_beautify.css(text, {
        selector_separator_newline: false
    })
}
export async function formatSQL(text) {
    return vkbeautify.sql(text)
}
export async function formatJS(text) {
    return js_beautify(text)
}
export async function minJSON(text) {
    return vkbeautify.jsonmin(text)
}
export async function minXML(text) {
    return vkbeautify.xmlmin(text)
}
export async function minCSS(text) {
    return vkbeautify.cssmin(text)
}
export async function minSQL(text) {
    return vkbeautify.sqlmin(text)
}
export async function currentTime() {
    return new Date().toLocaleString()
}
export async function guid() {
    return randomBytes(16).toString('hex')
}
/**
 * @param {string} text 
 * @returns 
 */
export async function formatTime(text) {
    return text.replace(/(\d{11,13})|(\d{10})/g, function (val) {
        var date = parseInt(val)
        // java中的Integer.MAX_VALUE
        if (date == 2147483647) { return val }
        if (val.length == 10) {
            if (val.startsWith('19')) { return val }
            if (val.startsWith('20')) { return val }
            date *= 1000
        }
        return dayjs(date).format('YYYY-MM-DD HH:mm:ss.SSS')
    })
}

/**
 * @param {string} text 
 * @returns 
 */
export async function formatBytes(text) {
    return text.replace(/(\d+)/g, (val) => {
        let size = parseInt(val)
        return String(formatByteSize(size))
    })
}

/**
 * @param {number} size
 */
export function formatByteSize(size) {
    if (!size) return ''
    if (size < 0) { return '0B'.padStart(8, ' ') }
    let companys = 'B KB MB GB TB'.split(' ')
    let cur = size
    while (cur >= 1024) {
        companys.shift()
        cur /= 1024
    }
    return Number(cur.toFixed(2)) + companys[0]
}

export async function runCode(code) {
    let runFilePath = path.join(os.tmpdir(), `tmp-${Date.now()}.js`)
    let editor = vscode.window.activeTextEditor
    if (editor && !editor.document.isDirty && code == editor.document.getText()) {
        runFilePath = editor.document.fileName
    } else {
        fs.writeFileSync(runFilePath, code)
    }
    let terminal = vscode.window.activeTerminal
    if (!terminal) {
        terminal = vscode.window.createTerminal('Run Code')
    }
    terminal.show()
    terminal.sendText(`node "${runFilePath}"`)
    return code
}

export async function evalPrint(code) {
    let result = runInNewContext(code)
    return code + ' ' + result
}
export async function commentAlign(text) {
    var maxLength = 0
    var lines = text.split('\n')
    lines.forEach(function (item) {
        item = item.replace('//', '#sp#//')
        var items = item.split('#sp#')
        if (items.length == 2) {
            maxLength = Math.max(maxLength, items[0].length)
        }
    })
    var newLines = []
    var m = /http.?:\/\//
    lines.forEach(function (item) {
        if (!m.test(item)) {
            item = item.replace('//', '#sp#//')
        }
        var items = item.split('#sp#//')
        var newLine = items[0]
        if (items.length == 2) {
            if (items[0].trim().length == 0) {
                newLine += '// ' + items[1].trim()
            } else {
                var space = maxLength - items[0].length
                newLine += ' '.repeat(space) + '// ' + items[1].trim()
            }
        }
        newLines.push(newLine)
    })
    return newLines.join('\n')
}

/**
 * @param {import('vscode').TextEditor} editor
 * @returns
 */
export async function cursorAlign(editor) {

    let selections = editor.selections

    console.log(selections)
    let maxColumn = 0
    let insertSpaces = []
    for (let i = 0; i < selections.length; i++) {
        const selection = selections[i]
        maxColumn = Math.max(maxColumn, selection.end.character)
        insertSpaces[i] = selection.end.character
    }
    maxColumn++
    for (let i = 0; i < insertSpaces.length; i++) {
        const insertSpace = insertSpaces[i]
        insertSpaces[i] = maxColumn - insertSpace
    }
    let index = 0
    return () => {
        return ' '.repeat(insertSpaces[index++])
    }
}
/**
 * @param {String} text 
 */
export async function cleanAnsiEscapeCodes(text) {
    // eslint-disable-next-line no-control-regex
    return text.replace(/\x1b\[[\d;]+?m/g, '')
}

const sleep = (/** @type {number} */ timeout) => new Promise((resolve) => setTimeout(resolve, timeout))

/**
 * @param {string} chatgptHttpAPI 
 * @param {string} text 
 * @param {(char:string)=>Promise<boolean>} appender 
 */
export async function chatgpt(chatgptHttpAPI, text, appender) {
    await appender(' ')
    await sendMessage(chatgptHttpAPI, text, async (text) => {
        let ret = await appender(text)
        if (!ret) {
            await sleep(1000)
        }
    })
    await appender(' ')
}

/**
* @param {string} chatgptHttpAPI 
* @param {string} message 
* @param {(text:string)=>Promise<void>} cb 
* @returns {Promise<string>} 
*/
async function sendMessage(chatgptHttpAPI, message, cb) {
    if (!message) {
        return ''
    }
    let response = await fetch(chatgptHttpAPI, {
        method: 'POST',
        body: message
    })
    const decoder = new TextDecoder()
    let reader = response.body
    let done = false
    /** @type{string[]} */
    const queue = []

    const promiseReader = new Promise((resolve, reject) => {
        reader.on('data', (chunk) => {
            queue.push(...decoder.decode(chunk, { stream: true }))
        })
        reader.on('end', () => {
            done = true
            resolve(null)
        })
        reader.on('close', () => {
            done = true
            resolve(null)
        })
        reader.on('error', (e) => {
            console.log('on error ', e)
            done = true
            reject(e)
        })
    })
    const promiseOutput = (async () => {
        while (!done) {
            await sleep(100)
            while (queue.length > 0) {
                const maxStepTime = 50
                let time = Math.floor(Math.min(maxStepTime, 1000 / queue.length))
                if (done) {
                    time = 1
                }
                await sleep(time)
                let c = queue.shift()
                await cb(c)
            }
        }
        await cb('\n')
    })()
    try {
        await promiseReader
        await promiseOutput
    } catch (error) {
        console.error(error)
        await cb('\n' + error.stack)
    }
}

export async function md5(text) {
    const hash = createHash('md5')
    hash.update(text)
    return hash.digest('hex')
}
export async function sha1(text) {
    const hash = createHash('sha1')
    hash.update(text)
    return hash.digest('hex')
}
export async function sha256(text) {
    const hash = createHash('sha256')
    hash.update(text)
    return hash.digest('hex')
}
export async function sha512(text) {
    const hash = createHash('sha512')
    hash.update(text)
    return hash.digest('hex')
}

export class NameGenerate {
    constructor() {
        this.nameCode = '鑫正涵琛妍芸露楠薇锦彤采初美冬婧桐莲彩洁'
            + '呈菡怡冰雯雪茜优静萱林馨鹤梅娜璐曼彬芳颖韵曦蔚桂月梦琪蕾'
            + '依碧枫欣杉丽祥雅欢婷舒心紫芙慧梓香玥菲璟茹昭岚玲云华阳弦'
            + '莉明珊雨蓓旭钰柔敏家凡花媛歆沛姿妮珍琬彦倩玉柏橘昕桃栀克'
            + '帆俊惠漫芝寒诗春淑凌珠灵可格璇函晨嘉鸿瑶帛琳文洲娅霞颜康'
            + '卓星礼远帝裕腾震骏加强运杞良梁逸禧辰佳子栋博年振荣国钊喆'
            + '睿泽允邦骞哲皓晖福濡佑然升树祯贤成槐锐芃驰凯韦信宇鹏盛晓'
            + '翰海休浩诚辞轩奇潍烁勇铭平瑞仕谛翱伟安延锋寅起谷稷胤涛弘'
            + '侠峰材爵楷尧炳乘蔓桀恒桓日坤龙锟天郁吉暄澄中斌杰祜权畅德'
    }

    get() {
        let length = [3, 2, 4, 5][Math.floor(Math.random() * Math.random() * 3.1)]
        let name = []
        while (length--) {
            name.push(this.nameCode[Math.floor(Math.random() * this.nameCode.length)])
        }
        return name.join('')
    }
}

/**
 * @param {string} obj
 */
export function jsonDeepParse(obj) {
    /** @type{Object} */
    let o = obj
    if (typeof (obj) == 'string') {
        try { o = JSON.parse(obj) } catch (e) { return o }
    }
    if (typeof (o) == 'string') {
        return jsonDeepParse(o)
    }
    if (o instanceof Array) {
        for (let i = 0; i < o.length; i++) {
            o[i] = jsonDeepParse(o[i])
        }
    } else {
        for (let k in o) {
            if (Object.prototype.hasOwnProperty.call(o, k)) {
                o[k] = jsonDeepParse(o[k])
            }
        }
    }
    return o
}


/**
 * 
 * @param {string} text 
 * @returns 
 */
export async function parseJSONInfo(text) {
    await sleep(30)
    let maxLines = 20
    let json = evalParser(text)
    let array = []
    let items = flatten(json)
    for (const k in items) {
        let value = items[k]
        let key = k.replace(/^\d+\./, '[].')
            .replace(/\.\d+\./g, '.[].')
            .replace(/\.\d+$/, '.[]')
        let o = {}
        o[key] = value
        array.push(o)
    }
    let info = new JSONInfo(o => o, maxLines)
    info.parse(array)
    // info.print()
    let time = Date.now()
    let ret = []
    let datas = info.auto.result()
    for (const data of datas) {
        // console.log('key:', data.description)
        ret.push('key:' + data.description)
        let arr = data.datas
        if (arr.length > maxLines) {
            let otherNums = arr.reduce((p, c, i) => {
                if (i > maxLines) {
                    return p + c.number
                } else {
                    return 0
                }
            }, 0)
            let otherKeyLength = arr.length - maxLines
            arr = arr.slice(0, maxLines)
            arr.push({ value: `(...others...)[${otherKeyLength}]`, number: otherNums })
        }
        // console.table(arr)
        // console.log(arr)
        let rows = [['(index)', 'value', 'number']]
        let maxLength = rows[0][1].length
        for (let index = 0; index < arr.length; index++) {
            const o = arr[index]
            maxLength = Math.max(`${o.value}`.length, maxLength)
            rows.push([String(index), o.value, String(o.number)])
        }
        ret.push('    ' + table(rows, Object.assign({}, tableConfig, {
            columns: [
                {},
                { width: Math.min(200, maxLength) },
            ]
        })).replace(/\n/g, '\n    ').trimEnd())
        if (Date.now() - time > 3000) {
            time = Date.now()
            await sleep(1)
        }
    }
    return ret.join('\n')
}

/** @type{import('table').TableUserConfig} */
const tableConfig = {
    border: {
        topBody: `─`,
        topJoin: `┬`,
        topLeft: `┌`,
        topRight: `┐`,

        bottomBody: `─`,
        bottomJoin: `┴`,
        bottomLeft: `└`,
        bottomRight: `┘`,

        bodyLeft: `│`,
        bodyRight: `│`,
        bodyJoin: `│`,

        joinBody: `─`,
        joinLeft: `├`,
        joinRight: `┤`,
        joinJoin: `┼`
    },
    drawHorizontalLine: (lineIndex, rowCount) => {
        return lineIndex === 0 || lineIndex === 1 || lineIndex === rowCount
    },
    columns: [
        {},
        { width: 100 },
    ],
}

/**
 * @param {object} variable
 */
function isPlainObject(variable) {
    return typeof variable === "object" && variable !== null && Object.prototype.toString.call(variable) === "[object Object]"
}

/**
 * @param {object} json
 */
export function rearrangeJsonKey(json) {
    if (Array.isArray(json)) {
        for (let i = 0; i < json.length; i++) {
            json[i] = rearrangeJsonKey(json[i])
        }
        return json
    }
    if (isPlainObject(json)) {
        let sortedObj = {}
        let keys = Object.keys(json).sort()
        for (const key of keys) {
            let value = json[key]
            sortedObj[key] = rearrangeJsonKey(value)
        }
        return sortedObj
    }
    return json
}

/**
 * @typedef {import('./api/git.js').GitExtension} GitExtension
 */

export function getGitApi() {
    /** @type{GitExtension} */
    const gitExtension = vscode.extensions.getExtension('vscode.git').exports
    const git = gitExtension.getAPI(1)
    return git
}

/**
 * @typedef {import('./api/git.js').IExecutionResult<string>} IExecutionResult
 */

/**
 * @param {string[]} args
 * @returns {Promise<IExecutionResult|null>}
 */
export async function gitexec(args) {
    let git = getGitApi()
    const repository = git.repositories.at(0)
    if (!repository) {
        vscode.window.showWarningMessage('no repository')
        return null
    }
    let exec = async () => { }
    let instance = null
    for (const key in repository.repository) {
        const v = repository.repository[key]
        if (v?.exec) {
            instance = v
            exec = v.exec
            break
        }
    }
    return await exec.call(instance, args)
}

/**
 * @param {string} html
 */
export function getWebviewContent(html) {
    if (html.substring(0, 30).toLowerCase().startsWith('<!doctype')) {
        return html
    }
    return `<!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
    </head>
    <body>
        ${html}
    </body>
    </html>`
}

/**
 * @param {string} text
 */
export function previewHTML(text) {
    const panel = vscode.window.createWebviewPanel(
        'webview',
        'Preview',
        vscode.ViewColumn.Active,
        {
            enableCommandUris: true,
            enableScripts: true,
            enableFindWidget: true,
            enableForms: true,
            localResourceRoots: [],
        }
    )

    panel.webview.html = getWebviewContent(text)
    return null
}

/** @type{vscode.SourceControlResourceGroup} */
let groupShowChanges = null

export async function showChange([ref1, ref2]) {

    if (!ref1) {
        let version = await vscode.window.showInputBox({
            title: '输入git版本号',
            placeHolder: '1234567 0987654'
        })
        if (!version) {
            return
        }
        const split = version.split(/ +/).map(o => o.trim()).filter(o => o)
        if (split.length == 0) {
            return
        }
        if (split.length == 1) {
            ref1 = split[0]
        }
        if (split.length > 1) {
            [ref1, ref2] = split
        }
    }

    let git = getGitApi()
    const repository = git.repositories.at(0)
    let changes = []

    let title = ref1.substring(0, 10)
    if (ref1 && ref2) {
        title = `${ref1.substring(0, 10)}..${ref2.substring(0, 10)}`
    } else if (ref1) {
        ref2 = ref1
        ref1 = ref1 + '^'
    }
    changes = await repository.diffBetween(ref1, ref2)

    if (!groupShowChanges) {
        let sourceControl = repository.repository?.sourceControl
        if (!sourceControl) {
            sourceControl = vscode.scm.createSourceControl('y-diff', 'commit', repository.rootUri)
        }
        groupShowChanges = sourceControl.createResourceGroup('y-diff-changes', 'diff-changes')
        groupShowChanges.hideWhenEmpty = true
    }

    groupShowChanges.resourceStates = [
        ...changes.map(o => {
            let rootPath = repository.rootUri.fsPath
            if (!rootPath.endsWith(sep)) {
                rootPath += sep
            }
            let filePath = o.uri.fsPath.replace(rootPath, '')

            let uri1 = git.toGitUri(o.uri, ref1)
            let uri2 = git.toGitUri(o.uri, ref2)
            /** @type{vscode.SourceControlResourceState} */
            let resourceState = {
                resourceUri: o.uri,
                command: {
                    title: 'change',
                    command: 'vscode.diff',
                    tooltip: 'command-tooltip',
                    arguments: [uri1, uri2, `${filePath}:${title}`],
                },
                decorations: buildGitStatusDecorations(o)
            }
            return resourceState
        }),
    ]
}

/**
 * @param {import("./api/git.js").Change} change
 * @returns {vscode.SourceControlResourceDecorations}
 */
function buildGitStatusDecorations(change) {
    const modified = new vscode.ThemeIcon('diff-modified', new vscode.ThemeColor('gitDecoration.modifiedResourceForeground'))
    const removed = new vscode.ThemeIcon('diff-removed', new vscode.ThemeColor('gitDecoration.deletedResourceForeground'))
    const added = new vscode.ThemeIcon('diff-added', new vscode.ThemeColor('gitDecoration.addedResourceForeground'))
    const renamed = new vscode.ThemeIcon('diff-renamed', new vscode.ThemeColor('gitDecoration.renamedResourceForeground'))
    const ignored = new vscode.ThemeIcon('diff-ignored', new vscode.ThemeColor('gitDecoration.ignoredResourceForeground'))
    switch (change.status) {
        case Status.MODIFIED:
            return {
                light: { iconPath: modified }, dark: { iconPath: modified }
            }
        case Status.DELETED:
            return {
                strikeThrough: true,
                faded: true,
                light: { iconPath: removed }, dark: { iconPath: removed }
            }
        case Status.INDEX_ADDED:
            return {
                light: { iconPath: added }, dark: { iconPath: added }
            }
        case Status.INDEX_RENAMED:
            return {
                light: { iconPath: renamed }, dark: { iconPath: renamed }
            }
        case Status.IGNORED:
            return {
                light: { iconPath: ignored }, dark: { iconPath: ignored }
            }
        default:
            vscode.window.showErrorMessage(`unknown change.status: ${change.status}`)
            console.error('unknown change.status', change.status)
            return {
                strikeThrough: true
            }
    }
}

export async function clearDiffChanges() {
    groupShowChanges.resourceStates = []
}

export async function showGitBlame() {
    runWithLoading('git blame ...', async () => {
        let activeTextEditor = vscode.window.activeTextEditor
        let fsPath = activeTextEditor.document.uri.fsPath
        let content = (await gitexec(['blame', fsPath]))?.stdout
        if (!content) return
        let doc = await vscode.workspace.openTextDocument({ content: content, language: 'plaintext' })
        vscode.window.showTextDocument(doc, { preview: true })
    })
}

export async function showGitLogGraph() {
    runWithLoading('git log --graph ...', async () => {
        let content = (await gitexec('log --graph --decorate=full'.split(' ')))?.stdout
        if (!content) return
        let doc = await vscode.workspace.openTextDocument({ content: content, language: 'plaintext' })
        vscode.window.showTextDocument(doc, { preview: true })
    })
}

export async function showGitLogGraphAll() {
    runWithLoading('git log --graph --all ...', async () => {
        let content = (await gitexec('log --graph --all --date-order --decorate=full'.split(' ')))?.stdout
        if (!content) return
        let doc = await vscode.workspace.openTextDocument({ content: content, language: 'plaintext' })
        vscode.window.showTextDocument(doc, { preview: true })
    })
}

export async function showGitLogGraphOneline() {
    runWithLoading('log --graph --oneline --all ...', async () => {
        let content = (await gitexec('log --graph --oneline --all --date-order --decorate=full'.split(' ')))?.stdout
        if (!content) return
        let doc = await vscode.workspace.openTextDocument({ content: content, language: 'plaintext' })
        vscode.window.showTextDocument(doc, { preview: true })
    })
}

export async function gitFetchAll() {
    runWithLoading('fetch --all ...', async () => {
        let ret = await gitexec('fetch --all'.split(' '))
        if (!ret) return
        if (ret.exitCode != 0) {
            vscode.window.showInformationMessage(ret.stderr)
        }
    })
}

/**
 * @param {string} command
 */
export async function execInTerminal(command) {
    let terminal = vscode.window.activeTerminal
    if (!terminal) {
        terminal = vscode.window.createTerminal('tools')
    }
    terminal.sendText(command)
}

export const Status = {
    INDEX_MODIFIED: 0,
    INDEX_ADDED: 1,
    INDEX_DELETED: 2,
    INDEX_RENAMED: 3,
    INDEX_COPIED: 4,

    MODIFIED: 5,
    DELETED: 6,
    UNTRACKED: 7,
    IGNORED: 8,
    INTENT_TO_ADD: 9,
    INTENT_TO_RENAME: 10,
    TYPE_CHANGED: 11,

    ADDED_BY_US: 12,
    ADDED_BY_THEM: 13,
    DELETED_BY_US: 14,
    DELETED_BY_THEM: 15,
    BOTH_ADDED: 16,
    BOTH_DELETED: 17,
    BOTH_MODIFIED: 18,
}

/**
 * @param {import("./api/git.js").API} git
 * @param {import('./api/git.js').Change} change
 * @param {string} originalRef
 * @param {string} modifiedRef
 */
export function toMultiFileDiffEditorUris(git, change, originalRef, modifiedRef) {
    switch (change.status) {
        case Status.INDEX_ADDED:
            return { originalUri: undefined, modifiedUri: git.toGitUri(change.uri, modifiedRef) }
        case Status.DELETED:
            return { originalUri: git.toGitUri(change.uri, originalRef), modifiedUri: undefined }
        case Status.INDEX_RENAMED:
            return { originalUri: git.toGitUri(change.originalUri, originalRef), modifiedUri: git.toGitUri(change.uri, modifiedRef) }
        default:
            return { originalUri: git.toGitUri(change.uri, originalRef), modifiedUri: git.toGitUri(change.uri, modifiedRef) }
    }
}

export async function todo(text, [ref1 = 'HEAD~4', ref2 = 'HEAD']) {
    let activeTextEditor = vscode.window.activeTextEditor
    // let terminal = vscode.window.activeTerminal
    // if (!terminal) {
    //     terminal = vscode.window.createTerminal('git')
    // }
    let git = getGitApi()
    const repository = git.repositories.at(0)
    console.log('git.git.path', git.git.path)
    // repository.repository.sourceControl.
    // let blame = await repository.blame(activeTextEditor.document.uri.fsPath)
    // vscode.workspace.openTextDocument({ language: 'markdown', content: blame })

    // repository



    // debugger
    // return (await gitexec(['log'])).stdout
    return (await gitexec(['log', '--graph', '--all'])).stdout
}