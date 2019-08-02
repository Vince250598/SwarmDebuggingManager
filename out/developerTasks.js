"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
class DevTasksProvider {
}
exports.DevTasksProvider = DevTasksProvider;
class Task extends vscode.TreeItem {
    constructor(label, collapsibleState, command) {
        super(label, collapsibleState);
        this.label = label;
        this.collapsibleState = collapsibleState;
        this.command = command;
        this.contextValue = 'Task';
    }
    get tooltip() {
        return `${this.label}`;
    }
}
exports.Task = Task;
//# sourceMappingURL=developerTasks.js.map