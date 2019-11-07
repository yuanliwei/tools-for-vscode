# tools-for-vscode README

- 小工具箱

## 使用方式
- 选中要操作的文本(无选中文本时命令操作对象为整个文档)
- 使用 `Ctrl+Shift+P` 调出命令面板
- 输入要进行操作的命令
- `ENTER`

## 功能&命令列表

### 文本操作
- 删除文档中包含选中文本的行 `Line Remove Include Select`
- 删除文档中不包含选中文本的行 `Line Remove Exclude Select`
- 删除文档中的空行 `Line Remove Empty`
- 把文档每一行按正序排序 `Line Sort Asc`
- 把文档每一行按倒序排序 `Line Sort Desc`
- 删除文档每一行两边的空格 `Line Trim`
- 删除文档每一行左边的空格 `Line Trim Left`
- 删除文档每一行右边的空格 `Line Trim Right`
- 在文档当前位置插入当前时间 `Current Time`
- 格式化文档选中部分或整个文档中的UTC日期 `Format Time`
### 代码
- 把当前文档或选中部分当作 JavaScript 代码使用 node 运行 `Run Code`
- 对齐文档或选中部分的注释(//) `Comment Align`
- 把当前文档当作 JavaScript 代码进行格式化 `JS format`
- 把当前文档当作 CSS 代码进行格式化 `CSS format`
- 把当前文档当作 SQL 代码进行格式化 `SQL format`
- 把当前文档当作 XML 代码进行格式化 `XML format`
- 把当前文档当作 JSON 代码进行格式化 `JSON format`
- 把当前文档当作 CSS 代码进行压缩 `CSS min`
- 把当前文档当作 SQL 代码进行压缩 `SQL min`
- 把当前文档当作 XML 代码进行压缩 `XML min`
- 把当前文档当作 JSON 代码进行压缩 `JSON min`
### SHA&MD5
- 计算文档选中部分的 MD5 `Crypto md5`
- 计算文档选中部分的 SHA1 `Crypto sha1`
- 计算文档选中部分的 SHA256 `Crypto sha256`
- 计算文档选中部分的 SHA512 `Crypto sha512`
### 编码&解码
- 生成文档选中部分的 URi 编码 `Encode encodeUri`
- 生成文档选中部分的 BASE64 编码 `Encode encodeBase64`
- 生成文档选中部分的 HEX 编码 `Encode encodeHex`
- 生成文档选中部分的 HTML 编码 `Encode encodeHtml`
- 生成文档选中部分的 Native 编码 `Encode encodeNative`
- 生成文档选中部分的 Unicode 编码 `Encode encodeUnicode`
- 生成文档选中部分的 escape 编码 `Encode encodeEscape`

- 对文档选中部分使用 URi 编码进行解码 `Encode decodeUri`
- 对文档选中部分使用 BASE64 编码进行解码 `Encode decodeBase64`
- 对文档选中部分使用 HEX 编码进行解码 `Encode decodeHex`
- 对文档选中部分使用 HTML 编码进行解码 `Encode decodeHtml`
- 对文档选中部分使用 Native 编码进行解码 `Encode decodeNative`
- 对文档选中部分使用 Unicode 编码进行解码 `Encode decodeUnicode`
- 对文档选中部分使用 escape 编码进行解码 `Encode decodeEscape`
## 转码
- 把当前文档当作 `CoffeeScript` 转换为 `JavaScript` 代码 `Encode decodeCoffee`
- 把当前文档当作 `Less` 转换为 `CSS` 代码 `Encode decodeLess`
- 把当前文档当作 `Markdown` 转换为 `HTML` 代码 `Encode markdownToHtml`
## 翻译
- 把文档中选中的文本翻译为中文 `Encode translate_zh`
- 把文档中选中的文本翻译为英文 `Encode translate_en`
- 切换实时翻译开关，开关打开后会把当前选中文本的中文翻译使用 tooltip 的方式提示出来 `Encode Toggle Translate`
## 图片转文字
- 把剪贴板中的图片转换为文字插入到当前文档中 `OCR Paste Image`

## 多个剪贴板&剪贴板同步
- `Ctrl+Shift+V` 调出剪贴板列表
- 剪贴板内容通过git仓库在多台设备上保持同步
- `"tools.multiclip_repo": "git@git.com:yuanliwei/vscode-multiclip.git"`
- `"tools.multiclip_repo_dir": "./vscode-multiclip"`

# TODO
## 文本转语音
