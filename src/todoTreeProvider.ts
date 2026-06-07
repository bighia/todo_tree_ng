import * as vscode from "vscode";
import { TodoFileItem, TodoItem, TodoItemData } from "./todoItem";
import { TodoScanner } from "./todoScanner";

export class TodoTreeDataProvider implements vscode.TreeDataProvider<
  TodoItem | TodoFileItem
> {
  private _onDidChangeTreeData: vscode.EventEmitter<
    (TodoItem | TodoFileItem | undefined) | void
  > = new vscode.EventEmitter<(TodoItem | TodoFileItem | undefined) | void>();
  readonly onDidChangeTreeData: vscode.Event<
    (TodoItem | TodoFileItem | undefined) | void
  > = this._onDidChangeTreeData.event;

  private scanner: TodoScanner;
  private todos: TodoItemData[] = [];
  private fileMap: Map<string, TodoItemData[]> = new Map();
  private groupByFile = true;
  private filterType: string | null = null;

  constructor() {
    this.scanner = new TodoScanner();
  }

  async refresh(): Promise<void> {
    this.todos = await this.scanner.scanWorkspace(
      vscode.workspace.workspaceFolders,
    );
    this.buildFileMap();
    this._onDidChangeTreeData.fire();
  }

  private buildFileMap(): void {
    this.fileMap.clear();

    for (const todo of this.todos) {
      if (!this.fileMap.has(todo.file)) {
        this.fileMap.set(todo.file, []);
      }
      this.fileMap.get(todo.file)!.push(todo);
    }
  }

  getTreeItem(
    element: TodoItem | TodoFileItem,
  ): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }

  async getChildren(
    element?: TodoItem | TodoFileItem,
  ): Promise<(TodoItem | TodoFileItem)[]> {
    if (!element) {
      // Root level
      if (this.groupByFile) {
        return this.getFileItems();
      } else {
        return this.getTodoItems(this.todos);
      }
    }

    if (element instanceof TodoFileItem) {
      // Get TODOs for this file
      const fileTodos = this.fileMap.get(element.file) || [];
      return this.getTodoItems(fileTodos);
    }

    return [];
  }

  private getFileItems(): TodoFileItem[] {
    const fileItems: TodoFileItem[] = [];

    for (const [file, todos] of this.fileMap.entries()) {
      const filteredTodos = this.filterType
        ? todos.filter((t) => t.type === this.filterType)
        : todos;

      if (filteredTodos.length > 0) {
        fileItems.push(
          new TodoFileItem(
            file,
            filteredTodos.length,
            vscode.TreeItemCollapsibleState.Collapsed,
          ),
        );
      }
    }

    // Sort files alphabetically
    fileItems.sort((a, b) => a.file.localeCompare(b.file));
    return fileItems;
  }

  private getTodoItems(todos: TodoItemData[]): TodoItem[] {
    const filtered = this.filterType
      ? todos.filter((t) => t.type === this.filterType)
      : todos;

    return filtered.map((todo) => {
      const label = `[${todo.type}] ${todo.text} (Line ${todo.line})`;
      const command: vscode.Command = {
        command: "todo-tree-ng.openFile",
        title: "Open File",
        arguments: [todo.file, todo.line],
      };

      const item = new TodoItem(
        label,
        vscode.TreeItemCollapsibleState.None,
        command,
        todo,
      );

      // Set description to show file path when grouped
      item.description = this.groupByFile ? undefined : todo.file;

      // Color code by priority
      if (todo.priority === "high") {
        item.iconPath = new vscode.ThemeIcon("error");
      } else if (todo.priority === "medium") {
        item.iconPath = new vscode.ThemeIcon("warning");
      } else {
        item.iconPath = new vscode.ThemeIcon("info");
      }

      // Add line text as tooltip
      item.tooltip = new vscode.MarkdownString(
        `**${todo.type}** (Priority: ${todo.priority})\n\n${todo.lineText}`,
      );

      return item;
    });
  }

  setGroupByFile(group: boolean): void {
    this.groupByFile = group;
    this._onDidChangeTreeData.fire();
  }

  setFilterType(type: string | null): void {
    this.filterType = type;
    this._onDidChangeTreeData.fire();
  }

  getFilterType(): string | null {
    return this.filterType;
  }
}
