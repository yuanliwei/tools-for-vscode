# tools-for-vscode

一个为 VSCode 提供多功能文本处理、编码解码、格式化、加密、JSON 操作等实用工具箱扩展。

## 安装

1. 在 VSCode 的扩展市场搜索 `tools-for-vscode` 并安装，或从 GitHub 拉取源码手动安装。
2. 重启 VSCode。

## 使用方式

- 选中要操作的文本（无选中文本时命令操作对象为整个文档）。
- 按 `Ctrl+Shift+P` 打开命令面板。
- 输入或选择命令，回车即可执行。

## 功能与命令列表

### 文本处理
- 删除包含/不包含选中文本的行：`Line Remove Include Select` / `Line Remove Exclude Select`
- 删除空行：`Line Remove Empty`
- 删除/保留匹配正则表达式的行：`Line Remove match regexp` / `Line Remove not match regexp`
- 行排序：`Line Sort Asc` / `Line Sort Desc` / `Line Sort Number` / `Line Reverse`
- 删除行首/尾空格：`Line Trim` / `Line Trim Left` / `Line Trim Right`
- 添加行号/自定义行号/带分隔符行号：`Line add line number` / `Line add line number from input` / `Line add line number with separator`
- 下划线转驼峰/驼峰转下划线：`Line separator underline to hump` / `Line separator hump to underline`
- 首字母大写/小写：`Line first letter uppercase` / `Line first letter lowercase`
- 统计重复行并排序：`Line Group Duplicate` / `Line Group Duplicate Sort Number Reverse`
- 组合命令和其他文本处理相关命令

### 代码相关
- JS/CSS/SQL/XML/JSON 格式化与压缩：`JS format` / `CSS format` / `SQL format` / `XML format` / `JSON format` / `CSS min` / `SQL min` / `XML min` / `JSON min`
- 运行 JS 代码或表达式：`Run Code` / `Eval Print`
- 注释/光标对齐：`Comment Align` / `Cursor Align`
- 清理 ANSI 控制字符：`Clean ANSI Escape Codes`

### 加密与哈希
- MD5/SHA1/SHA256/SHA512 计算：`Crypto md5` / `Crypto sha1` / `Crypto sha256` / `Crypto sha512`

### 编码与解码
- URI/BASE64/HEX/HTML/Native/Unicode/escape 编码/解码
    - 编码：`Encode encodeUri` / `Encode encodeBase64` / `Encode encodeHex` / `Encode encodeHtml` / `Encode encodeNative` / `Encode encodeUnicode` / `Encode encodeEscape`
    - 解码：`Encode decodeUri` / `Encode decodeBase64` / `Encode decodeHex` / `Encode decodeHtml` / `Encode decodeNative` / `Encode decodeUnicode` / `Encode decodeEscape`

### JSON 相关
- JSON 格式化（缩进/压缩）：`JSON format` / `JSON min`
- 深度解析 JSON：`deep parse JSON`
- 重排 JSON key 顺序：`rearrange JSON key`
- JSON 信息分析：`JSON Info`
- JSON 转 ASCII 表格：`JSON Ascii Table`
- 规范化 JSON：`normalize JSON`
- 提取 JSON/JS 类型定义：`extract JSON` / `extract js|json types`

### 转码与其他
- CoffeeScript 转 JS、Less 转 CSS、Markdown 转 HTML
- 文本翻译中/英、实时翻译提示
- OCR 剪贴板图片转文字
- 随机中文名生成、shuffle 数组、时间插入

### 高级与开发相关
- 支持多种命令组合、预览 HTML、在终端执行命令、进度通知
- 支持命令注册与拓展

## 贡献指南

欢迎 PR、Issue 反馈或功能建议！
1. Fork 本项目，创建分支。
2. 提交代码并发起 PR。
3. 更多细节请参考项目结构与源码注释。

## TODO

- 文本转语音等更多工具开发中。

---

如需详细命令说明、参数示例或扩展开发，请查阅源码或 Issues。