import * as vscode from "vscode";
import { TodoScanner } from "./todoScanner";
import { TodoTreeDataProvider } from "./todoTreeProvider";

let todoProvider: TodoTreeDataProvider;
let scanner: TodoScanner;
let fileWatcher: vscode.FileSystemWatcher | undefined;

export function activate(context: vscode.ExtensionContext) {
  console.log("TODO Tree NG extension activated");

  todoProvider = new TodoTreeDataProvider();
  scanner = new TodoScanner();

  // Register tree view
  const treeView = vscode.window.createTreeView("todoTreeView", {
    treeDataProvider: todoProvider,
  });
  context.subscriptions.push(treeView);

  // Register commands
  const refreshCommand = vscode.commands.registerCommand(
    "todo-tree-ng.refresh",
    async () => {
      await todoProvider.refresh();
      vscode.window.showInformationMessage("TODOs refreshed");
    },
  );
  context.subscriptions.push(refreshCommand);

  const openFileCommand = vscode.commands.registerCommand(
    "todo-tree-ng.openFile",
    async (file: string, line: number) => {
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (!workspaceFolders) {
        return;
      }

      const filePath = vscode.Uri.file(
        `${workspaceFolders[0].uri.fsPath}/${file}`,
      );

      try {
        const doc = await vscode.workspace.openTextDocument(filePath);
        const editor = await vscode.window.showTextDocument(doc);

        // Go to line
        const lineIndex = Math.max(0, line - 1);
        const range = new vscode.Range(lineIndex, 0, lineIndex, 0);
        editor.selection = new vscode.Selection(range.start, range.start);
        editor.revealRange(range, vscode.TextEditorRevealType.InCenter);
      } catch (error) {
        vscode.window.showErrorMessage(`Could not open file: ${file}`);
      }
    },
  );
  context.subscriptions.push(openFileCommand);

  const toggleFilterCommand = vscode.commands.registerCommand(
    "todo-tree-ng.toggleFilter",
    async () => {
      const types = ["TODO", "FIXME", "BUG", "HACK", "NOTE"];
      const currentFilter = todoProvider.getFilterType();

      const selected = await vscode.window.showQuickPick(["All", ...types]);

      if (selected) {
        if (selected === "All") {
          todoProvider.setFilterType(null);
        } else {
          todoProvider.setFilterType(selected);
        }
      }
    },
  );
  context.subscriptions.push(toggleFilterCommand);

  // Initial scan
  todoProvider.refresh();

  // Watch for file changes
  setupFileWatcher(context);

  // Listen for configuration changes
  const configChangeListener = vscode.workspace.onDidChangeConfiguration(
    async (event) => {
      if (event.affectsConfiguration("todoTreeNG")) {
        await todoProvider.refresh();
      }
    },
  );
  context.subscriptions.push(configChangeListener);

  // Listen for workspace folder changes
  const folderChangeListener = vscode.workspace.onDidChangeWorkspaceFolders(
    async () => {
      await todoProvider.refresh();
      setupFileWatcher(context);
    },
  );
  context.subscriptions.push(folderChangeListener);
}

function setupFileWatcher(context: vscode.ExtensionContext): void {
  // Dispose old watcher if exists
  if (fileWatcher) {
    fileWatcher.dispose();
  }

  const config = vscode.workspace.getConfiguration("todoTreeNG");
  const autoRefresh = config.get<boolean>("autoRefresh", true);

  if (!autoRefresh) {
    return;
  }

  // Create a file system watcher for common source files
  // Focus on source extensions to avoid watching node_modules, dist, etc.
  fileWatcher = vscode.workspace.createFileSystemWatcher(
    "**/*.{ts,tsx,js,jsx,py,java,cs,go,rs,cpp,c,h,css,html,md,sh,yml,yaml,json}",
    false,
    false,
    false,
  );

  const debounceDelay = 1000;
  let debounceTimer: NodeJS.Timeout | undefined;

  const onFileChange = () => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(() => {
      todoProvider.refresh();
      debounceTimer = undefined;
    }, debounceDelay);
  };

  fileWatcher.onDidChange(onFileChange);
  fileWatcher.onDidCreate(onFileChange);
  fileWatcher.onDidDelete(onFileChange);

  context.subscriptions.push(fileWatcher);
}

export function deactivate() {
  if (fileWatcher) {
    fileWatcher.dispose();
  }
}
