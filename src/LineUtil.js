module.exports = class LineUtil {
    static async lineRemoveDuplicate(text) {
        return [...new Set(text.split('\n'))].join('\n')
    }
    static async lineRemoveIncludeSelect(selText, text) {
        return text.split('\n').filter(o => !o.includes(selText)).join('\n')
    }
    static async lineRemoveExcludeSelect(selText, text) {
        return text.split('\n').filter(o => o.includes(selText)).join('\n')
    }
    static async lineRemoveEmpty(text) {
        return text.split('\n').filter(o => o.trim()).join('\n')
    }
    static async lineSortAsc(text) {
        return text.split('\n').sort().join('\n')
    }
    static async lineSortDesc(text) {
        return text.split('\n').sort().reverse().join('\n')
    }
    static async lineTrim(text) {
        return text.split('\n').map(o => o.trim()).join('\n')
    }
    static async lineTrimLeft(text) {
        return text.split('\n').map(o => o.trimLeft()).join('\n')
    }
    static async lineTrimRight(text) {
        return text.split('\n').map(o => o.trimRight()).join('\n')
    }
}