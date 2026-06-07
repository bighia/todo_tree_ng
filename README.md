# TODO Tree NG

A lightweight, zero-dependency VS Code extension for discovering and managing TODOs in your workspace without requiring ripgrep or any external tools.

## Features

✨ **No External Dependencies** - Uses Node.js built-in `fs` and `path` modules for file scanning

- No ripgrep required
- No system dependencies
- Lightweight and fast

📋 **Tree View Organization** - Display TODOs in a beautiful sidebar tree

- Group by file with counts
- Filter by TODO type (TODO, FIXME, BUG, HACK, NOTE)
- Priority indicators (High, Medium, Low)
- Click to jump directly to TODO in editor

🎯 **Smart Scanning** - Recognizes multiple comment formats

- JavaScript/TypeScript: `// TODO`
- Block comments: `/* TODO */`
- Python/Shell: `# TODO`
- HTML comments: `<!-- TODO -->`

🔄 **Automatic Updates** - Real-time TODO tracking

- Auto-refresh on file changes (configurable)
- Configurable file include/exclude patterns
- Watch workspace folder changes

🚀 **Future-Ready** - Designed for Antigravity integration

- Modular architecture
- Extensible scanning system
- Clean API for external tools

## Quick Start

1. Install the extension from VS Code Marketplace
2. Open any workspace with TODO comments
3. Click the TODO icon in the Activity Bar (left sidebar)
4. TODOs automatically appear in the tree view

## Usage

### Basic Commands

- **Refresh TODOs** - Click the refresh icon to manually rescan workspace
- **Open File** - Click any TODO to open the file and jump to that line
- **Filter** - Use the filter command to show only specific TODO types

### Keyboard Shortcuts

| Shortcut                         | Command           |
| -------------------------------- | ----------------- |
| `Ctrl+Shift+P` → `Todo: Refresh` | Refresh TODO list |
| Click on TODO                    | Open file at line |

## Configuration

Configure the extension in your workspace settings (`.vscode/settings.json`):

```json
{
  "todoTreeNG.include": [
    "**/*.ts",
    "**/*.tsx",
    "**/*.js",
    "**/*.jsx",
    "**/*.py",
    "**/*.java",
    "**/*.cs",
    "**/*.go"
  ],
  "todoTreeNG.exclude": ["**/node_modules", "**/.git", "**/dist", "**/build"],
  "todoTreeNG.autoRefresh": true
}
```

### Default Include Patterns

- TypeScript/JavaScript: `.ts`, `.tsx`, `.js`, `.jsx`
- Python: `.py`
- Java: `.java`
- C#: `.cs`
- Go: `.go`, `.rs`
- Markup: `.css`, `.html`, `.md`
- Config: `.yml`, `.yaml`, `.json`
- Scripts: `.sh`

### Default Exclude Patterns

- `**/node_modules`
- `**/.git`
- `**/dist`
- `**/build`
- `**/.vscode`
- `**/venv`
- `**/__pycache__`

## TODO Format Examples

### Standard Formats

```typescript
// TODO: Implement user authentication
/* TODO: Add error handling */
# TODO: Optimize database queries
<!-- TODO: Update styling -->
```

### With Priority

```javascript
// TODO: HIGH - Critical bug fix needed
// TODO: LOW - Nice-to-have feature
// TODO: MEDIUM - Regular improvement
```

### With Descriptions

```python
# TODO - This needs refactoring because the logic is too complex
// TODO Fix - Handle edge case when user cancels operation
```

## Recognized TODO Types

| Type      | Symbol | Use Case                |
| --------- | ------ | ----------------------- |
| **TODO**  | ✓      | General task to be done |
| **FIXME** | 🔧     | Known bug or issue      |
| **BUG**   | 🐛     | Confirmed bug           |
| **HACK**  | ⚠️     | Temporary/ugly solution |
| **NOTE**  | 📝     | Important note          |

## Performance

- **Efficient Scanning** - Skips binary files and large files (>5MB)
- **Debounced Refresh** - Prevents excessive re-scanning on rapid file changes
- **Configurable Depth** - Maximum directory traversal depth to prevent slowdown
- **Memory Efficient** - Streams file reading instead of loading entire workspace

## Architecture

### Core Components

1. **TodoScanner** (`todoScanner.ts`)
   - Workspace file discovery
   - Pattern matching for TODO comments
   - Configurable file filtering

2. **TodoTreeProvider** (`todoTreeProvider.ts`)
   - Tree view data provider
   - Filtering and grouping logic
   - Real-time updates

3. **Extension** (`extension.ts`)
   - Command registration
   - File watcher management
   - Configuration handling

## Future Plans

### Planned Features

- [ ] Search and filter TODOs with regex
- [ ] Assign TODOs to team members
- [ ] Due date support
- [ ] Custom colors per priority level
- [ ] Export TODOs to JSON/CSV
- [ ] Antigravity platform integration
- [ ] Multi-workspace support improvements
- [ ] Custom TODO type definitions

### Antigravity Integration

This extension is designed to work seamlessly with the Antigravity platform. The modular architecture allows for:

- Remote TODO syncing
- Team collaboration features
- Integration with issue tracking systems
- API support for external tools

## Comparison with TODO Tree

| Feature               | TODO Tree NG | TODO Tree                |
| --------------------- | ------------ | ------------------------ |
| External Dependencies | None         | Requires ripgrep         |
| Memory Usage          | Low          | Medium-High              |
| Scan Speed            | Good         | Faster                   |
| Configuration         | Simple       | Advanced                 |
| Setup Complexity      | Easy         | Requires ripgrep install |

## Troubleshooting

### TODOs Not Showing Up

1. Check file patterns in `todoTreeNG.include`
2. Verify files aren't excluded by `todoTreeNG.exclude`
3. Click the refresh button to force rescan
4. Check VS Code output panel for errors

### High Memory Usage

- Reduce file include patterns
- Add more exclude patterns
- Disable `autoRefresh` if watching large workspaces

### Extension Not Working

1. Reload VS Code window (`Ctrl+Shift+P` → `Developer: Reload Window`)
2. Check that workspace is open (not just a file)
3. Enable debug logging in VS Code console

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

MIT

## Author

Created as a lightweight alternative to TODO Tree with no external dependencies.

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

- `myExtension.enable`: Enable/disable this extension.
- `myExtension.thing`: Set to `blah` to do something.

## Known Issues

Calling out known issues can help limit users opening duplicate issues against your extension.

## Release Notes

Users appreciate release notes as you update your extension.

### 1.0.0

Initial release of ...

### 1.0.1

Fixed issue #.

### 1.1.0

Added features X, Y, and Z.

---

## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

- [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

## Working with Markdown

You can author your README using Visual Studio Code. Here are some useful editor keyboard shortcuts:

- Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux).
- Toggle preview (`Shift+Cmd+V` on macOS or `Shift+Ctrl+V` on Windows and Linux).
- Press `Ctrl+Space` (Windows, Linux, macOS) to see a list of Markdown snippets.

## For more information

- [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
- [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**
