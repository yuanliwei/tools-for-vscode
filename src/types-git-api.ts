export type GitApi = {
    /**
     * 获取所有 Git 仓库
     */
    repositories: Repository[]
    /**
     * 获取指定版本的 API
     * @param version API 版本号
     */
    getAPI(version: number): GitApi
    /**
     * Git 可执行文件路径
     */
    git: {
        path: string
        version: string
    }
    /**
     * 将 URI 转换为 Git URI
     */
    toGitUri(uri: import('vscode').Uri, ref: string): import('vscode').Uri
}

export type Repository = {
    /**
     * 仓库根目录 URI
     */
    rootUri: import('vscode').Uri
    /**
     * 仓库状态
     */
    state: RepositoryState
    /**
     * 获取文件的 diff
     * @param uri 文件 URI
     * @param ref Git 引用（如 'HEAD' 表示暂存区，'' 表示工作区）
     */
    diff(uri: import('vscode').Uri, ref?: string): Promise<string | undefined>
    /**
     * Source Control 输入框
     */
    inputBox: SourceControlInputBox
    /**
     * 获取提交信息
     */
    getCommit(hash: string): Promise<Commit | undefined>
    /**
     * 获取 blame 信息
     */
    blame(path: string): Promise<string>
    /**
     * diff between two refs
     */
    diffBetween(ref1: string, ref2: string): Promise<Change[]>
    /**
     * 获取日志
     */
    log(options?: LogOptions): Promise<Commit[]>
}

export type RepositoryState = {
    /**
     * 暂存的修改
     */
    indexChanges: Change[]
    /**
     * 未暂存的修改
     */
    workingTreeChanges: Change[]
    /**
     * 合并组
     */
    mergeGroup: ResourceGroup | undefined
    /**
     * HEAD 引用
     */
    HEAD: Commit | undefined
    /**
     * 仓库状态
     */
    HEAD_COMMIT?: string
}

export type Change = {
    /**
     * 文件 URI
     */
    uri: import('vscode').Uri
    /**
     * 原始 URI（用于重命名）
     */
    originalUri: import('vscode').Uri | undefined
    /**
     * 变更状态
     */
    status: Status
}

export type Status = number
export const Status = {
    INDEX_MODIFIED: 1,
    INDEX_ADDED: 2,
    INDEX_DELETED: 3,
    INDEX_RENAMED: 4,
    INDEX_COPIED: 5,
    MODIFIED: 6,
    DELETED: 7,
    UNTRACKED: 8,
    IGNORED: 9,
    INTENT_TO_ADD: 10,
    ADDED_BY_US: 11,
    ADDED_BY_THEM: 12,
    DELETED_BY_US: 13,
    DELETED_BY_THEM: 14,
    BOTH_ADDED: 15,
    BOTH_DELETED: 16,
    BOTH_MODIFIED: 18,
} as const

export type ResourceGroup = {
    /**
     * 资源状态列表
     */
    resourceStates: ResourceState[]
}

export type ResourceState = {
    /**
     * 资源 URI
     */
    resourceUri: import('vscode').Uri
    /**
     * 装饰
     */
    decorations: import('vscode').SourceControlResourceDecorations
    /**
     * 命令
     */
    command: import('vscode').Command | undefined
}

export type SourceControlInputBox = {
    /**
     * 输入框的值
     */
    value: string
    /**
     * 占位符文本
     */
    placeholder: string
    /**
     * 是否启用
     */
    enabled: boolean
    /**
     * 是否可见
     */
    visible: boolean
    /**
     * 输入框按钮
     */
    buttons: InputBoxButton[]
}

export type InputBoxButton = {
    /**
     * 按钮命令
     */
    command: string
    /**
     * 按钮图标
     */
    icon: string
    /**
     * 工具提示
     */
    tooltip?: string
}

export type Commit = {
    /**
     * 提交哈希
     */
    hash: string
    /**
     * 提交消息
     */
    message: string
    /**
     * 作者姓名
     */
    authorName: string
    /**
     * 作者邮箱
     */
    authorEmail: string
    /**
     * 作者日期
     */
    authorDate: Date
    /**
     * 提交者姓名
     */
    committerName: string
    /**
     * 提交者邮箱
     */
    committerEmail: string
    /**
     * 提交日期
     */
    commitDate: Date
    /**
     * 父提交哈希列表
     */
    parents: string[]
    /**
     * 简短统计
     */
    shortStat?: {
        files: number
        insertions: number
        deletions: number
    }
}

export type LogOptions = {
    /**
     * 限制返回数量
     */
    maxCount?: number
    /**
     * 起始哈希
     */
    from?: string
    /**
     * 结束哈希
     */
    to?: string
}