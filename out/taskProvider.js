"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const graphql_request_1 = require("graphql-request");
const extension_1 = require("./extension");
class TaskProvider {
    constructor(productID) {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.productID = productID;
    }
    getChildren(task) {
        return __awaiter(this, void 0, void 0, function* () {
            let treeTasks = getTasks(this.productID);
            return treeTasks;
        });
    }
    getTreeItem(task) {
        return task;
    }
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    setProductID(productID) {
        this.productID = productID;
    }
    getProductID() {
        return this.productID;
    }
    updateProductId(productID) {
        this.setProductID(productID);
        this.refresh();
    }
}
exports.TaskProvider = TaskProvider;
function getTasks(productId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = `query tasks($productId: Long) {
		tasksActive(productId: $productId) {
			id
			title
			url
		}
	}`;
        const variables = {
            productId: productId
        };
        var data = yield graphql_request_1.request(extension_1.SERVERURL, query, variables);
        console.log(data);
        let tasks = [];
        for (let i = 0; i < data.tasksActive.length; i++) {
            tasks[i] = new TreeTask(data.tasksActive[i].url, data.tasksActive[i].id, data.tasksActive[i].title, vscode.TreeItemCollapsibleState.None);
        }
        return tasks;
    });
}
class TreeTask extends vscode.TreeItem {
    constructor(url, taskId, label, collapsibleState) {
        super(label, collapsibleState);
        this.contextValue = 'task';
        this.url = url;
        this.taskId = taskId;
    }
}
exports.TreeTask = TreeTask;
//# sourceMappingURL=taskProvider.js.map