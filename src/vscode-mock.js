import { statSync } from 'node:fs'

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

// mock
export const Hover = {}
export const Position = {}
export const Range = {}
export const TextEdit = {}
export const languages = {}
export const window = {}
export const workspace = {
    getConfiguration() {
    },
}
export const ProgressLocation = {}
export const ViewColumn = {}
export const Selection = {}
export const commands = {}
export const Uri = {
    parse() { }
}
export const WorkspaceEdit = {}
export const env = {}
export const extensions = {}
export const DiagnosticSeverity = {}