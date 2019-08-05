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
const fs = require("fs");
const taskProvider_1 = require("./taskProvider");
const developer_1 = require("./objects/developer");
const product_1 = require("./objects/product");
//import { getProducts, createProduct, ProductQuickPickItem, chooseProduct } from './objects/product';
//import { endTask, createTask, updateTaskTitle } from './objects/task';
const sessionService_1 = require("./services/sessionService");
const productService_1 = require("./services/productService");
const taskService_1 = require("./services/taskService");
const session_1 = require("./objects/session");
const task_1 = require("./objects/task");
const breakpointService_1 = require("services/breakpointService");
exports.SERVERURL = 'http://localhost:8080/graphql?';
var currentlyActiveSessionId;
var currentlyActiveProduct;
var currentlyActiveTask;
var currenttlyActiveDeveloper;
var currentlyActiveSession;
clearSet();
function activate(context) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('SwarmAccountManager is now active');
        let sessionService = new sessionService_1.SessionService(currentlyActiveSession);
        let productService = new productService_1.ProductService(currentlyActiveProduct);
        let taskService = new taskService_1.TaskService(currentlyActiveTask);
        const taskProvider = new taskProvider_1.TaskProvider(context, -1); //ajouter le cas -1
        vscode.window.registerTreeDataProvider('taskView', taskProvider);
        vscode.commands.registerCommand('extension.swarm-debugging.refreshTasks', () => { taskProvider.refresh(); });
        //TODO: find a way to hide function when logged in
        vscode.commands.registerCommand('extension.swarm-debugging.login', () => {
            //verify if already logged in
            currenttlyActiveDeveloper.login().then(res => {
                if (res === undefined) {
                    return;
                }
                if (res > 0) {
                    taskProvider.updateProductId(res);
                }
            });
        });
        vscode.commands.registerCommand('extension.swarm-debugging.logout', () => {
            currenttlyActiveDeveloper.logout();
            if (currentlyActiveSessionId > 0) {
                sessionService.stopSession();
            }
            taskProvider.updateProductId(0);
            clearSet();
        });
        vscode.commands.registerCommand('extension.swarm-debugging.createProduct', () => __awaiter(this, void 0, void 0, function* () {
            var productName = undefined;
            while (productName === undefined) {
                productName = yield vscode.window.showInputBox({ prompt: 'Enter the product name' });
            }
            currentlyActiveProduct = new product_1.Product(taskProvider.getProductID(), productName);
            productService.setProduct(currentlyActiveProduct);
            productService.createProduct(currenttlyActiveDeveloper).then((res) => {
                if (res > 0) {
                    taskProvider.updateProductId(res);
                    currentlyActiveProduct.setID(res);
                }
            });
        }));
        vscode.commands.registerCommand('extension.swarm-debugging.createTask', () => {
            currentlyActiveTask = new task_1.Task("000000", "", "", currentlyActiveProduct);
            taskService.setTask(currentlyActiveTask);
            taskService.createTask(currenttlyActiveDeveloper).then((res) => {
                currentlyActiveTask.setID(res);
                taskProvider.refresh();
            });
        });
        vscode.commands.registerCommand('extension.swarm-debugging.startSession', (task) => __awaiter(this, void 0, void 0, function* () {
            var sessionDescription = yield vscode.window.showInputBox({ prompt: 'Enter a description for the session you want to start' });
            if (!sessionDescription) {
                sessionDescription = "";
            }
            currentlyActiveTask.setID(task.taskId);
            currentlyActiveSession = new session_1.Session(sessionDescription, new Date(), "", "", "", currenttlyActiveDeveloper, currentlyActiveTask);
            currentlyActiveSession.setID(currentlyActiveSessionId);
            sessionService.setSession(currentlyActiveSession);
            sessionService.startSession().then((res) => {
                if (res > 0) {
                    currentlyActiveSession.setID(res);
                    //currentlyActiveSessionId = res;
                    vscode.window.showInformationMessage('started a session');
                }
            });
        }));
        vscode.commands.registerCommand('extension.swarm-debugging.stopSession', () => {
            sessionService.stopSession().then((res) => {
                if (res > 0) {
                    currentlyActiveSessionId = -1;
                    clearSession();
                    vscode.window.showInformationMessage('Stopped session');
                }
            });
        });
        vscode.commands.registerCommand('extension.swarm-debugging.endTask', (task) => {
            //task active verification
            if (currentlyActiveSessionId < 1) {
                taskService.endTask(task.taskId).then(() => {
                    taskProvider.refresh();
                });
            }
        });
        vscode.commands.registerCommand('extension.swarm-debugging.chooseProduct', () => {
            if (!currenttlyActiveDeveloper.isLoggedIn()) {
                vscode.window.showInformationMessage('You must be logged in to choose a product');
            }
            else {
                product_1.Product.chooseProduct(currenttlyActiveDeveloper, productService).then((res) => {
                    if (res === undefined) {
                        return;
                    }
                    if (res > 0) {
                        taskProvider.updateProductId(res);
                        currentlyActiveProduct.setID(res);
                        taskProvider.refresh();
                    }
                });
            }
        });
        vscode.commands.registerCommand('extension.swarm-debugging.updateTaskTitle', (task) => {
            if (currentlyActiveSessionId < 1) {
                taskService.updateTaskTitle(task.taskId).then((res) => {
                    if (res !== -1) {
                        taskProvider.refresh();
                    }
                });
            }
        });
        vscode.commands.registerCommand('extension.swarmSession.toggleBreakpoints', () => {
            if (currentlyActiveTask.getID() > 1) {
                if (currentlyActiveSession.getID()) {
                    toggleBreakpoints(currentlyActiveSession);
                }
                else {
                    vscode.window.showInformationMessage('There is no session active.');
                }
            }
            else {
                vscode.window.showInformationMessage('There is no task selected.');
            }
        });
    });
}
exports.activate = activate;
function deactivate() {
    //stop currently active sessions on logout
    currenttlyActiveDeveloper.logout();
}
exports.deactivate = deactivate;
function clearSet() {
    currentlyActiveSessionId = -1;
    currentlyActiveProduct = new product_1.Product(0, "");
    currentlyActiveTask = new task_1.Task("", "", "", currentlyActiveProduct);
    currenttlyActiveDeveloper = new developer_1.Developer(0, '');
    currentlyActiveSession = new session_1.Session("", new Date(), "", "", "", currenttlyActiveDeveloper, currentlyActiveTask);
    currentlyActiveSession.setID(-1);
}
function clearSession() {
    currentlyActiveSession = new session_1.Session("", new Date(), "", "", "", currenttlyActiveDeveloper, currentlyActiveTask);
    currentlyActiveSession.setID(-1);
}
function toggleBreakpoints(session) {
    return __awaiter(this, void 0, void 0, function* () {
        let breakpointService = new breakpointService_1.BreakpointService();
        let allBreakpointsPast = yield breakpointService.getAll(session);
        let breakpoints = [];
        for (var i = 0; i < allBreakpointsPast.length; i++) {
            let artefactSourceLines = allBreakpointsPast[i].getType().getArtefact().getSourceCode().split("\n");
            let actualFile = fs.readFileSync(allBreakpointsPast[i].getType().getFullPath(), 'utf8');
            let actualSourceLines = actualFile.split("\n");
            let oldLine = artefactSourceLines[allBreakpointsPast[i].getLineNumber()];
            let actualLine = actualSourceLines[allBreakpointsPast[i].getLineNumber()];
            if (oldLine === actualLine) {
                //@ts-ignore
                let uri = new vscode.Uri("file", "", allBreakpointsPast[i].getType().getFullPath(), "", "");
                let range = new vscode.Range(allBreakpointsPast[i].getLineNumber(), 0, allBreakpointsPast[i].getLineNumber(), 0);
                let location = new vscode.Location(uri, range);
                let breakpointVS = new vscode.SourceBreakpoint(location, true);
                breakpoints[i] = breakpointVS;
            }
        }
        vscode.debug.addBreakpoints(breakpoints);
        return true;
    });
}
exports.toggleBreakpoints = toggleBreakpoints;
//# sourceMappingURL=extension.js.map