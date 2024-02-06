export default {
    workspace: {
        getConfiguration() {
            return {
                /**
                 * @param {string | number} key
                 */
                get(key) {
                    return {
                        chatgpt_http_api: ['1', '2']
                    }[key]
                }
            }
        }
    }
}

/** @type{import('node:module').ResolveHook} */
export const resolve = async (specifier, context, nextResolve) => {
    console.log('call resolve', specifier)
    if (specifier.includes('command.js')) {
    }
    if ('vscode' == specifier) {
        return {
            shortCircuit: true,
            url: import.meta.url,
        }
    }
    return nextResolve(specifier, context)
}