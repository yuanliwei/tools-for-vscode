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