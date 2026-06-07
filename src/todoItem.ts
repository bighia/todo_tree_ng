import * as vscode from "vscode";

export interface TodoItemData {
  file: string;
  line: number;
  text: string;
  priority: "high" | "medium" | "low";
  type: "TODO" | "FIXME" | "BUG" | "HACK" | "NOTE";
  lineText: string;
}

export class TodoItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly command?: vscode.Command,
    public readonly data?: TodoItemData,
  ) {
    super(label, collapsibleState);
  }

  iconPath = new vscode.ThemeIcon("checklist");
}

export class TodoFileItem extends vscode.TreeItem {
  constructor(
    public readonly file: string,
    public readonly count: number,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
  ) {
    super(`${file} (${count})`, collapsibleState);
    this.iconPath = vscode.ThemeIcon.File;
  }
}
