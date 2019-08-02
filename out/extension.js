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
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const taskProvider_1 = require("./taskProvider");
const developer_1 = require("./objects/developer");
const product_1 = require("./objects/product");
const task_1 = require("./objects/task");
const session_1 = require("./objects/session");
exports.SERVERURL = 'http://localhost:8080/graphql?';
var currentlyActiveSessionId = -1;
var currentUser = new developer_1.User(0, '');
function activate(context) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Congratulations, your extension "SwarmAccountManager" is now active!');
        const taskProvider = new taskProvider_1.TaskProvider(context, -1); //ajouter le cas -1
        vscode.window.registerTreeDataProvider('taskView', taskProvider);
        vscode.commands.registerCommand('extension.swarm-debugging.refreshTasks', () => { taskProvider.refresh(); });
        //TODO: find a way to hide function when logged in
        vscode.commands.registerCommand('extension.swarm-debugging.login', () => {
            //verify if already logged in
            login().then(res => {
                if (res === undefined) {
                    return;
                }
                if (res > 0) {
                    taskProvider.updateProductId(res);
                }
            });
        });
        vscode.commands.registerCommand('extension.swarm-debugging.logout', () => {
            developer_1.logout(currentUser);
            if (currentlyActiveSessionId > 0) {
                session_1.stopSession(currentlyActiveSessionId);
            }
            taskProvider.updateProductId(0);
        });
        vscode.commands.registerCommand('extension.swarm-debugging.createProduct', () => {
            //only works if logged in
            product_1.createProduct(currentUser).then(res => {
                if (res > 0) {
                    taskProvider.updateProductId(res);
                }
            });
        });
        vscode.commands.registerCommand('extension.swarm-debugging.createTask', () => {
            task_1.createTask(taskProvider.getProductID(), currentUser).then(() => taskProvider.refresh());
        });
        vscode.commands.registerCommand('extension.swarm-debugging.startSession', (task) => {
            session_1.startSession(task.taskId, currentlyActiveSessionId, currentUser.id).then((res) => {
                if (res > 0) {
                    currentlyActiveSessionId = res;
                    vscode.window.showInformationMessage('started a session');
                }
            });
        });
        vscode.commands.registerCommand('extension.swarm-debugging.stopSession', () => {
            session_1.stopSession(currentlyActiveSessionId).then((res) => {
                if (res > 0) {
                    currentlyActiveSessionId = -1;
                    vscode.window.showInformationMessage('Stopped session');
                }
            });
        });
        vscode.commands.registerCommand('extension.swarm-debugging.endTask', (task) => {
            //task active verification
            if (currentlyActiveSessionId < 1) {
                task_1.endTask(task.taskId).then(() => {
                    taskProvider.refresh();
                });
            }
        });
        vscode.commands.registerCommand('extension.swarm-debugging.chooseProduct', () => {
            if (!currentUser.isLoggedIn()) {
                vscode.window.showInformationMessage('You must be logged in to choose a product');
            }
            else {
                product_1.chooseProduct(currentUser).then(res => {
                    if (res === undefined) {
                        return;
                    }
                    if (res > 0) {
                        taskProvider.updateProductId(res);
                    }
                });
            }
        });
        vscode.commands.registerCommand('extension.swarm-debugging.updateTaskTitle', (task) => {
            if (currentlyActiveSessionId < 1) {
                task_1.updateTaskTitle(task.taskId).then(res => {
                    if (res !== -1) {
                        taskProvider.refresh();
                    }
                });
            }
        });
    });
}
exports.activate = activate;
function login() {
    return __awaiter(this, void 0, void 0, function* () {
        //should a new account be logged in when created?
        if (currentUser.isLoggedIn()) {
            vscode.window.showInformationMessage('Logout before logging in');
            return -4;
        }
        const account = yield vscode.window.showQuickPick(['existing account', 'create an account'], { placeHolder: 'Do you have a Swarm Debugging account?' });
        if (account === 'create an account') {
            //create a new account before login in
            let res = yield developer_1.createSwarmAccount();
            if (res === undefined) {
                return -5;
            }
        }
        else if (account === undefined) {
            return -6;
        }
        let res = yield developer_1.openSwarmAccount(currentUser);
        if (res < 1) {
            return -3;
        }
        return yield product_1.chooseProduct(currentUser);
    });
}
function deactivate() {
    //stop currently active sessions on logout
    developer_1.logout(currentUser);
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map