import type { TextEditor } from 'vscode'

export type EditOptions = {
    append?: boolean;
    insert?: boolean;
    noChange?: boolean;
    replace?: boolean;
    handleEmptySelection?: boolean;
    insertNewLines?: number;
    noEditor?: boolean;
    preferCurrentLine?: boolean; // 没有选择文本时 使用当前光标位置整行文本， 默认是整个文档
}

export type EditCallback = (text: string) => (Promise<string | void> | string);

export type CommandInfo = {
    id: string;
    label: string;
    icon?: string;
    action: (ed: TextEditor, args: any[] | any) => Promise<void>;
};

export type CommandItem = {
    id: string;
    label: string;
    icon?: string;
};
export type ContributeCommandItem = {
    command: string;
    title: string;
    icon?: string;
};