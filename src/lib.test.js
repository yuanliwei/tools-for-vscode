import { test } from 'node:test'
import { strictEqual } from 'node:assert'
import { register } from 'node:module'
register('./vscode-mock.js', import.meta.url)

test('extract-types', async () => {
    // node --test-name-pattern="^extract-types$" src/lib.test.js
    const { extractTypesFromString } = await import('./lib.js')

    let types = extractTypesFromString(`{a:'string',b:12345,c:[{a:1,b:2}]}`)
    console.log(types)
    strictEqual(types.trim(), `
export type DATA_D_TS = {
    a: string;
    b: number;
    c: {
        a: number;
        b: number;
    }[];
};`.trim())

    console.log(types)

})

test('transform-type-imports', async () => {
    // node --test --test-name-pattern="^transform-type-imports$" src/lib.test.js
    const { transformTypeImports } = await import('./lib.js')

    let { imports, typeText } = transformTypeImports(`import("@koa/router").RouterContext | import("http").IncomingMessage`)

    console.log(imports)
    console.log(typeText)

    strictEqual(imports.trim(), `
@import {RouterContext} from '@koa/router'
@import {IncomingMessage} from 'http'
`.trim())

    strictEqual(typeText.trim(), `RouterContext | IncomingMessage`)

})

test('transform-type-imports-text', async () => {
    // node --test --test-name-pattern="^transform-type-imports-text$" src/lib.test.js
    const { transformTypeImportsText } = await import('./lib.js')
    let result = await transformTypeImportsText(`import("@koa/router").RouterContext | import("http").IncomingMessage`)
    console.log(result)
    strictEqual(result, `@import {RouterContext} from '@koa/router' | @import {IncomingMessage} from 'http'`.trim())
})

// ===== 以下测试覆盖有升级的依赖：he / js-beautify / markdown-it / dayjs =====

test('he-encode-decode', async () => {
    // node --test-name-pattern="^he-encode-decode$" src/lib.test.js
    const { encodeHtml, decodeHtml } = await import('./lib.js')

    // 特殊字符编码
    // 优先使用命名实体（useNamedReferences: true）
    strictEqual(await encodeHtml('<a href="x">&'), '&lt;a href=&quot;x&quot;&gt;&amp;')
    // 解码
    strictEqual(await decodeHtml('&lt;div&gt;hello&amp;world&lt;/div&gt;'), '<div>hello&world</div>')
    // 往返一致
    let original = '<p class="test">中文 & 符号</p>'
    strictEqual(await decodeHtml(await encodeHtml(original)), original)
})

test('js-beautify-format-js', async () => {
    // node --test-name-pattern="^js-beautify-format-js$" src/lib.test.js
    const { formatJS } = await import('./lib.js')

    let result = await formatJS('function f(){return 1}')
    console.log(result)
    strictEqual(result, 'function f() {\n    return 1\n}')
})

test('js-beautify-format-css', async () => {
    // node --test-name-pattern="^js-beautify-format-css$" src/lib.test.js
    const { formatCSS } = await import('./lib.js')

    let result = await formatCSS('.a{color:red}.b{color:blue}')
    console.log(result)
    // selector_separator_newline:false → 两个选择器各占一行
    strictEqual(result, '.a {\n    color: red\n}\n\n.b {\n    color: blue\n}')
})

test('markdown-it-markdown-to-html', async () => {
    // node --test-name-pattern="^markdown-it-markdown-to-html$" src/lib.test.js
    const { markdownToHtml } = await import('./lib.js')

    // 标题
    strictEqual(await markdownToHtml('# title'), '<h1>title</h1>\n')
    // 链接 + linkify
    strictEqual(await markdownToHtml('[a](http://b.com)'), '<p><a href="http://b.com">a</a></p>\n')
    // 原始 HTML 透传（html:true）
    strictEqual(await markdownToHtml('<div>x</div>'), '<div>x</div>')
})

test('dayjs-format-time', async () => {
    // node --test-name-pattern="^dayjs-format-time$" src/lib.test.js
    const { formatTime } = await import('./lib.js')

    // 13 位毫秒时间戳 → 格式化（本地时区）
    let result = await formatTime('timestamp 1700000000000')
    console.log(result)
    strictEqual(/^timestamp \d{4}-\d\d-\d\d \d\d:\d\d:\d\d\.\d{3}$/.test(result), true)
    // 10 位秒时间戳会被转成毫秒再格式化
    let result10 = await formatTime('1700000000')
    strictEqual(/^\d{4}-\d\d-\d\d \d\d:\d\d:\d\d\.\d{3}$/.test(result10), true)
    // 19xx/20xx 开头的 10 位数不当作时间戳（原样返回）
    strictEqual(await formatTime('20240101'), '20240101')
})

test('dayjs-parse-time', async () => {
    // node --test-name-pattern="^dayjs-parse-time$" src/lib.test.js
    const { parseTime, parseTimeMillisStr } = await import('./lib.js')

    // 完整日期时间 → 时间戳（毫秒）
    let ms = parseTime('2023-11-15 06:13:20.000')
    strictEqual(typeof ms, 'number')
    strictEqual(ms > 0, true)
    // 两位数年份格式（补 20 前缀）
    strictEqual(parseTime('23-11-15 06:13:20.000') > 0, true)
    // 无法解析返回 0
    strictEqual(parseTime('not a time'), 0)

    // parseTimeMillisStr 优先走 parseTime
    strictEqual(await parseTimeMillisStr('2023-11-15 06:13:20.000'), String(ms))
    // 解析失败则尝试 new Date
    let fallback = await parseTimeMillisStr('2023-11-15')
    strictEqual(/^\d{13}$/.test(fallback), true)
})

test('dayjs-current-time', async () => {
    // node --test-name-pattern="^dayjs-current-time$" src/lib.test.js
    const { currentTime, currentTimeShort } = await import('./lib.js')

    // 格式校验（值每次不同，只能校验格式）
    strictEqual(/^\d{4}\/\d\d\/\d\d \d\d:\d\d:\d\d$/.test(await currentTime()), true)
    strictEqual(/^\d{14}$/.test(await currentTimeShort()), true)
})
