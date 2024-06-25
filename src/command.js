import { setupGitCommitHoverProvider, setupTranslateHoverProvider, getAllText, getInputSeparator, getInputStartNumber, getRegexpText, getSelectText, getTranslateIks, registerDocumentFormattingEditProviderCSS, updatePackageJsonCommands, setupTimeFormatHoverProvider } from './tools.js'
import { pasteImage } from './ocr.js'
import vscode from 'vscode'
import { NameGenerate, addLineNumber, addLineNumberFromInput, addLineNumberWithSeparator, chatgpt, cleanAnsiEscapeCodes, clearDiffChanges, commentAlign, currentTime, cursorAlign, decodeBase64, decodeCoffee, decodeHex, decodeHtml, decodeLess, decodeNative, decodeUnescape, decodeUnicode, decodeUri, encodeBase64, encodeEscape, encodeHex, encodeHtml, encodeNative, encodeUnicode, encodeUri, escapeSimple, escapeWithcrlf, evalPrint, extractTypesFromString, firstLetterLowercase, firstLetterUppercase, formatBytes, formatCSS, formatJS, formatJSON, formatSQL, formatTime, formatXML, getGitApi, gitFetchAll, guid, jsonDeepParse, lineGroupDuplicate, lineRemoveDuplicate, lineRemoveEmpty, lineRemoveExcludeSelect, lineRemoveIncludeSelect, lineRemoveMatchRegexp, lineRemoveNotMatchRegexp, lineReverse, lineSortAsc, lineSortDesc, lineSortNumber, lineTrim, lineTrimLeft, lineTrimRight, markdownToHtml, md5, minCSS, minJSON, minSQL, minXML, parseJSON, parseJSONInfo, previewHTML, rearrangeJsonKey, runCode, separatorHumpToUnderline, separatorUnderlineToHump, sha1, sha256, sha512, showChange, showGitBlame, showGitLogGraph, showGitLogGraphAll, showGitLogGraphOneline, stringify, todo } from './lib.js'
import { translate } from './translate.js'
import { config, extensionContext } from './config.js'
import Nzh from 'nzh'
import { evalParser, extractJsonFromString } from 'extract-json-from-string-y'

/**
 * @typedef {Object} EditOptions 命令选项
 * @property {boolean} [append] 在当前光标位置之后插入内容
 * @property {boolean} [insert] 替换当前光标选中的内容 
 * @property {boolean} [noChange] 不修改文档内容
 * @property {boolean} [replace] 替换整篇文档内容
 * @property {boolean} [handleEmptySelection] 处理空的光标选中位置
 * @property {number} [insertNewLines] 在当前光标位置之后插入多个新行
 * @property {boolean} [noEditor] 不需要打开的文档
 */

/**
 * @typedef {(text:String)=>(Promise<String>|string)} EditCallback
 */

/**
 * @type {{
 *   id: string;
 *   label: string;
 *   icon?: string;
 *   run: (ed: any, args:any[]|any) => Promise<void>;
 * }[]} 
 */
export const commands = [
    {
        id: 'y-ocr',
        label: 'OCR',
        run: async function (/**@type{vscode.TextEditor}*/ed) {
            let text = await pasteImage()
            editText(ed, { insert: true }, () => {
                return text
            })
        }
    },
    {
        id: 'y-remove-empty',
        label: 'Line Remove Empty',
        run: async function (/**@type{vscode.TextEditor}*/ed) {
            editText(ed, {}, (text) => {
                return lineRemoveEmpty(text)
            })
        }
    },
    {
        id: 'y-remove-duplicate',
        label: 'Line Remove Duplicate',
        run: async function (/**@type{vscode.TextEditor}*/ed) {
            editText(ed, {}, (text) => {
                return lineRemoveDuplicate(text)
            })
        }
    },
    {
        id: 'y-remove-include-select',
        label: 'Line Remove Include Select',
        run: async function (/**@type{vscode.TextEditor}*/ed) {
            let selection = getSelectText(ed)
            let doc = getAllText(ed)
            if (!selection) return
            editText(ed, { replace: true }, () => {
                return lineRemoveIncludeSelect(selection, doc)
            })
        }
    },
    {
        id: 'y-remove-exclude-select',
        label: 'Line Remove Exclude Select',
        run: async function (/**@type{vscode.TextEditor}*/ed) {
            let selection = getSelectText(ed)
            let doc = getAllText(ed)
            if (!selection) return
            editText(ed, { replace: true }, () => {
                return lineRemoveExcludeSelect(selection, doc)
            })
        }
    },
    {
        id: 'y-remove-match-regexp',
        label: 'Line Remove Match Regexp',
        run: async function (/**@type{vscode.TextEditor}*/ed) {
            let regexp = await getRegexpText()
            let doc = getAllText(ed)
            if (!regexp) return
            editText(ed, { replace: true }, () => {
                return lineRemoveMatchRegexp(doc, regexp)
            })
        }
    },
    {
        id: 'y-remove-not-match-regexp',
        label: 'Line Remove Not Match Regexp',
        run: async function (/**@type{vscode.TextEditor}*/ed) {
            let regexp = await getRegexpText()
            let doc = getAllText(ed)
            if (!regexp) return
            editText(ed, { replace: true }, () => {
                return lineRemoveNotMatchRegexp(doc, regexp)
            })
        }
    },
    {
        id: 'y-line-sort-asc',
        label: 'Line Sort Asc',
        run: async function (/**@type{vscode.TextEditor}*/ed) {
            editText(ed, {}, (text) => {
                return lineSortAsc(text)
            })
        }
    },
    {
        id: 'y-line-sort-desc',
        label: 'Line Sort Desc',
        run: async function (/**@type{vscode.TextEditor}*/ed) {
            editText(ed, {}, (text) => {
                return lineSortDesc(text)
            })
        }
    },
    {
        id: 'y-line-trim',
        label: 'Line Trim',
        run: async function (/**@type{vscode.TextEditor}*/ed) {
            editText(ed, {}, (text) => {
                return lineTrim(text)
            })
        }
    },
    {
        id: 'y-line-trim-left',
        label: 'Line Trim Left',
        run: async function (/**@type{vscode.TextEditor}*/ed) {
            editText(ed, {}, (text) => {
                return lineTrimLeft(text)
            })
        }
    },
    {
        id: 'y-line-trim-right',
        label: 'Line Trim Right',
        run: async function (/**@type{vscode.TextEditor}*/ed) {
            editText(ed, {}, (text) => {
                return lineTrimRight(text)
            })
        }
    },
    {
        id: 'y-line-add-line-number',
        label: 'Line Add Line Number',
        run: async function (/**@type{vscode.TextEditor}*/ed) {
            editText(ed, {}, (text) => {
                return addLineNumber(text)
            })
        }
    },
    {
        id: 'y-line-add-line-number-from-input',
        label: 'Line Add Line Number From Input',
        run: async function (/**@type{vscode.TextEditor}*/ed) {
            let startNumber = await getInputStartNumber()
            editText(ed, {}, (text) => {
                return addLineNumberFromInput(text, startNumber)
            })
        }
    },
    {
        id: 'y-line-add-line-number-with-separator',
        label: 'Line Add Line Number With Separator',
        run: async function (/**@type{vscode.TextEditor}*/ed) {
            let separator = await getInputSeparator()
            editText(ed, {}, (text) => {
                return addLineNumberWithSeparator(text, separator)
            })
        }
    },
    {
        id: 'y-line-separator-underline-to-hump',
        label: 'Line Separator Underline To Hump',
        run: async function (/**@type{vscode.TextEditor}*/ed) {
            editText(ed, {}, (text) => {
                return separatorUnderlineToHump(text)
            })
        }
    },
    {
        id: 'y-line-separator-hump-to-underline',
        label: 'Line Separator Hump To Underline',
        run: async function (/**@type{vscode.TextEditor}*/ed) {
            editText(ed, {}, (text) => {
                return separatorHumpToUnderline(text)
            })
        }
    },
    {
        id: 'y-line-first-letter-lowercase',
        label: 'Line First Letter Lowercase',
        run: async function (/**@type{vscode.TextEditor}*/ed) {
            editText(ed, {}, (text) => {
                return firstLetterLowercase(text)
            })
        }
    },
    {
        id: 'y-line-first-letter-uppercase',
        label: 'Line First Letter Uppercase',
        run: async function (/**@type{vscode.TextEditor}*/ed) {
            editText(ed, {}, (text) => {
                return firstLetterUppercase(text)
            })
        }
    },
    {
        id: 'y-line-group-duplicate',
        label: 'Line Group Duplicate',
        run: async function (/**@type{vscode.TextEditor}*/ed) {
            editText(ed, {}, (text) => {
                return lineGroupDuplicate(text)
            })
        }
    },
    {
        id: 'y-line-sort-number',
        label: 'Line Sort Number',
        run: async function (/**@type{vscode.TextEditor}*/ed) {
            editText(ed, {}, (text) => {
                return lineSortNumber(text)
            })
        }
    },
    {
        id: 'y-line-reverse',
        label: 'Line Reverse',
        run: async function (/**@type{vscode.TextEditor}*/ed) {
            editText(ed, {}, (text) => {
                return lineReverse(text)
            })
        }
    },
    {
        id: 'y-line-group-duplicate-sort-number-reverse',
        label: 'Line Group Duplicate Sort Number Reverse',
        run: async function (/**@type{vscode.TextEditor}*/ed) {
            editText(ed, {}, async (text) => {
                return await lineReverse(await lineSortNumber(await lineGroupDuplicate(text)))
            })
        }
    },
    {
        id: 'y-line-replace-backslash-to-slash',
        label: 'Line Replace Backslash(\\) To Slash(/)',
        run: async function (/**@type{vscode.TextEditor}*/ed) {
            editText(ed, {}, async (text) => {
                return text.replaceAll('\\', '/')
            })
        }
    },
    {
        id: 'y-guid',
        label: 'guid',
        run: async function (/**@type{vscode.TextEditor}*/ed) {
            editText(ed, { insert: true }, async () => {
                return await guid()
            })
        }
    },
    {
        id: 'y-current-time',
        label: 'Current Time',
        run: async function (/**@type{vscode.TextEditor}*/ed) {
            editText(ed, { insert: true }, async () => {
                return await currentTime()
            })
        }
    },
    {
        id: 'y-format-time',
        label: 'Format Time',
        run: async function (/**@type{vscode.TextEditor}*/ed) {
            editText(ed, {}, async (text) => {
                return await formatTime(text)
            })
        }
    },
    {
        id: 'y-format-bytes',
        label: 'Format bytes',
        run: async function (/**@type{vscode.TextEditor}*/ed) {
            editText(ed, {}, async (text) => {
                return await formatBytes(text)
            })
        }
    },
    {
        id: 'y-run-code',
        label: 'Run Code',
        run: async function (/**@type{vscode.TextEditor}*/ed) {
            editText(ed, {}, async (text) => {
                return await runCode(text)
            })
        }
    },
    {
        id: 'y-eval-print',
        label: 'Eval Print',
        run: async function (/**@type{vscode.TextEditor}*/ed) {
            editText(ed, {}, async (text) => {
                return await evalPrint(text)
            })
        }
    },
    {
        id: 'y-comment-align',
        label: 'Comment Align',
        run: async function (/**@type{vscode.TextEditor}*/ed) {
            editText(ed, {}, async (text) => {
                return await commentAlign(text)
            })
        }
    },
    // ==============
    {
        id: "y-cursor-align",
        label: "Cursor Align",
        run: async function (/**@type{vscode.TextEditor}*/ed) {
            const func = await cursorAlign(ed)
            editText(ed, { insert: true }, async () => {
                return func()
            })
        }
    },
    {
        id: "y-clean-ansi-escape-codes",
        label: "Clean ANSI Escape Codes",
        run: async function (/**@type{vscode.TextEditor}*/ed) {
            editText(ed, {}, async (text) => {
                return await cleanAnsiEscapeCodes(text)
            })
        }
    },
    {
        id: "y-js-format",
        label: "JS format",
        run: async function (/**@type{vscode.TextEditor}*/ed) {
            editText(ed, {}, async (text) => {
                return await formatJS(text)
            })
        }
    },
    {
        id: "y-css-format",
        label: "CSS format",
        run: async function (/**@type{vscode.TextEditor}*/ed) {
            editText(ed, {}, async (text) => {
                return await formatCSS(text)
            })
        }
    },
    {
        id: "y-sql-format",
        label: "SQL format",
        run: async function (/**@type{vscode.TextEditor}*/ed) {
            editText(ed, {}, async (text) => {
                return await formatSQL(text)
            })
        }
    },
    {
        id: "y-xml-format",
        label: "XML format",
        run: async function (/**@type{vscode.TextEditor}*/ed) {
            editText(ed, {}, async (text) => {
                return await formatXML(text)
            })
        }
    },
    {
        id: "y-json-format",
        label: "JSON format",
        run: async function (/**@type{vscode.TextEditor}*/ed) {
            editText(ed, {}, async (text) => {
                return await formatJSON(text)
            })
        }
    },
    {
        id: "y-sql-min",
        label: "SQL min",
        run: async function (/**@type{vscode.TextEditor}*/ed) {
            editText(ed, {}, async (text) => {
                return await minSQL(text)
            })
        }
    },
    {
        id: "y-xml-min",
        label: "XML min",
        run: async function (/**@type{vscode.TextEditor}*/ed) {
            editText(ed, {}, async (text) => {
                return await minXML(text)
            })
        }
    },
    {
        id: "y-css-min",
        label: "CSS min",
        run: async function (/**@type{vscode.TextEditor}*/ed) {
            editText(ed, {}, async (text) => {
                return await minCSS(text)
            })
        }
    },
    {
        id: "y-json-min",
        label: "JSON min",
        run: async function (/**@type{vscode.TextEditor}*/ed) {
            editText(ed, {}, async (text) => {
                return await minJSON(text)
            })
        }
    },
    {
        id: 'y-codec-deep-parse-json',
        label: 'deep parse JSON',
        run: async function (ed) {
            editText(ed, {}, (text) => {
                return formatJSON(JSON.stringify(jsonDeepParse(text)))
            })
        }
    },
    {
        id: 'y-codec-rearrange-json-key',
        label: 'rearrange JSON key',
        run: async function (ed) {
            editText(ed, {}, (text) => {
                return formatJSON(rearrangeJsonKey(JSON.parse(text)))
            })
        }
    },
    {
        id: 'y-json-info',
        label: 'JSON Info',
        run: async (ed) => {
            editText(ed, { append: true }, async (text) => {
                return vscode.window.withProgress({ location: vscode.ProgressLocation.Window, title: "..." }, async () => {
                    try {
                        return await parseJSONInfo(text)
                    } catch (error) {
                        console.error(error)
                        vscode.window.showErrorMessage(error.stack)
                        return error.stack
                    }
                })
            })
        }
    },
    {
        id: 'y-codec-normalize-json',
        label: 'normalize JSON',
        run: async function (ed) {
            editText(ed, {}, (text) => {
                return JSON.stringify(evalParser(text), null, 4)
            })
        }
    },
    {
        id: 'y-extract-json',
        label: 'extract JSON',
        run: async function (ed) {
            editText(ed, {}, (text) => {
                let json = extractJsonFromString(text)
                return formatJSON(JSON.stringify(json))
            })
        }
    },
    {
        id: 'y-extract-types',
        label: 'extract js|json types',
        run: async function (ed) {
            editText(ed, {}, (text) => {
                let types = extractTypesFromString(text)
                return types
            })
        }
    },
    {
        id: "y-crypto-md5",
        label: "Crypto md5",
        run: async function (/**@type{vscode.TextEditor}*/ed) {
            editText(ed, {}, async (text) => {
                return await md5(text)
            })
        }
    },
    {
        id: "y-crypto-sha1",
        label: "Crypto sha1",
        run: async function (/**@type{vscode.TextEditor}*/ed) {
            editText(ed, {}, async (text) => {
                return await sha1(text)
            })
        }
    },
    {
        id: "y-crypto-sha256",
        label: "Crypto sha256",
        run: async function (/**@type{vscode.TextEditor}*/ed) {
            editText(ed, {}, async (text) => {
                return await sha256(text)
            })
        }
    },
    {
        id: "y-crypto-sha512",
        label: "Crypto sha512",
        run: async function (/**@type{vscode.TextEditor}*/ed) {
            editText(ed, {}, async (text) => {
                return await sha512(text)
            })
        }
    },
    {
        id: "y-decode-json-parse",
        label: "Decode json parse",
        run: async function (/**@type{vscode.TextEditor}*/ed) {
            editText(ed, {}, async (text) => {
                return await parseJSON(text)
            })
        }
    },
    {
        id: "y-encode-json-stringify",
        label: "Encode json stringify",
        run: async function (/**@type{vscode.TextEditor}*/ed) {
            editText(ed, {}, async (text) => {
                return await stringify(text)
            })
        }
    },
    {
        id: "y-encode-uri",
        label: "Encode uri",
        run: async function (/**@type{vscode.TextEditor}*/ed) {
            editText(ed, {}, async (text) => {
                return await encodeUri(text)
            })
        }
    },
    {
        id: "y-decode-uri",
        label: "Decode uri",
        run: async function (/**@type{vscode.TextEditor}*/ed) {
            editText(ed, {}, async (text) => {
                return await decodeUri(text)
            })
        }
    },
    {
        id: "y-encode-base64",
        label: "Encode base64",
        run: async function (/**@type{vscode.TextEditor}*/ed) {
            editText(ed, {}, async (text) => {
                return await encodeBase64(text)
            })
        }
    },
    {
        id: "y-decode-base64",
        label: "Decode base64",
        run: async function (/**@type{vscode.TextEditor}*/ed) {
            editText(ed, {}, async (text) => {
                return await decodeBase64(text)
            })
        }
    },
    {
        id: "y-encode-hex",
        label: "Encode hex",
        run: async function (/**@type{vscode.TextEditor}*/ed) {
            editText(ed, {}, async (text) => {
                return await encodeHex(text)
            })
        }
    },
    {
        id: "y-decode-hex",
        label: "Decode hex",
        run: async function (/**@type{vscode.TextEditor}*/ed) {
            editText(ed, {}, async (text) => {
                return await decodeHex(text)
            })
        }
    },
    {
        id: "y-encode-html",
        label: "Encode html",
        run: async function (/**@type{vscode.TextEditor}*/ed) {
            editText(ed, {}, async (text) => {
                return await encodeHtml(text)
            })
        }
    },
    {
        id: "y-decode-html",
        label: "Decode html",
        run: async function (/**@type{vscode.TextEditor}*/ed) {
            editText(ed, {}, async (text) => {
                return await decodeHtml(text)
            })
        }
    },
    {
        id: "y-encode-native",
        label: "Encode native",
        run: async function (/**@type{vscode.TextEditor}*/ed) {
            editText(ed, {}, async (text) => {
                return await encodeNative(text)
            })
        }
    },
    {
        id: "y-decode-native",
        label: "Decode native",
        run: async function (/**@type{vscode.TextEditor}*/ed) {
            editText(ed, {}, async (text) => {
                return await decodeNative(text)
            })
        }
    },
    {
        id: "y-encode-unicode",
        label: "Encode unicode",
        run: async function (/**@type{vscode.TextEditor}*/ed) {
            editText(ed, {}, async (text) => {
                return await encodeUnicode(text)
            })
        }
    },
    {
        id: "y-decode-unicode",
        label: "Decode unicode",
        run: async function (/**@type{vscode.TextEditor}*/ed) {
            editText(ed, {}, async (text) => {
                return await decodeUnicode(text)
            })
        }
    },
    {
        id: "y-encode-escape",
        label: "Encode escape",
        run: async function (/**@type{vscode.TextEditor}*/ed) {
            editText(ed, {}, async (text) => {
                return await encodeEscape(text)
            })
        }
    },
    {
        id: "y-encode-escape-simple",
        label: "Encode escape simple",
        run: async function (/**@type{vscode.TextEditor}*/ed) {
            editText(ed, {}, async (text) => {
                return await escapeSimple(text)
            })
        }
    },
    {
        id: "y-encode-escape-with-crlf",
        label: "Encode escape with crlf",
        run: async function (/**@type{vscode.TextEditor}*/ed) {
            editText(ed, {}, async (text) => {
                return await escapeWithcrlf(text)
            })
        }
    },
    {
        id: "y-decode-unescape",
        label: "Decode unescape",
        run: async function (/**@type{vscode.TextEditor}*/ed) {
            editText(ed, {}, async (text) => {
                return await decodeUnescape(text)
            })
        }
    },
    {
        id: "y-translate-coffeescript-to-javascript",
        label: "Translate coffeescript to javascript",
        run: async function (/**@type{vscode.TextEditor}*/ed) {
            editText(ed, {}, async (text) => {
                return await decodeCoffee(text)
            })
        }
    },
    {
        id: "y-translate-less-to-css",
        label: "Translate less to css",
        run: async function (/**@type{vscode.TextEditor}*/ed) {
            editText(ed, {}, async (text) => {
                return await decodeLess(text)
            })
        }
    },
    {
        id: "y-translate-markdown-to-html",
        label: "Translate markdown to html",
        run: async function (/**@type{vscode.TextEditor}*/ed) {
            editText(ed, {}, async (text) => {
                return await markdownToHtml(text)
            })
        }
    },
    {
        id: "y-translate-translate-to-zh",
        label: "Translate translate to zh",
        run: async function (/**@type{vscode.TextEditor}*/ed) {
            let iks = getTranslateIks()
            if (!iks) return
            editText(ed, {}, async (text) => {
                return await translate(iks, 'zh', text)
            })
        }
    },
    {
        id: "y-translate-translate-to-en",
        label: "Translate translate to en",
        run: async function (/**@type{vscode.TextEditor}*/ed) {
            let iks = getTranslateIks()
            if (!iks) return
            editText(ed, {}, async (text) => {
                return await translate(iks, 'en', text)
            })
        }
    },
    {
        id: "y-translate-toggle-translate",
        label: "Translate toggle translate",
        run: async function (/**@type{vscode.TextEditor}*/ed) {
            editText(ed, { noChange: true }, async () => {
                if (extensionContext.translateDisposable) {
                    extensionContext.translateDisposable.dispose()
                    extensionContext.translateDisposable = null
                } else {
                    extensionContext.translateDisposable = vscode.window.setStatusBarMessage(`Baidu Translate is enable!`)
                }
                return null
            })
        }
    },
    ...buildChatGPTCommands(),
    {
        id: "y-lorem",
        label: "lorem",
        run: async function (/**@type{vscode.TextEditor}*/ed) {
            editText(ed, { insert: true }, async () => {
                return `Lorem ipsum dolor sit amet consectetur adipisicing elit. Deserunt nulla quisquam blanditiis fugit quia beatae, ducimus in provident commodi similique, necessitatibus quae exercitationem doloribus hic impedit maxime voluptate velit consequuntur?`
            })
        }
    },
    {
        id: "y-sequence-number-1",
        label: "sequence number 1",
        run: async function (/**@type{vscode.TextEditor}*/ed) {
            let seq = 1
            editText(ed, { insert: true }, async () => {
                return `${seq++}`
            })
        },
    },
    {
        id: "y-sequence-number-一",
        label: "sequence number 一",
        run: async function (/**@type{vscode.TextEditor}*/ed) {
            let seq = 1
            editText(ed, { insert: true }, async () => {
                return Nzh.cn.encodeS(seq++)
            })
        },
    },
    {
        id: "y-sequence-number-壹",
        label: "sequence number 壹",
        run: async function (/**@type{vscode.TextEditor}*/ed) {
            let seq = 1
            editText(ed, { insert: true }, async () => {
                return Nzh.cn.encodeB(seq++)
            })
        },
    },
    {
        id: "y-xing-ming",
        label: "xing ming",
        run: async function (/**@type{vscode.TextEditor}*/ed) {
            let g = new NameGenerate()
            editText(ed, { insert: true }, async () => {
                return g.get()
            })
        },
    },
    buildSequenceNum("a", 0),
    buildSequenceNum("A", 0),
    buildSequenceNum("①", 0),
    buildSequenceNum("Ⅰ", 0),
    buildSequenceNum("ⅰ", 0),
    buildSequenceNum("㍘", 0),
    buildSequenceNum("㎀", 0),
    buildSequenceNum("㏠", 0),
    buildSequenceNum("😀", 0),
    buildSequenceNum("👩", 0),
    buildSequenceNum("💪", 0),
    buildSequenceNum("🎈", 0),
    buildSequenceNum("🍕", 0),
    buildSequenceNum("🚗", 0),
    buildSequenceNum("❤", 0),
    buildSequenceNum("☮", 0),
    buildSequenceNum("0️⃣", 0),
    buildSequenceNum("🔴", 0),
    buildSequenceNum("🟥", 0),
    buildSequenceNum("🔶", 0),
    buildSequenceNum("🕐", 0),
    {
        id: "y-full-space",
        label: "full space",
        run: async function (/**@type{vscode.TextEditor}*/ed) {
            editText(ed, {}, async (text) => {
                return ' '.repeat(text.length)
            })
        },
    },
    {
        id: "y-cursors-drop",
        label: "cursors drop",
        run: async function (/**@type{vscode.TextEditor}*/ed) {
            let selections = ed.selections
            let tmp = []
            for (let i = 0; i < selections.length; i += 2) {
                const element = selections[i]
                tmp.push(element)
            }
            ed.selections = tmp
        },
    },
    {
        id: "y-numbers-summation",
        label: "numbers summation 求和",
        run: async function (/**@type{vscode.TextEditor}*/ed) {
            editText(ed, { append: true }, async (text) => {
                let match = text.split(/[ ,;\r\n\t"]/) || []
                let numbers = match.map((o) => parseFloat(o)).filter((o) => !isNaN(o))
                return `summation: ${numbers.reduce((p, c) => p + c, 0)}`
            })
        },
    },
    {
        id: "y-numbers-average",
        label: "numbers average 求平均值",
        run: async function (/**@type{vscode.TextEditor}*/ed) {
            editText(ed, { append: true }, async (text) => {
                let match = text.split(/[ ,;\r\n\t"]/) || []
                let numbers = match.map((o) => parseFloat(o)).filter((o) => !isNaN(o))
                return `average: ${numbers.reduce((p, c) => p + c, 0) / numbers.length}`
            })
        },
    },
    {
        id: "y-show-change",
        label: "git show change",
        run: async function (/**@type{vscode.TextEditor}*/ed, args) {
            console.log('show change', args)
            return showChange(args)
        },
    },
    {
        id: "y-show-blame",
        label: "git show blame",
        run: async function (/**@type{vscode.TextEditor}*/ed, args) {
            return showGitBlame()
        },
    },
    {
        id: "y-show-graph",
        label: "git show log graph",
        run: async function (/**@type{vscode.TextEditor}*/ed, args) {
            return showGitLogGraph()
        },
    },
    {
        id: "y-show-graph-all",
        label: "git show log graph all",
        run: async function (/**@type{vscode.TextEditor}*/ed, args) {
            return showGitLogGraphAll()
        },
    },
    {
        id: "y-show-graph-oneline",
        label: "git show log graph oneline",
        run: async function (/**@type{vscode.TextEditor}*/ed, args) {
            return showGitLogGraphOneline()
        },
    },
    {
        id: "y-git-fetch-all",
        label: "git fetch all",
        run: async function (/**@type{vscode.TextEditor}*/ed, args) {
            return gitFetchAll()
        },
    },
    {
        id: "y-preview-html",
        label: "preview html",
        run: async function (/**@type{vscode.TextEditor}*/ed, args) {
            editText(ed, { noChange: true }, async (text) => {
                return previewHTML(text)
            })
        },
    },
    {
        id: "y-clear-diff",
        label: "clear diff",
        icon: '$(clear-all)',
        run: async function (/**@type{vscode.TextEditor}*/ed, args) {
            clearDiffChanges()
        },
    },
    {
        id: "y-todo",
        label: "y-todo",
        icon: '$(checklist)',
        run: async function (/**@type{vscode.TextEditor}*/ed, args) {
            editText(ed, { append: true }, async (text) => {
                return todo(text, args)
            })
        },
    },
]

function buildSequenceNum(char, start) {
    return {
        id: `y-sequence-number-${char}`,
        label: `sequence number ${char}`,
        run: async function (/**@type{vscode.TextEditor}*/ed) {
            let seq = start
            let codes = []
            let endCode = char.charCodeAt(0)
            for (let i = 0; i < char.length; i++) {
                const charCode = char.charCodeAt(i)
                codes.push(charCode)
                endCode = charCode
            }
            codes.pop()
            editText(ed, { insert: true }, async () => {
                return String.fromCharCode(...codes, endCode + seq++)
            })
        },
    }
}

/**
 * @param {vscode.ExtensionContext} context 
 */
export function setUpCommands(context) {
    for (const command of commands) {
        context.subscriptions.push(
            vscode.commands.registerCommand('tools:' + command.id, (...args) => {
                let editor = vscode.window.activeTextEditor
                command.run(editor, args)
            })
        )
    }

    updatePackageJsonCommands(context.extensionPath, commands)

    registerDocumentFormattingEditProviderCSS(context, 'css')

    setupTranslateHoverProvider(context)
    setupTimeFormatHoverProvider(context)

    // addGitBlameContentProvider(context)

    setupGitCommitHoverProvider(context)
}

/**
* @param {vscode.TextEditor} editor 
* @param {EditOptions} option 
* @param {EditCallback} func 
*/
async function editText(editor, option, func) {

    if (option.noEditor) {
        await func(null)
        return
    }

    if (!editor) {
        vscode.window.showInformationMessage('No open text editor!')
        return
    }

    /** @type{vscode.Selection[]} */
    let selections = []
    /** @type{string[]} */
    let texts = []
    /** @type{string[]} */
    let results = []

    for (let i = 0; i < editor.selections.length; i++) {
        let selection = editor.selections[i]
        if (i == 0 && selection.isEmpty && !option.handleEmptySelection && !option.insert) {
            let lastLine = editor.document.lineCount - 1
            let lastCharacter = editor.document.lineAt(lastLine).range.end.character
            selection = new vscode.Selection(0, 0, lastLine, lastCharacter)
            selections.push(selection)
            texts.push(editor.document.getText(selection))
            break
        }
        if (option.replace) {
            texts.push(editor.document.getText(selection))
            let lastLine = editor.document.lineCount - 1
            let lastCharacter = editor.document.lineAt(lastLine).range.end.character
            selection = new vscode.Selection(0, 0, lastLine, lastCharacter)
            selections.push(selection)
            break
        }
        selections.push(selection)
        texts.push(editor.document.getText(selection))
    }

    try {
        for (let index = 0; index < texts.length; index++) {
            results[index] = await func(texts[index])
        }
        if (option.noChange) { return }
    } catch (error) {
        console.error(error)
        vscode.window.showErrorMessage(error.message, error)
        return
    }
    await editor.edit((editorBuilder) => {
        if (option.append) {
            for (let index = selections.length; index > 0; index--) {
                const selection = selections[index - 1]
                const result = results[index - 1]
                editorBuilder.replace(selection.end, result)
            }
        } else if (option.insertNewLines) {
            for (let index = selections.length; index > 0; index--) {
                const selection = selections[index - 1]
                const result = results[index - 1]
                editorBuilder.replace(selection.end, '\n'.repeat(option.insertNewLines) + result)
            }
        } else { // insert
            for (let index = selections.length; index > 0; index--) {
                const selection = selections[index - 1]
                const result = results[index - 1]
                editorBuilder.replace(selection, result)
            }
        }
    })
}

function buildChatGPTCommands() {
    const apis = config.chatgptHttpAPI() || []
    return apis.map((api, index) => {
        return {
            id: `y-chatgpt-${index + 1}`,
            label: `chatgpt ${index + 1}`,
            run: async function (/**@type{vscode.TextEditor}*/ed) {
                editText(ed, { noChange: true }, async (text) => {
                    let selection = ed.selection
                    let pos = selection.end.translate(0, 1)
                    await chatgpt(api, text, async (str) => {
                        let insertPos = pos
                        ed.selection = new vscode.Selection(pos, pos)
                        const lineDelta = str.split(/\r?\n/).length - 1
                        const characterDelta = str.split(/\r?\n/).at(-1).length
                        pos = pos.translate(lineDelta, characterDelta)
                        return await ed.edit((builder) => {
                            builder.insert(insertPos, str)
                        })
                    })
                    return null
                })
            }
        }
    })
}

/**
 * @param {vscode.ExtensionContext} context
 */
function addGitBlameContentProvider(context) {
    context.subscriptions.push(vscode.workspace.registerTextDocumentContentProvider('git-blame', {
        async provideTextDocumentContent(uri, token) {
            let git = getGitApi()
            const repository = git.repositories.at(0)
            let blame = await repository.blame(uri.fsPath)
            if (!token.isCancellationRequested) {
                return blame
            }
        }
    }))
}