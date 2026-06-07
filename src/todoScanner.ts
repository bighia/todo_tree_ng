import * as fs from "fs";
import * as path from "path";
import { TodoItemData } from "./todoItem";

export class TodoScanner {
  private readonly todoPatterns = [
    /\/\/\s*(TODO|FIXME|BUG|HACK|NOTE)[\s:]*(.+?)(?:\s*[-–]\s*(.+))?$/gm, // JS/TS style
    /\/\*\s*(TODO|FIXME|BUG|HACK|NOTE)[\s:]*(.+?)(?:\s*[-–]\s*(.+))?\s*\*\//gm, // Block comment
    /#\s*(TODO|FIXME|BUG|HACK|NOTE)[\s:]*(.+?)(?:\s*[-–]\s*(.+))?$/gm, // Python/Shell style
    /<!--\s*(TODO|FIXME|BUG|HACK|NOTE)[\s:]*(.+?)(?:\s*[-–]\s*(.+))?\s*-->/gm, // HTML comment
  ];

  async scanWorkspace(
    workspaceFolders?: readonly vscode.WorkspaceFolder[],
  ): Promise<TodoItemData[]> {
    const todos: TodoItemData[] = [];

    if (!workspaceFolders || workspaceFolders.length === 0) {
      return todos;
    }

    for (const folder of workspaceFolders) {
      const folderTodos = await this.scanDirectory(
        folder.uri.fsPath,
        folder.uri.fsPath,
      );
      todos.push(...folderTodos);
    }

    return todos;
  }

  private async scanDirectory(
    dirPath: string,
    workspacePath: string,
    depth: number = 0,
  ): Promise<TodoItemData[]> {
    const todos: TodoItemData[] = [];
    const maxDepth = 20;

    if (depth > maxDepth) {
      return todos;
    }

    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        const relativePath = path.relative(workspacePath, fullPath);

        // Check exclusions
        if (this.shouldExclude(relativePath)) {
          continue;
        }

        if (entry.isDirectory()) {
          const dirTodos = await this.scanDirectory(
            fullPath,
            workspacePath,
            depth + 1,
          );
          todos.push(...dirTodos);
        } else if (entry.isFile()) {
          const fileTodos = this.scanFile(fullPath, relativePath);
          todos.push(...fileTodos);
        }
      }
    } catch (error) {
      // Silently skip directories we can't read
    }

    return todos;
  }

  private scanFile(filePath: string, relativePath: string): TodoItemData[] {
    const todos: TodoItemData[] = [];

    try {
      // Check file size to avoid large files
      const stats = fs.statSync(filePath);
      if (stats.size > 5 * 1024 * 1024) {
        // Skip files larger than 5MB
        return todos;
      }

      const content = fs.readFileSync(filePath, "utf8");
      const lines = content.split("\n");

      // Reset regex lastIndex for global patterns
      this.todoPatterns.forEach((pattern) => (pattern.lastIndex = 0));

      lines.forEach((lineText, lineNumber) => {
        for (const pattern of this.todoPatterns) {
          let match;
          pattern.lastIndex = 0;

          while ((match = pattern.exec(lineText)) !== null) {
            const type = match[1].toUpperCase() as
              | "TODO"
              | "FIXME"
              | "BUG"
              | "HACK"
              | "NOTE";
            const text = match[2]?.trim() || "No description";
            const priority = this.extractPriority(text);

            todos.push({
              file: relativePath,
              line: lineNumber + 1,
              text,
              priority,
              type,
              lineText: lineText.trim(),
            });
          }
        }
      });
    } catch (error) {
      // Silently skip files we can't read
    }

    return todos;
  }

  private extractPriority(text: string): "high" | "medium" | "low" {
    const upperText = text.toUpperCase();
    if (
      upperText.includes("HIGH") ||
      upperText.includes("CRITICAL") ||
      upperText.includes("URGENT")
    ) {
      return "high";
    }
    if (
      upperText.includes("LOW") ||
      upperText.includes("MINOR") ||
      upperText.includes("NICE-TO-HAVE")
    ) {
      return "low";
    }
    return "medium";
  }

  private shouldExclude(relativePath: string): boolean {
    const config = vscode.workspace.getConfiguration("todoTreeNG");
    const exclude = config.get<string[]>("exclude", []);

    for (const pattern of exclude) {
      if (this.matchesPattern(relativePath, pattern)) {
        return true;
      }
    }

    return false;
  }

  private matchesPattern(filePath: string, pattern: string): boolean {
    // Simple glob pattern matching
    const regexPattern = pattern
      .replace(/\//g, "[\\\\/]")
      .replace(/\*/g, ".*")
      .replace(/\?/g, ".");

    const regex = new RegExp(`^${regexPattern}$`, "i");
    return regex.test(filePath);
  }

  async scanSingleFile(filePath: string): Promise<TodoItemData[]> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
      return [];
    }

    const workspacePath = workspaceFolders[0].uri.fsPath;
    const relativePath = path.relative(workspacePath, filePath);

    return this.scanFile(filePath, relativePath);
  }
}

import * as vscode from "vscode";
