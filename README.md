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

### 文本行操作

#### 删除操作
- `Line Remove Empty` - 删除空行
- `Line Remove Duplicate` - 删除重复行
- `Line Remove Include Select` - 删除包含选中文本的行
- `Line Remove Exclude Select` - 删除不包含选中文本的行
- `Line Remove Match Regexp` - 删除匹配正则表达式的行
- `Line Remove Not Match Regexp` - 保留匹配正则表达式的行

#### 排序操作
- `Line Sort Asc` - 升序排序
- `Line Sort Desc` - 降序排序
- `Line Sort Random` - 随机排序
- `Line Sort Number` - 按数字大小排序
- `Line Reverse` - 反转行顺序

#### 格式化操作
- `Line Trim` - 删除行首尾空格
- `Line Trim Left` - 删除行首空格
- `Line Trim Right` - 删除行尾空格
- `Line Add Line Number` - 添加行号
- `Line Add Line Number From Input` - 从输入起始值添加行号
- `Line Add Line Number With Separator` - 添加带分隔符的行号

#### 转换操作
- `Line Separator Underline To Hump` - 下划线转驼峰
- `Line Separator Hump To Underline` - 驼峰转下划线
- `Line First Letter Lowercase` - 首字母小写
- `Line First Letter Uppercase` - 首字母大写
- `Line Replace Backslash(\\) To Slash(/)` - 反斜杠转斜杠
- `Line Repeat` - 重复行

#### 分组统计
- `Line Group Duplicate` - 统计重复行
- `Line Group Duplicate Sort Number Reverse` - 统计重复行并按数量降序

### 代码格式化

#### 格式化
- `JS format` - JavaScript 格式化
- `CSS format` - CSS 格式化
- `SQL format` - SQL 格式化
- `XML format` - XML 格式化
- `JSON format` - JSON 格式化

#### 压缩
- `CSS min` - CSS 压缩
- `SQL min` - SQL 压缩
- `XML min` - XML 压缩
- `JSON min` - JSON 压缩

### JSON 工具

- `deep parse JSON` - 深度解析 JSON 字符串
- `rearrange JSON key` - 重排 JSON 键名顺序
- `JSON Info` - JSON 信息分析
- `JSON Ascii Table` - JSON 转 ASCII 表格
- `JSON Limit Depth` - 限制 JSON 显示深度
- `normalize JSON` - 规范化 JSON
- `extract JSON` - 提取 JSON
- `extract js|json types` - 提取 JS/JSON 类型定义

### 加密与哈希

- `Crypto md5` - MD5 哈希
- `Crypto sha1` - SHA1 哈希
- `Crypto sha256` - SHA256 哈希
- `Crypto sha512` - SHA512 哈希

### 编码与解码

#### 编码
- `Encode uri` - URI 编码
- `Encode base64` - Base64 编码
- `Encode hex` - Hex 编码
- `Encode html` - HTML 编码
- `Encode native` - Native 编码
- `Encode unicode` - Unicode 编码
- `Encode escape` - Escape 编码
- `Encode escape simple` - 简单 Escape 编码
- `Encode escape with crlf` - Escape 编码（含换行符）

#### 解码
- `Decode uri` - URI 解码
- `Decode base64` - Base64 解码
- `Decode hex` - Hex 解码
- `Decode html` - HTML 解码
- `Decode native` - Native 解码
- `Decode unicode` - Unicode 解码
- `Decode unescape` - Unescape 解码
- `Decode json parse` - JSON 解析

### 时间与日期

- `Current Time` - 当前时间（完整格式）
- `Current Time Short` - 当前时间（短格式）
- `timestamp` - 时间戳
- `Format Time` - 格式化时间戳
- `Parse Time` - 解析时间

### 生成工具

#### GUID/随机数
- `guid` - 生成 GUID
- `guid same` - 生成相同 GUID
- `random number` - 随机数
- `random hex` - 随机 Hex
- `random hex same` - 生成相同随机 Hex

#### 序列号生成
- `sequence number 1` - 数字序列 1,2,3...
- `sequence number 一` - 中文数字序列 一,二,三...
- `sequence number 壹` - 大写数字序列 壹,贰,叁...
- `sequence number a` - 字母序列 a,b,c...
- `sequence number A` - 大写字母序列 A,B,C...
- `sequence number ①` - 圆圈数字序列
- `sequence number Ⅰ` - 罗马数字序列（大写）
- `sequence number ⅰ` - 罗马数字序列（小写）
- `sequence number ㍘` - 日语单位序列
- `sequence number ㎀` - 物理单位序列
- `sequence number ㏠` - 其他单位序列
- `sequence number 😀` - 表情序列（笑脸）
- `sequence number 👩` - 表情序列（人物）
- `sequence number 💪` - 表情序列（手势）
- `sequence number 🎈` - 表情序列（物品）
- `sequence number 🍕` - 表情序列（食物）
- `sequence number 🚗` - 表情序列（交通）
- `sequence number ❤` - 表情序列（爱心）
- `sequence number ☮` - 表情序列（符号）
- `sequence number 0️⃣` - 表情序列（数字）
- `sequence number 🔴` - 表情序列（圆形）
- `sequence number 🟥` - 表情序列（方形）
- `sequence number 🔶` - 表情序列（菱形）
- `sequence number 🕐` - 表情序列（时钟）

#### 其他生成
- `xing ming` - 生成随机中文姓名
- `lorem` - 生成 Lorem Ipsum 文本

### 数据计算

- `numbers summation 求和` - 数字求和
- `numbers average 求平均值` - 数字求平均值
- `Format bytes` - 格式化字节大小

### 编辑工具

- `Comment Align` - 注释对齐
- `Cursor Align` - 光标对齐
- `Format Multi Line Comment` - 格式化多行注释
- `fill space` - 填充空格
- `cursors drop` - 光标下移

### 清理工具

- `Clean ANSI Escape Codes` - 清理 ANSI 控制字符
- `Clean Diff Change` - 清理 Diff 变更标记

### 预览

- `preview html` - 预览 HTML
- `Markdown Preview` - Markdown 预览

### 转换工具

- `Translate markdown to html` - Markdown 转 HTML
- `Translate translate to zh` - 翻译为中文
- `Translate translate to en` - 翻译为英文
- `Translate toggle translate` - 切换翻译
- `LaTeX → Markdown Math` - LaTeX 转 Markdown 数学公式

### 其他工具

- `Eval Print` - 执行 JavaScript 表达式
- `Run Command In Terminal` - 在终端执行命令
- `Chat Edit Prompts` - 编辑聊天提示词
- `y-todo` - 待办事项

## 配置

在 VSCode 设置中可配置以下选项：

- `tools.translate_url` - 翻译服务 URL
- `tools.chat_url` - 聊天服务 URL

## 开发

```bash
# 开发模式
npm run dev

# 运行测试
npm test
```

## 贡献指南

欢迎 PR、Issue 反馈或功能建议！
1. Fork 本项目，创建分支。
2. 提交代码并发起 PR。
3. 更多细节请参考项目结构与源码注释。

## 许可证

BSD