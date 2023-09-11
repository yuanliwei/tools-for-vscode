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
import path from 'path'
import os from 'os'
import vscode from 'vscode'


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
        return nums[0] || Infinity
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