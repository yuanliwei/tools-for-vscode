import { commands, ProgressLocation, window } from 'vscode'
import { setupTranslateHoverProvider, getAllText, getInputSeparator, getInputStartNumber, getRegexpText, getSelectText, registerDocumentFormattingEditProviderCSS, setupTimeFormatHoverProvider, getInputRepeatCount, previewHTML, editText, animationEditInVSCode, runCommandInTerminal, getChatPrompt, runWithLoading, previewMarkdownText, registerMarkdownPreviewTextDocumentContentProvider } from './lib.view.js'
import { addLineNumber, addLineNumberFromInput, addLineNumberWithSeparator, asciitable, CHAT_PLACEHOLDER_SELECTION, chatgpt, cleanAnsiEscapeCodes, cleanDiffChange, commentAlign, currentTime, currentTimeShort, cursorAlign, decodeBase64, decodeHex, decodeHtml, decodeNative, decodeUnescape, decodeUnicode, decodeUri, encodeBase64, encodeEscape, encodeHex, encodeHtml, encodeNative, encodeUnicode, encodeUri, escapeSimple, escapeWithcrlf, evalPrint, extractTypesFromString, firstLetterLowercase, firstLetterUppercase, formatBytes, formatCSS, formatJS, formatJSON, formatMultiLineComment, formatSQL, formatTime, formatXML, guid, jsonDeepParse, lineGroupDuplicate, lineRemoveDuplicate, lineRemoveEmpty, lineRemoveExcludeSelect, lineRemoveIncludeSelect, lineRemoveMatchRegexp, lineRemoveNotMatchRegexp, lineReverse, lineSortAsc, lineSortDesc, lineSortNumber, lineSortRandom, lineTrim, lineTrimLeft, lineTrimRight, markdownToHtml, md5, minCSS, minJSON, minSQL, minXML, nameGenerateGet, nzhCnEncodeB, nzhCnEncodeS, parseJSON, parseJSONInfo, parseTime, randomHex, randomNumber, rearrangeJsonKey, separatorHumpToUnderline, separatorUnderlineToHump, sha1, sha256, sha512, sleep, stringify, todo, translate } from './lib.js'
import { appConfigChatUrl, appConfigTranslateUrl, extensionContext } from './config.js'
import { evalParser, extractJsonFromString } from 'extract-json-from-string-y'

/**
 * @import { ExtensionContext } from 'vscode'
 * @import { CommandInfo } from './types.js'
 */

/**
 * @type {CommandInfo[]} 
 */
export const tool_commands = [
    {
        id: 'y-remove-empty',
        label: 'Line Remove Empty',
        async action(ed) {
            editText(ed, {}, (text) => {
                return lineRemoveEmpty(text)
            })
        }
    },
    {
        id: 'y-remove-duplicate',
        label: 'Line Remove Duplicate',
        async action(ed) {
            editText(ed, {}, (text) => {
                return lineRemoveDuplicate(text)
            })
        }
    },
    {
        id: 'y-remove-include-select',
        label: 'Line Remove Include Select',
        async action(ed) {
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
        async action(ed) {
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
        async action(ed) {
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
        async action(ed) {
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
        async action(ed) {
            editText(ed, {}, (text) => {
                return lineSortAsc(text)
            })
        }
    },
    {
        id: 'y-line-sort-desc',
        label: 'Line Sort Desc',
        async action(ed) {
            editText(ed, {}, (text) => {
                return lineSortDesc(text)
            })
        }
    },
    {
        id: 'y-line-sort-random',
        label: 'Line Sort Random',
        async action(ed) {
            editText(ed, {}, (text) => {
                return lineSortRandom(text)
            })
        }
    },
    {
        id: 'y-line-trim',
        label: 'Line Trim',
        async action(ed) {
            editText(ed, {}, (text) => {
                return lineTrim(text)
            })
        }
    },
    {
        id: 'y-line-trim-left',
        label: 'Line Trim Left',
        async action(ed) {
            editText(ed, {}, (text) => {
                return lineTrimLeft(text)
            })
        }
    },
    {
        id: 'y-line-trim-right',
        label: 'Line Trim Right',
        async action(ed) {
            editText(ed, {}, (text) => {
                return lineTrimRight(text)
            })
        }
    },
    {
        id: 'y-line-add-line-number',
        label: 'Line Add Line Number',
        async action(ed) {
            editText(ed, {}, (text) => {
                return addLineNumber(text)
            })
        }
    },
    {
        id: 'y-line-add-line-number-from-input',
        label: 'Line Add Line Number From Input',
        async action(ed) {
            let startNumber = await getInputStartNumber()
            editText(ed, {}, (text) => {
                return addLineNumberFromInput(text, startNumber)
            })
        }
    },
    {
        id: 'y-line-add-line-number-with-separator',
        label: 'Line Add Line Number With Separator',
        async action(ed) {
            let separator = await getInputSeparator()
            editText(ed, {}, (text) => {
                return addLineNumberWithSeparator(text, separator)
            })
        }
    },
    {
        id: 'y-line-separator-underline-to-hump',
        label: 'Line Separator Underline To Hump',
        async action(ed) {
            editText(ed, {}, (text) => {
                return separatorUnderlineToHump(text)
            })
        }
    },
    {
        id: 'y-line-separator-hump-to-underline',
        label: 'Line Separator Hump To Underline',
        async action(ed) {
            editText(ed, {}, (text) => {
                return separatorHumpToUnderline(text)
            })
        }
    },
    {
        id: 'y-line-first-letter-lowercase',
        label: 'Line First Letter Lowercase',
        async action(ed) {
            editText(ed, {}, (text) => {
                return firstLetterLowercase(text)
            })
        }
    },
    {
        id: 'y-line-first-letter-uppercase',
        label: 'Line First Letter Uppercase',
        async action(ed) {
            editText(ed, {}, (text) => {
                return firstLetterUppercase(text)
            })
        }
    },
    {
        id: 'y-line-group-duplicate',
        label: 'Line Group Duplicate',
        async action(ed) {
            editText(ed, {}, (text) => {
                return lineGroupDuplicate(text)
            })
        }
    },
    {
        id: 'y-line-sort-number',
        label: 'Line Sort Number',
        async action(ed) {
            editText(ed, {}, (text) => {
                return lineSortNumber(text)
            })
        }
    },
    {
        id: 'y-line-reverse',
        label: 'Line Reverse',
        async action(ed) {
            editText(ed, {}, (text) => {
                return lineReverse(text)
            })
        }
    },
    {
        id: 'y-line-group-duplicate-sort-number-reverse',
        label: 'Line Group Duplicate Sort Number Reverse',
        async action(ed) {
            editText(ed, {}, async (text) => {
                text = await lineGroupDuplicate(text)
                text = await lineSortNumber(text)
                text = await lineReverse(text)
                return text
            })
        }
    },
    {
        id: 'y-line-replace-backslash-to-slash',
        label: 'Line Replace Backslash(\\) To Slash(/)',
        async action(ed) {
            editText(ed, {}, async (text) => {
                return text.replaceAll('\\', '/')
            })
        }
    },
    {
        id: 'y-line-repeat',
        label: 'Line Repeat',
        async action(ed) {
            editText(ed, {}, async (text) => {
                let count = await getInputRepeatCount()
                return text.repeat(count)
            })
        }
    },
    {
        id: 'y-guid',
        label: 'guid',
        async action(ed) {
            editText(ed, { insert: true }, async () => {
                return await guid()
            })
        }
    },
    {
        id: 'y-current-time',
        label: 'Current Time',
        async action(ed) {
            editText(ed, { insert: true }, async () => {
                return await currentTime()
            })
        }
    },
    {
        id: 'y-current-time-short',
        label: 'Current Time Short',
        async action(ed) {
            editText(ed, { insert: true }, async () => {
                return await currentTimeShort()
            })
        }
    },
    {
        id: 'y-timestamp',
        label: 'timestamp',
        async action(ed) {
            editText(ed, { insert: true }, async () => {
                return String(Date.now())
            })
        }
    },
    {
        id: 'y-format-time',
        label: 'Format Time',
        async action(ed) {
            editText(ed, {}, async (text) => {
                return await formatTime(text)
            })
        }
    },
    {
        id: 'y-parse-time',
        label: 'Parse Time',
        async action(ed) {
            editText(ed, {}, async (text) => {
                return await parseTime(text)
            })
        }
    },
    {
        id: 'y-format-bytes',
        label: 'Format bytes',
        async action(ed) {
            editText(ed, {}, async (text) => {
                return await formatBytes(text)
            })
        }
    },
    {
        id: 'y-eval-print',
        label: 'Eval Print',
        async action(ed) {
            editText(ed, { append: true }, async (text) => {
                return await evalPrint(text)
            })
        }
    },
    {
        id: 'y-comment-align',
        label: 'Comment Align',
        async action(ed) {
            editText(ed, {}, async (text) => {
                return await commentAlign(text)
            })
        }
    },
    {
        id: "y-cursor-align",
        label: "Cursor Align",
        async action(ed) {
            const func = await cursorAlign(ed)
            editText(ed, { insert: true }, async () => {
                return func()
            })
        }
    },
    {
        id: 'y-format-multi-line-comment',
        label: 'Format Multi Line Comment',
        async action(ed) {
            editText(ed, {}, (text) => {
                return formatMultiLineComment(text)
            })
        }
    },
    {
        id: "y-clean-ansi-escape-codes",
        label: "Clean ANSI Escape Codes",
        async action(ed) {
            editText(ed, {}, async (text) => {
                return await cleanAnsiEscapeCodes(text)
            })
        }
    },
    {
        id: "y-clean-diff-change",
        label: "Clean Diff Change",
        async action(ed) {
            editText(ed, {}, async (text) => {
                return await cleanDiffChange(text)
            })
        }
    },
    {
        id: "y-js-format",
        label: "JS format",
        async action(ed) {
            editText(ed, {}, async (text) => {
                return await formatJS(text)
            })
        }
    },
    {
        id: "y-css-format",
        label: "CSS format",
        async action(ed) {
            editText(ed, {}, async (text) => {
                return await formatCSS(text)
            })
        }
    },
    {
        id: "y-sql-format",
        label: "SQL format",
        async action(ed) {
            editText(ed, {}, async (text) => {
                return await formatSQL(text)
            })
        }
    },
    {
        id: "y-xml-format",
        label: "XML format",
        async action(ed) {
            editText(ed, {}, async (text) => {
                return await formatXML(text)
            })
        }
    },
    {
        id: "y-json-format",
        label: "JSON format",
        async action(ed) {
            editText(ed, {}, async (text) => {
                return await formatJSON(text)
            })
        }
    },
    {
        id: "y-sql-min",
        label: "SQL min",
        async action(ed) {
            editText(ed, {}, async (text) => {
                return await minSQL(text)
            })
        }
    },
    {
        id: "y-xml-min",
        label: "XML min",
        async action(ed) {
            editText(ed, {}, async (text) => {
                return await minXML(text)
            })
        }
    },
    {
        id: "y-css-min",
        label: "CSS min",
        async action(ed) {
            editText(ed, {}, async (text) => {
                return await minCSS(text)
            })
        }
    },
    {
        id: "y-json-min",
        label: "JSON min",
        async action(ed) {
            editText(ed, {}, async (text) => {
                return await minJSON(text)
            })
        }
    },
    {
        id: 'y-codec-deep-parse-json',
        label: 'deep parse JSON',
        async action(ed) {
            editText(ed, {}, (text) => {
                let o = jsonDeepParse(text)
                if (typeof o !== "string") {
                    o = JSON.stringify(o)
                }
                return formatJSON(o)
            })
        }
    },
    {
        id: 'y-codec-rearrange-json-key',
        label: 'rearrange JSON key',
        async action(ed) {
            editText(ed, {}, (text) => {
                return formatJSON(rearrangeJsonKey(JSON.parse(text)))
            })
        }
    },
    {
        id: 'y-json-info',
        label: 'JSON Info',
        async action(ed) {
            editText(ed, { append: true }, async (text) => {
                return window.withProgress({ location: ProgressLocation.Window, title: "..." }, async () => {
                    try {
                        return await parseJSONInfo(text)
                    } catch (error) {
                        console.error(error)
                        window.showErrorMessage(error.stack)
                        return error.stack
                    }
                })
            })
        }
    },
    {
        id: 'y-json-ascii-table',
        label: 'JSON Ascii Table',
        async action(ed) {
            editText(ed, { append: true }, async (text) => {
                let list = await evalParser(text)
                return asciitable(list)
            })
        }
    },
    {
        id: 'y-codec-normalize-json',
        label: 'normalize JSON',
        async action(ed) {
            editText(ed, {}, (text) => {
                return JSON.stringify(evalParser(text), null, 4)
            })
        }
    },
    {
        id: 'y-extract-json',
        label: 'extract JSON',
        async action(ed) {
            editText(ed, {}, (text) => {
                let json = extractJsonFromString(text)
                return formatJSON(JSON.stringify(json))
            })
        }
    },
    {
        id: 'y-extract-types',
        label: 'extract js|json types',
        async action(ed) {
            editText(ed, {}, (text) => {
                let types = extractTypesFromString(text)
                return types
            })
        }
    },
    {
        id: "y-crypto-md5",
        label: "Crypto md5",
        async action(ed) {
            editText(ed, {}, async (text) => {
                return await md5(text)
            })
        }
    },
    {
        id: "y-crypto-sha1",
        label: "Crypto sha1",
        async action(ed) {
            editText(ed, {}, async (text) => {
                return await sha1(text)
            })
        }
    },
    {
        id: "y-crypto-sha256",
        label: "Crypto sha256",
        async action(ed) {
            editText(ed, {}, async (text) => {
                return await sha256(text)
            })
        }
    },
    {
        id: "y-crypto-sha512",
        label: "Crypto sha512",
        async action(ed) {
            editText(ed, {}, async (text) => {
                return await sha512(text)
            })
        }
    },
    {
        id: "y-decode-json-parse",
        label: "Decode json parse",
        async action(ed) {
            editText(ed, {}, async (text) => {
                return await parseJSON(text)
            })
        }
    },
    {
        id: "y-encode-json-stringify",
        label: "Encode json stringify",
        async action(ed) {
            editText(ed, {}, async (text) => {
                return await stringify(text)
            })
        }
    },
    {
        id: "y-encode-uri",
        label: "Encode uri",
        async action(ed) {
            editText(ed, {}, async (text) => {
                return await encodeUri(text)
            })
        }
    },
    {
        id: "y-decode-uri",
        label: "Decode uri",
        async action(ed) {
            editText(ed, {}, async (text) => {
                return await decodeUri(text)
            })
        }
    },
    {
        id: "y-encode-base64",
        label: "Encode base64",
        async action(ed) {
            editText(ed, {}, async (text) => {
                return await encodeBase64(text)
            })
        }
    },
    {
        id: "y-decode-base64",
        label: "Decode base64",
        async action(ed) {
            editText(ed, {}, async (text) => {
                return await decodeBase64(text)
            })
        }
    },
    {
        id: "y-encode-hex",
        label: "Encode hex",
        async action(ed) {
            editText(ed, {}, async (text) => {
                return await encodeHex(text)
            })
        }
    },
    {
        id: "y-decode-hex",
        label: "Decode hex",
        async action(ed) {
            editText(ed, {}, async (text) => {
                return await decodeHex(text)
            })
        }
    },
    {
        id: "y-encode-html",
        label: "Encode html",
        async action(ed) {
            editText(ed, {}, async (text) => {
                return await encodeHtml(text)
            })
        }
    },
    {
        id: "y-decode-html",
        label: "Decode html",
        async action(ed) {
            editText(ed, {}, async (text) => {
                return await decodeHtml(text)
            })
        }
    },
    {
        id: "y-encode-native",
        label: "Encode native",
        async action(ed) {
            editText(ed, {}, async (text) => {
                return await encodeNative(text)
            })
        }
    },
    {
        id: "y-decode-native",
        label: "Decode native",
        async action(ed) {
            editText(ed, {}, async (text) => {
                return await decodeNative(text)
            })
        }
    },
    {
        id: "y-encode-unicode",
        label: "Encode unicode",
        async action(ed) {
            editText(ed, {}, async (text) => {
                return await encodeUnicode(text)
            })
        }
    },
    {
        id: "y-decode-unicode",
        label: "Decode unicode",
        async action(ed) {
            editText(ed, {}, async (text) => {
                return await decodeUnicode(text)
            })
        }
    },
    {
        id: "y-encode-escape",
        label: "Encode escape",
        async action(ed) {
            editText(ed, {}, async (text) => {
                return await encodeEscape(text)
            })
        }
    },
    {
        id: "y-encode-escape-simple",
        label: "Encode escape simple",
        async action(ed) {
            editText(ed, {}, async (text) => {
                return await escapeSimple(text)
            })
        }
    },
    {
        id: "y-encode-escape-with-crlf",
        label: "Encode escape with crlf",
        async action(ed) {
            editText(ed, {}, async (text) => {
                return await escapeWithcrlf(text)
            })
        }
    },
    {
        id: "y-decode-unescape",
        label: "Decode unescape",
        async action(ed) {
            editText(ed, {}, async (text) => {
                return await decodeUnescape(text)
            })
        }
    },
    {
        id: "y-translate-markdown-to-html",
        label: "Translate markdown to html",
        async action(ed) {
            editText(ed, {}, async (text) => {
                return await markdownToHtml(text)
            })
        }
    },
    {
        id: "y-translate-translate-to-zh",
        label: "Translate translate to zh",
        async action(ed) {
            let url = await appConfigTranslateUrl()
            if (!url) return
            editText(ed, {}, async (text) => {
                return await translate(url, 'zh', text)
            })
        }
    },
    {
        id: "y-translate-translate-to-en",
        label: "Translate translate to en",
        async action(ed) {
            let url = await appConfigTranslateUrl()
            if (!url) return
            editText(ed, {}, async (text) => {
                return await translate(url, 'en', text)
            })
        }
    },
    {
        id: "y-translate-toggle-translate",
        label: "Translate toggle translate",
        async action(ed) {
            editText(ed, { noChange: true }, async () => {
                if (extensionContext.translateDisposable) {
                    extensionContext.translateDisposable.dispose()
                    extensionContext.translateDisposable = null
                } else {
                    extensionContext.translateDisposable = window.setStatusBarMessage(`Baidu Translate is enable!`)
                }
                return null
            })
        }
    },
    {
        id: "y-lorem",
        label: "lorem",
        async action(ed) {
            editText(ed, { insert: true }, async () => {
                return `Lorem ipsum dolor sit amet consectetur adipisicing elit. Deserunt nulla quisquam blanditiis fugit quia beatae, ducimus in provident commodi similique, necessitatibus quae exercitationem doloribus hic impedit maxime voluptate velit consequuntur?`
            })
        }
    },
    {
        id: "y-random-number",
        label: "random number",
        async action(ed) {
            editText(ed, { insert: true, handleEmptySelection: true, }, async () => {
                return randomNumber()
            })
        },
    },
    {
        id: "y-random-hex",
        label: "random hex",
        async action(ed) {
            editText(ed, { insert: true, handleEmptySelection: true, }, async () => {
                return randomHex()
            })
        },
    },
    {
        id: "y-sequence-number-1",
        label: "sequence number 1",
        async action(ed) {
            let seq = 1
            editText(ed, { insert: true }, async () => {
                return `${seq++}`
            })
        },
    },
    {
        id: "y-sequence-number-一",
        label: "sequence number 一",
        async action(ed) {
            let seq = 1
            editText(ed, { insert: true }, async () => {
                return nzhCnEncodeS(seq++)
            })
        },
    },
    {
        id: "y-sequence-number-壹",
        label: "sequence number 壹",
        async action(ed) {
            let seq = 1
            editText(ed, { insert: true }, async () => {
                return nzhCnEncodeB(seq++)
            })
        },
    },
    {
        id: "y-xing-ming",
        label: "xing ming",
        async action(ed) {
            editText(ed, { insert: true }, async () => {
                return nameGenerateGet()
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
        id: "y-fill-space",
        label: "fill space",
        async action(ed) {
            editText(ed, {}, async (text) => {
                return ' '.repeat(text.length)
            })
        },
    },
    {
        id: "y-cursors-drop",
        label: "cursors drop",
        async action(ed) {
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
        async action(ed) {
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
        async action(ed) {
            editText(ed, { append: true }, async (text) => {
                let match = text.split(/[ ,;\r\n\t"]/) || []
                let numbers = match.map((o) => parseFloat(o)).filter((o) => !isNaN(o))
                return `average: ${numbers.reduce((p, c) => p + c, 0) / numbers.length}`
            })
        },
    },
    {
        id: "y-preview-html",
        label: "preview html",
        async action(ed, args) {
            editText(ed, { noChange: true }, async (text) => {
                return previewHTML(text)
            })
        },
    },
    {
        id: "y-run-command-in-terminal",
        label: "Run Command In Terimnal",
        async action(ed, args) {
            editText(ed, { noChange: true, preferCurrentLine: true }, async (text) => {
                await runCommandInTerminal(text)
                return null
            })
        },
    },
    {
        id: "y-chat-edit-prompts",
        label: "Chat Edit Prompts",
        async action(ed, args) {
            let url = await appConfigChatUrl()
            if (!url) return
            let prompt = await getChatPrompt()
            if (!prompt) return
            await runWithLoading('chat-prompts', async () => {
                await editText(ed, { insert: true }, async (text) => {
                    if (!text.trim()) {
                        return text
                    }
                    let message = prompt.prompt.replaceAll(CHAT_PLACEHOLDER_SELECTION, text)
                    let response = await chatgpt(url, message)
                    return response
                })
            })
        },
    },
    {
        id: "y-markdown-preview",
        label: "Markdown Preview",
        async action(ed, args) {
            editText(ed, { noChange: true }, async (text) => {
                if (ed.selection && !ed.selection.isEmpty) {
                    await previewMarkdownText(text)
                } else {
                    await commands.executeCommand('markdown.showPreviewToSide', ed.document.uri)
                }
                return text
            })
        },
    },
    {
        id: "y-latex-to-markdown-math",
        label: "LaTeX → Markdown Math",
        async action(ed, args) {
            editText(ed, {}, async (text) => {
                text = text.replaceAll(/\\\((.+?)\\\)/g, '$$$1$')
                text = text.replaceAll(/\\\[(.+?)\\\]/gs, '$$$$$1$$$$')
                return text
            })
        },
    },
    {
        id: "y-todo",
        label: "y-todo",
        icon: '$(checklist)',
        async action(ed, args) {
            let callback = animationEditInVSCode(ed)
            for (let i = 0; i < 100; i++) {
                await sleep(1)
                await callback(`${i} `)
            }
            editText(ed, { append: true }, async (text) => {
                return todo(text, args)
            })
        },
    },
]

/**
 * @param {string} char
 * @param {number} start
 * @returns {CommandInfo}
 */
function buildSequenceNum(char, start) {
    return {
        id: `y-sequence-number-${char}`,
        label: `sequence number ${char}`,
        async action(ed) {
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
 * @param {ExtensionContext} context 
 */
export function setupCommands(context) {
    for (const command of tool_commands) {
        context.subscriptions.push(
            commands.registerCommand('tools:' + command.id, (...args) => {
                let editor = window.activeTextEditor
                command.action(editor, args)
            })
        )
    }

    registerDocumentFormattingEditProviderCSS(context, 'css')
    registerMarkdownPreviewTextDocumentContentProvider(context)

    setupTranslateHoverProvider(context)
    setupTimeFormatHoverProvider(context)
}
