import { resolve } from 'path'

import { runTests } from '@vscode/test-electron'
import { fileURLToPath } from 'url'

async function main() {
    try {
        // The folder containing the Extension Manifest package.json
        // Passed to `--extensionDevelopmentPath`
        const extensionDevelopmentPath = fileURLToPath(new URL('../', import.meta.url))

        // The path to the extension test script
        // Passed to --extensionTestsPath
        const extensionTestsPath = fileURLToPath(new URL('./suite/index.js', import.meta.url))

        // Download VS Code, unzip it and run the integration test
        await runTests({ extensionDevelopmentPath, extensionTestsPath })
    } catch (err) {
        console.error('Failed to run tests', err)
        process.exit(1)
    }
}

main()
