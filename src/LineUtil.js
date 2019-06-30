module.exports = class LineUtil {
    static async lineRemoveIncludeSelect(selText, text) {
        return text.split('\n').filter(o => !o.includes(selText)).join('\n')
    }
    static async lineRemoveExcludeSelect(selText, text) {
        return text.split('\n').filter(o => o.includes(selText)).join('\n')
    }
    static async lineRemoveEmpty(text) {
        return text.split('\n').filter(o => o.trim()).join('\n')
    }
    static async lineOrderAsc(text) {
        return text.split('\n').sort().join('\n')
    }
    static async lineOrderDesc(text) {
        return text.split('\n').sort().reverse().join('\n')
    }
    static async lineTrim(text) {
        return text.split('\n').map(o => o.trim()).join('\n')
    }
}