import type { TextEditor } from 'vscode'

export type EditOptions = {
    append?: boolean;
    insert?: boolean;
    noChange?: boolean;
    replace?: boolean;
    handleEmptySelection?: boolean;
    insertNewLines?: number;
    noEditor?: boolean;
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
export type CommandItem2 = {
    command: string;
    title: string;
    icon?: string;
};