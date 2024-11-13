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
/** [data].d.ts */

export function data(): {
    a: string;
    b: number;
    c: {
        a: number;
        b: number;
    }[];
};`.trim())

    console.log(types)

})