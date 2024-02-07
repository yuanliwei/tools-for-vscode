import { resolve } from 'path'
import Mocha from 'mocha'
import { glob } from 'glob'
import { fileURLToPath } from 'url'

export async function run() {
    // Create the mocha test
    const mocha = new Mocha({
        ui: 'tdd',
        color: true
    })

    const testsRoot = fileURLToPath(new URL('../', import.meta.url))

    let files = await glob('**/**.test.js', { cwd: testsRoot })

    files.forEach(f => mocha.addFile(resolve(testsRoot, f)))

    mocha.run(failures => {
        if (failures > 0) {
            throw new Error(`${failures} tests failed.`)
        }
    })
}
