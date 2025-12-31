import vkbeautify from 'vkbeautify'
import js_beautify from 'js-beautify'
import dayjs from 'dayjs'
import { createHash, randomBytes } from 'crypto'
import { runInNewContext } from 'vm'
import he from 'he'
import MarkdownIt from 'markdown-it'
import { JSONInfo } from 'json-info'
import { evalParser } from 'extract-json-from-string-y'
import { flatten } from 'flat'
import { table } from 'table'
import { extractTypesFromSource } from 'extract-types'
import { escape, unescape } from 'querystring'
import { readFile, writeFile } from 'fs/promises'
import nzh from 'nzh'
import stringWidth from 'string-width'

/**
 * @import {CHAT_PROMPT, CommandItem, ContributeCommandItem} from './types.js'
 */

/**
 * @param {string} text
 */
export async function parseJSON(text) {
    return JSON.parse(text)
}
/**
 * @param {string} text
 */
export async function stringify(text) {
    return JSON.stringify(text)
}
/**
 * @param {string | number | boolean} text
 */
export async function encodeUri(text) {
    return encodeURIComponent(text)
}
/**
 * @param {string} text
 */
export async function encodeBase64(text) {
    return Buffer.from(text).toString('base64')
}
/**
 * @param {string} text
 */
export async function encodeHex(text) {
    return Buffer.from(text, 'utf-8').toString('hex')
}
/**
 * @param {string} text
 */
export async function encodeHtml(text) {
    return he.encode(text)
}
/**
 * @param {string} text
 */
export async function escapeSimple(text) {
    return he.escape(text)
}
/**
 * @param {string} text
 */
export async function escapeWithcrlf(text) {
    return he.escape(text).replace(/\r/g, '&#13;').replace(/\n/g, '&#10;')
}
/**
 * @param {string} text
 */
export async function encodeNative(text) {
    return native2ascii(text)
}
/**
 * @param {string} text
 */
export async function encodeUnicode(text) {
    return toUnicode(text)
}
/**
 * @param {string} text
 */
export async function encodeEscape(text) {
    return escape(text)
}

/**
 * @param {string} text
 */
export async function decodeUri(text) {
    return decodeURIComponent(text)
}
/**
 * @param {string} text
 */
export async function decodeBase64(text) {
    return Buffer.from(text, 'base64').toString('utf-8')
}
/**
 * @param {string} text
 */
export async function decodeHex(text) {
    return Buffer.from(text, 'hex').toString('utf8')
}
/**
 * @param {string} text
 */
export async function decodeHtml(text) {
    return he.decode(text)
}
/**
 * @param {string} text
 */
export async function decodeNative(text) {
    return ascii2native(text)
}
/**
 * @param {string} text
 */
export async function decodeUnicode(text) {
    return fromUnicode(text)
}
/**
 * @param {string} text
 */
export async function decodeUnescape(text) {
    return unescape(text)
}

/**
 * @param {string} text
 */
export async function markdownToHtml(text) {
    return MarkdownIt({
        html: true,
        linkify: true,
        typographer: true
    }).render(text)
}


/**
 * @param {string} ascii
 * ascii2native
 */
function ascii2native(ascii) {
    let code, i, j, len, native1, words
    words = ascii.split(/[\\%]u/)
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

/**
 * @param {string} text
 */
export async function lineRemoveDuplicate(text) {
    let s = splitText(text)
    return [...new Set(s.lines)].join('\n') + s.end
}
/**
 * @param {string} selText
 * @param {string} text
 */
export async function lineRemoveIncludeSelect(selText, text) {
    let s = splitText(text)
    return s.lines.filter((/** @type {string | any[]} */ o) => !o.includes(selText)).join('\n') + s.end
}
/**
 * @param {string} selText
 * @param {string} text
 */
export async function lineRemoveExcludeSelect(selText, text) {
    let s = splitText(text)
    return s.lines.filter((/** @type {string | any[]} */ o) => o.includes(selText)).join('\n') + s.end
}
/**
 * @param {string} text
 */
export async function lineRemoveEmpty(text) {
    let s = splitText(text)
    return s.lines.filter((/** @type {string} */ o) => o.trim()).join('\n') + s.end
}

/**
 * @param {string} text 
 * @param {string} regexp 
 * @returns 
 */
export async function lineRemoveMatchRegexp(text, regexp) {
    if (!regexp) return text
    let reg = new RegExp(regexp)
    let s = splitText(text)
    return s.lines.filter(o => !o.match(reg)).join('\n') + s.end
}

/**
 * @param {string} text 
 * @param {string} regexp 
 * @returns 
 */
export async function lineRemoveNotMatchRegexp(text, regexp) {
    if (!regexp) return text
    let reg = new RegExp(regexp)
    let s = splitText(text)
    return s.lines.filter(o => o.match(reg)).join('\n') + s.end
}
/**
 * @param {string} text
 */
export async function lineSortAsc(text) {
    let s = splitText(text)
    return s.lines.sort().join('\n') + s.end
}
/**
 * @param {string} text
 */
export async function lineSortDesc(text) {
    let s = splitText(text)
    return s.lines.sort().reverse().join('\n') + s.end
}
/**
 * @param {string} text
 */
export async function lineSortRandom(text) {
    let s = splitText(text)
    return shuffle(s.lines).join('\n') + s.end
}
/**
 * @param {string} text
 */
export function splitText(text) {
    const match = text.match(/\r?\n\s*$/)
    let end = ''
    if (match) {
        end = match[0]
        text = text.slice(0, -end.length)
    }
    let lines = text.split(/\r?\n/)
    return { lines, end }
}
/**
 * @param {string} text
 */
export async function lineTrim(text) {
    let s = splitText(text)
    return s.lines.map((/** @type {string} */ o) => o.trim()).join('\n') + s.end
}
/**
 * @param {string} text
 */
export async function lineTrimLeft(text) {
    let s = splitText(text)
    return s.lines.map((/** @type {string} */ o) => o.trimStart()).join('\n') + s.end
}
/**
 * @param {string} text
 */
export async function lineTrimRight(text) {
    let s = splitText(text)
    return s.lines.map((/** @type {string} */ o) => o.trimEnd()).join('\n') + s.end
}
/**
 * @param {string} text
 */
export async function addLineNumber(text) {
    let num = 1
    let s = splitText(text)
    return s.lines.map((/** @type {any} */ o) => `${(num++).toString().padStart(4, ' ')} ${o}`).join('\n') + s.end
}

/**
 * @param {string} text 
 * @param {string} separator 
 * @returns 
 */
export async function addLineNumberWithSeparator(text, separator) {
    let num = 1
    let s = splitText(text)
    return s.lines.map(o => `${(num++).toString().padStart(4, ' ')}${separator}${o}`).join('\n') + s.end
}

/**
 * 
 * @param {string} text 
 * @param {number} startNum 
 * @returns 
 */
export async function addLineNumberFromInput(text, startNum) {
    let num = startNum
    let s = splitText(text)
    return s.lines.map(o => `${(num++).toString().padStart(4, ' ')} ${o}`).join('\n') + s.end
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
    let lines = text.split(/\r?\n/)
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
    /**
     * @param {string} value
     */
    function toNum(value) {
        let match = value.match(/(\d+\.?\d*e-\d+)|(\d+\.?\d*e\d+)|(\d*\.\d+)|(\d+)/g) || []
        let nums = match.map((/** @type {string} */ o) => parseFloat(o))
        return nums[0] ?? Infinity
    }
    let lines = text.split(/\r?\n/)
    lines.sort((l, h) => toNum(l) - toNum(h))
    return lines.join('\n')
}
/**
 * 反向排序文本行
 * 
 * @param {string} text 
 */
export async function lineReverse(text) {
    let lines = text.split(/\r?\n/)
    return lines.reverse().join('\n')
}

/**
 * @param {string} text
 */
export async function formatJSON(text) {
    return vkbeautify.json(text)
}
/**
 * @param {string} text
 */
export async function formatXML(text) {
    return vkbeautify.xml(text)
}
/**
 * @param {string} text
 */
export async function formatCSS(text) {
    return js_beautify.css(text, {
        selector_separator_newline: false
    })
}
/**
 * @param {string} text
 */
export async function formatSQL(text) {
    return vkbeautify.sql(text)
}
/**
 * @param {string} text
 */
export async function formatJS(text) {
    return js_beautify(text)
}
/**
 * @param {string} text
 */
export async function minJSON(text) {
    return vkbeautify.jsonmin(text)
}
/**
 * @param {string} text
 */
export async function minXML(text) {
    return vkbeautify.xmlmin(text)
}
/**
 * @param {string} text
 */
export async function minCSS(text) {
    return vkbeautify.cssmin(text)
}
/**
 * @param {string} text
 */
export async function minSQL(text) {
    return vkbeautify.sqlmin(text)
}
export async function currentTime() {
    return dayjs().format('YYYY/MM/DD HH:mm:ss')
}
export async function currentTimeShort() {
    return dayjs().format('YYYYMMDDHHmmss')
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
 */
export async function parseTimeMillisStr(text) {
    let textTrim = text.trim()
    let millis = parseTime(textTrim)
    if (millis > 0) {
        return String(millis)
    }
    millis = new Date(textTrim).getTime()
    if (!isNaN(millis)) {
        return String(millis)
    }
    return text
}

/**
 * 解析时间字符串
 * @param {string} str
 */
export function parseTime(str) {
    let m = str.match(/\d\d\d\d-\d\d-\d\d \d\d:\d\d:\d\d\.\d\d\d/)
    if (m) {
        return dayjs(m[0]).toDate().getTime()
    }
    m = str.match(/\d\d-\d\d-\d\d \d\d:\d\d:\d\d\.\d\d\d/)
    if (m) {
        return dayjs(`20${m[0]}`).toDate().getTime()
    }
    return 0
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

/**
 * @param {string} text
 */
export async function evalPrint(text) {
    let code = text.replace(/=\s*$/, '')
    let result = runInNewContext(code)
    return String(result)
}

/**
 * @param {string} text
 */
export async function commentAlign(text) {
    var maxLength = 0
    var lines = text.split(/\r?\n/)
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
    let maxStringWidth = 0
    let insertSpaces = []
    for (let i = 0; i < selections.length; i++) {
        const selection = selections[i]
        let text = editor.document.getText(selection.with(selection.start.with(undefined, 0)))
        let width = stringWidth(text)
        insertSpaces[i] = width
        maxStringWidth = Math.max(maxStringWidth, width)
    }
    maxStringWidth++
    for (let i = 0; i < insertSpaces.length; i++) {
        const insertSpace = insertSpaces[i]
        insertSpaces[i] = maxStringWidth - insertSpace
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
    return text.replace(/\x1b\[[\d;]+?m/g, '')
}

/**
 * @param {String} text 
 */
export async function cleanDiffChange(text) {
    let s = splitText(text)
    return s.lines.filter(o => !o.match(/^\s+\-/)).map(o => o.replace(/^(\s+)\+/, '$1 ')).join('\n') + s.end
}

export const sleep = (/** @type {number} */ timeout) => new Promise((resolve) => setTimeout(resolve, timeout))

/**
 * @param {import("crypto").BinaryLike} text
 */
export async function md5(text) {
    const hash = createHash('md5')
    hash.update(text)
    return hash.digest('hex')
}
/**
 * @param {import("crypto").BinaryLike} text
 */
export async function sha1(text) {
    const hash = createHash('sha1')
    hash.update(text)
    return hash.digest('hex')
}
/**
 * @param {import("crypto").BinaryLike} text
 */
export async function sha256(text) {
    const hash = createHash('sha256')
    hash.update(text)
    return hash.digest('hex')
}
/**
 * @param {import("crypto").BinaryLike} text
 */
export async function sha512(text) {
    const hash = createHash('sha512')
    hash.update(text)
    return hash.digest('hex')
}

export function nameGenerateGet() {
    const nameCode = '鑫正涵琛妍芸露楠薇锦彤采初美冬婧桐莲彩洁'
        + '呈菡怡冰雯雪茜优静萱林馨鹤梅娜璐曼彬芳颖韵曦蔚桂月梦琪蕾'
        + '依碧枫欣杉丽祥雅欢婷舒心紫芙慧梓香玥菲璟茹昭岚玲云华阳弦'
        + '莉明珊雨蓓旭钰柔敏家凡花媛歆沛姿妮珍琬彦倩玉柏橘昕桃栀克'
        + '帆俊惠漫芝寒诗春淑凌珠灵可格璇函晨嘉鸿瑶帛琳文洲娅霞颜康'
        + '卓星礼远帝裕腾震骏加强运杞良梁逸禧辰佳子栋博年振荣国钊喆'
        + '睿泽允邦骞哲皓晖福濡佑然升树祯贤成槐锐芃驰凯韦信宇鹏盛晓'
        + '翰海休浩诚辞轩奇潍烁勇铭平瑞仕谛翱伟安延锋寅起谷稷胤涛弘'
        + '侠峰材爵楷尧炳乘蔓桀恒桓日坤龙锟天郁吉暄澄中斌杰祜权畅德'

    let length = [3, 2, 4, 5][Math.floor(Math.random() * Math.random() * 3.1)]
    let name = []
    while (length--) {
        name.push(nameCode[Math.floor(Math.random() * nameCode.length)])
    }
    return name.join('')
}

/**
 * @param {string} obj
 */
export function jsonDeepParse(obj) {
    /** @type{object} */
    let o = obj
    if (typeof (obj) == 'string') {
        try {
            o = JSON.parse(obj)
        } catch (e) {
            try {
                if (o.length < 33) {
                    return o
                }
                o = evalParser(o)
                return jsonDeepParse(o)
            } catch (e1) {
                return o
            }
        }
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
    let info = new JSONInfo((/** @type {any} */ o) => o, maxLines)
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
 * @param {object[]} list
 */
export function asciitable(list) {
    // 处理空值情况
    if (!list || list.length === 0) return ""

    let cleanlist = list.map(o => {
        let a = { ...o }
        let keys = Object.keys(a)
        for (const k of keys) {
            let v = a[k]
            if (typeof v == 'string') {
                a[k] = v.replace(/[\x00-\x1F\x7F]/g, ' ')
            }
        }
        return a
    })
    list = cleanlist

    // 自动检测数据结构
    const isObjectArray = list.every(item =>
        typeof item === "object" && !Array.isArray(item)
    )

    // 构建表头和行数据
    let headers, rows
    if (isObjectArray) {
        headers = Object.keys(list[0])
        rows = list.map(obj => headers.map(header => obj[header]))
    } else {
        headers = Array.from({ length: list[0].length }, (_, i) => i.toString())
        rows = list
    }

    // 生成表格配置
    const config = {
        border: tableConfig.border,
        columns: headers.reduce((acc, _) => {
            acc.push({ alignment: "left" })
            return acc
        }, []),
        drawHorizontalLine: (/** @type {number} */ lineIndex, /** @type {number} */ rowCount) =>
            lineIndex <= 1 || lineIndex === rowCount
    }

    return table([headers, ...rows], config)
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
 * @param {string} text
 */
export async function todo(text, [ref1 = 'HEAD~4', ref2 = 'HEAD']) {
    return '>>> ' + text
}

/**
 * @param {string} text
 */
export function extractTypesFromString(text) {
    let isJson = false
    if (text.trim().startsWith('[') || text.trim().startsWith('{')) {
        isJson = true
    }
    return extractTypesFromSource(text, isJson, {
        allowJs: true,
        declaration: true,
        emitDeclarationOnly: true,
    })
}

/**
 * @param {string} text
 */
export function formatMultiLineComment(text) {
    return text.replace(/(^|\n)(.*?\/\*[\s\S]*?\*\/)/g, (a, b, c) => {
        /** @type{string[]} */
        let lines = c.split(/\r?\n/)
        if (lines.length < 2) {
            return a
        }
        let results = []
        let indent = ' '
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i]
            if (i == 0 && line.trim().startsWith('/**')) {
                indent = ' '.repeat(line.indexOf('/**') + 1)
                results.push(line)
                continue
            }
            if (i == lines.length - 1 && line.trim() == '*/') {
                results.push(`${indent}${line.trimStart()}`)
                continue
            }
            results.push(line.replace(/\s*\* ?/, `${indent}* `))
        }
        return a.replace(c, results.join('\n'))
    })
}

export function randomNumber() {
    return String(randomBytes(4).readUInt32LE())
}
export function randomHex() {
    return randomBytes(4).toString('hex')
}


/**
 * 翻译
 * 
 * @param {string} url 
 * @param {string} lang 
 * @param {string} text 
 * @returns 
 */
export async function translate(url, lang, text) {
    return await (await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json', },
        body: JSON.stringify({ lang, text, })
    })).text()
}

/**
 * @param {string} rootPath 
 * @param {CommandItem[]} commands 
 */
export async function updatePackageJsonCommands(rootPath, commands) {
    let package_json_path = rootPath + '/package.json'
    let json = JSON.parse(await readFile(package_json_path, 'utf-8'))
    let items = []
    for (const command of commands) {
        /** @type{ContributeCommandItem} */
        const item = {
            command: `tools:${command.id}`,
            title: `${command.label}`,
        }
        if (command.icon) {
            item.icon = command.icon
        }
        items.push(item)
    }
    let isSame = json.contributes.commands?.length == items.length
    if (isSame) {
        for (let index = 0; index < items.length; index++) {
            const itemNew = items[index]
            /** @type{ContributeCommandItem} */
            const itemOld = json.contributes.commands[index]
            if (itemNew.command != itemOld.command || itemNew.title != itemOld.title || itemNew.icon != itemOld.icon) {
                isSame = false
                break
            }
        }
    }
    if (!isSame) {
        json.contributes.commands = items
        await writeFile(package_json_path, JSON.stringify(json, null, 4))
        console.log('update package.json commands over!')
    }
}

/**
 * @param {string | number} num
 */
export function nzhCnEncodeS(num) {
    return nzh.cn.encodeS(num)
}

/**
 * @param {string | number} num
 */
export function nzhCnEncodeB(num) {
    return nzh.cn.encodeB(num)
}

/**
 * 随机排序
 * @template T
 * @param {T[]} datas 
 * @returns {T[]} 返回随机排序后的新数组
 */
export function shuffle(datas) {
    let loopCount = datas.length
    for (let i = loopCount - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [datas[i], datas[j]] = [datas[j], datas[i]]
    }
    return datas
}

/**
 * @param {string} url 
 * @param {string} message 
 */
export async function chatgpt(url, message) {
    return await (await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/text', },
        body: message
    })).text()
}


/**
 * @param {string} content 
 */
export function parseChatPrompts(content) {
    let lines = content.split('\n')
    /** @type{CHAT_PROMPT[]} */
    let prompts = []
    let title = ''
    let texts = []
    for (const line of lines) {
        if (line.startsWith('## ')) {
            if (title && texts.length > 0) {
                prompts.push({ title, prompt: texts.join('\n').trim() })
            }
            title = line.trim()
            texts = []
        } else {
            texts.push(line)
        }
    }
    if (title && texts.length > 0) {
        prompts.push({ title, prompt: texts.join('\n').trim() })
    }
    return prompts
}

export const CHAT_PLACEHOLDER_SELECTION = '{SELECTION}'

/**
 * 按时间分组（带持续时间标记）
 * @param {string} text
 * @param {number} duration
 */
export async function lineGroupTime(text, duration) {
    let lines = text.split(/\r?\n/)
    let arr = []
    let lastTime = 0
    for (const line of lines) {
        let time = parseTime(line)
        if (time - lastTime > duration) {
            arr.push(`\n\n    ######## wait duration : ${time - lastTime}`)
        }
        if (time > 0) {
            lastTime = time
        }
        arr.push(line)
    }
    return arr.join('\n')
}

/**
 * 按时间打包统计
 * @param {string} text
 * @param {number} duration
 */
export async function linePackTime(text, duration) {
    let lines = text.split(/\r?\n/)
    let arr = []
    let lastTime = 0
    let time = 0
    let count = 0
    for (const line of lines) {
        time = parseTime(line)
        if (time <= 0) {
            continue
        }
        count++
        if (time - lastTime > duration) {
            arr.push(`${dayjs(lastTime).format('YYYY-MM-DD HH:mm:ss.SSS')} ~ ${dayjs(time).format('YYYY-MM-DD HH:mm:ss.SSS')} ·: ${count}`)
            lastTime = time
            count = 0
        }
    }
    if (count > 0) {
        arr.push(`${dayjs(lastTime).format('YYYY-MM-DD HH:mm:ss.SSS')} ~ ${dayjs(time).format('YYYY-MM-DD HH:mm:ss.SSS')} ·: ${count}`)
    }
    return arr.join('\n')
}

/**
 * 添加行号
 * @param {number} startNumber
 * @param {string} text
 */
export async function lineAddNumber(startNumber, text) {
    let lines = text.split('\n')
    return lines.map((line, index) => `${startNumber + index} ${line}`).join('\n')
}

/**
 * 删除行号
 * @param {string} text
 */
export async function lineRemoveNumber(text) {
    return text.replace(/^\s*\d+\s+/gm, '')
}

/**
 * JWT Token 解码
 * @param {string} text
 */
export async function jwtDecode(text) {
    try {
        let parts = text.trim().split('.')
        if (parts.length !== 3) {
            return 'Invalid JWT format'
        }
        let header = JSON.parse(Buffer.from(parts[0], 'base64').toString())
        let payload = JSON.parse(Buffer.from(parts[1], 'base64').toString())
        return JSON.stringify({ header, payload }, null, 2)
    } catch (error) {
        return `Error: ${error.message}`
    }
}

/**
 * @param {any} o
 * @param {number} maxDepth
 */
export function stringifyWithDepth(o, maxDepth = 3) {
    let s = JSON.stringify(o)
    let i = 0
    let deep = 0
    let format = ''
    while (i < s.length) {
        let c = s[i]

        if (['{', '['].includes(c)) {
            deep++
            format += c
            i++

            // 只在深度限制内进行格式化
            if (deep < maxDepth) {
                format += '\n' + ' '.repeat(deep * 4)
            }
            continue
        }

        if (['}', ']'].includes(c)) {
            // 只在深度限制内添加换行和缩进
            if (deep < maxDepth && deep > 0) {
                format += '\n' + ' '.repeat((deep - 1) * 4)
            }
            deep = Math.max(0, deep - 1) // 防止负数
            format += c
            i++
            continue
        }

        if ('\\' == c) {
            format += c
            i++
            if (i < s.length) { // 边界检查
                c = s[i]
                format += c
                i++
            }
            continue
        }

        // 处理逗号
        if (',' === c) {
            format += c
            i++
            // 只在深度限制内添加换行和缩进
            if (deep < maxDepth) {
                format += '\n' + ' '.repeat(deep * 4)
            }
            continue
        }

        // 普通字符
        format += c
        i++
    }
    return format
}