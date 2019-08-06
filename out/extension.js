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
const breakpointService_1 = require("./services/breakpointService");
const artefact_1 = require("./objects/artefact");
const type_1 = require("./objects/type");
const breakpoint_1 = require("./objects/breakpoint");
const typeService_1 = require("./services/typeService");
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
        vscode.commands.registerCommand('extension.swarm-debugging.toggleBreakpoints', () => {
            if (currentlyActiveTask.getID() > 1) {
                toggleBreakpoints(currentlyActiveTask);
            }
            else {
                vscode.window.showInformationMessage('There is no task selected.');
            }
        });
        var isFirstTime = true;
        var allBreakpointsActual;
        var allBreakpointsPast;
        vscode.debug.onDidChangeBreakpoints((event) => __awaiter(this, void 0, void 0, function* () {
            if (currentlyActiveSession.getID() > 0) {
                let breakpointService = new breakpointService_1.BreakpointService();
                // Management of past and present states of breakpoints
                if (isFirstTime) {
                    allBreakpointsActual = vscode.debug.breakpoints;
                    allBreakpointsPast = yield breakpointService.getAll(currentlyActiveTask);
                }
                else {
                    allBreakpointsPast = allBreakpointsActual;
                    allBreakpointsActual = vscode.debug.breakpoints;
                }
                let shouldCreateBreakpoint;
                // The logic is simple, compare all the past and present breakpoints,
                // find which ones are new and them add them to the database
                // There are some special treatment for the firstime, because in the
                // first time the past state is equivalent to the breakpoints from 
                // the database(Breakpoint not vscode.Breakpoint)
                for (var i = 0; i < allBreakpointsActual.length; i++) {
                    shouldCreateBreakpoint = true;
                    for (var j = 0; j < allBreakpointsPast.length; j++) {
                        if (isFirstTime) {
                            if (allBreakpointsPast[j].equalsVSBreakpoint(allBreakpointsActual[i])) {
                                shouldCreateBreakpoint = false;
                                break;
                            }
                        }
                        else {
                            if (allBreakpointsPast[j] === allBreakpointsActual[i]) {
                                shouldCreateBreakpoint = false;
                                break;
                            }
                        }
                    }
                    // If the breakpoint is found new, it is added to database
                    if (shouldCreateBreakpoint) {
                        let breakpoint = allBreakpointsActual[i];
                        let swarmArtefact = new artefact_1.Artefact(fs.readFileSync(breakpoint.location.uri.fsPath, 'utf8'));
                        let fullname = "";
                        if (vscode.workspace.rootPath) {
                            fullname = getTypeFullname(vscode.workspace.rootPath, breakpoint.location.uri.fsPath);
                        }
                        let swarmType = new type_1.Type(fullname, breakpoint.location.uri.fsPath, fromPathToTypeName(breakpoint.location.uri.fsPath), swarmArtefact, currentlyActiveSession);
                        let swarmBreakpoint = new breakpoint_1.Breakpoint(breakpoint.location.range.start.line, swarmType);
                        // Before creating a type, it is needed to verify if it is already in the database
                        let typeService = new typeService_1.TypeService();
                        let createdTypes = yield typeService.getAllBySession(currentlyActiveSession);
                        let shouldCreate = true;
                        for (let item of createdTypes) {
                            if (swarmType.equals(item)) {
                                swarmType.setID(item.getID());
                                shouldCreate = false;
                                break;
                            }
                        }
                        if (shouldCreate) {
                            typeService.setArtefact(swarmArtefact);
                            typeService.setType(swarmType);
                            let response = yield typeService.create();
                            if (response) {
                                createdTypes[createdTypes.length - 1] = swarmType;
                            }
                        }
                        let breakpointService = new breakpointService_1.BreakpointService(swarmBreakpoint);
                        let response = yield breakpointService.create();
                        if (response) {
                            console.log("Breakpoint added!");
                        }
                    }
                    if (isFirstTime) {
                        isFirstTime = false;
                    }
                }
            }
        }));
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
function fromPathToTypeName(path) {
    let splittedPath = path.split("/");
    return splittedPath[splittedPath.length - 1].split(".", 1)[0];
}
function getTypeFullname(rootPath, filePath) {
    let splittedRootPath = rootPath.split("/");
    let splittedFilePath = filePath.split("/");
    let fullname = "";
    for (let i = splittedRootPath.length + 1; i < splittedFilePath.length; i++) {
        if (i === splittedRootPath.length + 1) {
            fullname = splittedFilePath[i];
        }
        else {
            fullname = fullname + "." + splittedFilePath[i];
        }
    }
    return fullname;
}
function toggleBreakpoints(task) {
    return __awaiter(this, void 0, void 0, function* () {
        let breakpointService = new breakpointService_1.BreakpointService();
        let allBreakpointsPast = yield breakpointService.getAll(task);
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
//# sourceMappingURL=extension.js.map