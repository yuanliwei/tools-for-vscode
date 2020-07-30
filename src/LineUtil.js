let regexpInput = ''

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
    static async lineRemoveMatchRegexp(text) {
        const View = require('./View')
        let regexp = await View.getString({
            value: regexpInput,
            placeHolder: 'https?://.*com/',
            prompt: '输入正则表达式'
        })
        if (!regexp) return text
        regexpInput = regexp
        let reg = new RegExp(regexp)
        return text.split('\n').filter(o => !o.match(reg)).join('\n')
    }
    static async lineRemoveNotMatchRegexp(text) {
        const View = require('./View')
        let regexp = await View.getString({
            value: regexpInput,
            placeHolder: 'https?://.*com/',
            prompt: '输入正则表达式'
        })
        if (!regexp) return text
        regexpInput = regexp
        let reg = new RegExp(regexp)
        return text.split('\n').filter(o => o.match(reg)).join('\n')
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
    static async addLineNumber(text) {
        let num = 1
        return text.split('\n').map(o => `${(num++).toString().padStart(4, ' ')} ${o}`).join('\n')
    }
    static async addLineNumberWithSeparator(text) {
        const View = require('./View')
        let separator = await View.getString({
            placeHolder: '.: ,></?][{}-=_+',
            prompt: '自定义分隔符'
        })
        let num = 1
        return text.split('\n').map(o => `${(num++).toString().padStart(4, ' ')}${separator}${o}`).join('\n')
    }
    /**
     * 下划线转驼峰
     * 
     * @param {string} text 
     */
    static async separatorUnderlineToHump(text) {
        return text.replace(/_(\w)/g, (_, b) => b.toUpperCase())
    }
    /**
     * 驼峰转下划线
     * 
     * @param {string} text 
     */
    static async separatorHumpToUnderline(text) {
        return text.replace(/[A-Z]/g, (a) => `_${a.toLowerCase()}`).replace(/(\W)_/g, (a, b) => b)
    }
    /**
     * 首字母小写
     * 
     * @param {string} text 
     */
    static async firstLetterLowercase(text) {
        console.log(text);
        return text.replace(/^\w/, (a) => a.toLowerCase()).replace(/(\W)(\w)/g, (_, b, c) => `${b}${c.toLowerCase()}`)
    }
    /**
     * 首字母大写
     * 
     * @param {string} text 
     */
    static async firstLetterUppercase(text) {
        return text.replace(/^\w/, (a) => a.toUpperCase()).replace(/(\W)(\w)/g, (_, b, c) => `${b}${c.toUpperCase()}`)
    }
}