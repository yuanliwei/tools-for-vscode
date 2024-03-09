import { statSync } from 'node:fs'

export default {
    workspace: {
        getConfiguration() {
            return {
                /**
                 * @param {string | number} key
                 */
                get(key) {
                    return {
                        chatgpt_http_api: ['1', '2', '3']
                    }[key]
                }
            }
        }
    }
}

/** @type{import('node:module').ResolveHook} */
export const resolve = async (specifier, context, nextResolve) => {
    if ('vscode' == specifier) {
        return {
            shortCircuit: true,
            url: import.meta.url,
        }
    }
    if (specifier.startsWith('.') && !context.parentURL.includes('node_modules')) {
        const { mtimeMs } = statSync(new URL(specifier, context.parentURL))
        return nextResolve(`${specifier}?v=${mtimeMs}`, context)
    }
    return nextResolve(specifier, context)
}