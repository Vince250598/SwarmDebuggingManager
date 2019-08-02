import * as vscode from 'vscode';
import { TaskProvider, TreeTask } from './taskProvider';
import { Developer } from './objects/developer';
import { getProducts, createProduct, ProductQuickPickItem, chooseProduct } from './objects/product';
import { endTask, createTask, updateTaskTitle } from './objects/task';
import { startSession, stopSession } from './objects/session';

export const SERVERURL = 'http://localhost:8080/graphql?';

var currentlyActiveSessionId: number = -1;

var currentDeveloper = new Developer(0, '');

export async function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "SwarmAccountManager" is now active!');

	const taskProvider = new TaskProvider(context, -1); //ajouter le cas -1
	vscode.window.registerTreeDataProvider('taskView', taskProvider);
	vscode.commands.registerCommand('extension.swarm-debugging.refreshTasks', () => {taskProvider.refresh();});
	//TODO: find a way to hide function when logged in
	vscode.commands.registerCommand('extension.swarm-debugging.login', () => {
		//verify if already logged in
		currentDeveloper.login().then(res => {
			if(res === undefined){
				return;
			}
			if(res > 0){
				taskProvider.updateProductId(res);
			}
		});
	});
	vscode.commands.registerCommand('extension.swarm-debugging.logout', () => {
		currentDeveloper.logout();
		if(currentlyActiveSessionId > 0){
			stopSession(currentlyActiveSessionId);
		}
		taskProvider.updateProductId(0);
	});
	vscode.commands.registerCommand('extension.swarm-debugging.createProduct', () => {
		//only works if logged in
		createProduct(currentDeveloper).then(res => {
			if(res > 0){
				taskProvider.updateProductId(res);
			}
		});
	});
	vscode.commands.registerCommand('extension.swarm-debugging.createTask', () => {
		createTask(taskProvider.getProductID(), currentDeveloper).then(() => taskProvider.refresh());
	});
	vscode.commands.registerCommand('extension.swarm-debugging.startSession', (task: TreeTask) => {
		startSession(task.taskId, currentlyActiveSessionId, currentDeveloper.getID()).then((res) => {
			if(res > 0){
				currentlyActiveSessionId = res;
				vscode.window.showInformationMessage('started a session');
			}
		});
	});
	vscode.commands.registerCommand('extension.swarm-debugging.stopSession', () => {
		stopSession(currentlyActiveSessionId).then((res) => {
			if(res > 0){
				currentlyActiveSessionId = -1;
				vscode.window.showInformationMessage('Stopped session');
			}
		});
	});
	vscode.commands.registerCommand('extension.swarm-debugging.endTask', (task: TreeTask) => {
		//task active verification
		if(currentlyActiveSessionId < 1){
			endTask(task.taskId).then(() => {
				taskProvider.refresh();
			});
		}
	});
	vscode.commands.registerCommand('extension.swarm-debugging.chooseProduct', () => {
		if(!currentDeveloper.isLoggedIn()){
			vscode.window.showInformationMessage('You must be logged in to choose a product');
		} else {
			chooseProduct(currentDeveloper).then(res => {
				if(res === undefined){
					return;
				}
				if(res > 0) {
					taskProvider.updateProductId(res);
				}
			});
		}
	});
	vscode.commands.registerCommand('extension.swarm-debugging.updateTaskTitle', (task: TreeTask) => {
		if(currentlyActiveSessionId < 1){
			updateTaskTitle(task.taskId).then(res => {
				if(res !== -1){
					taskProvider.refresh();
				}
			});
		}
	});
}

/*async function login() {
	//should a new account be logged in when created?
	if(currentDeveloper.isLoggedIn()){
		vscode.window.showInformationMessage('Logout before logging in');
		return -4;
	}

	const account = await vscode.window.showQuickPick(['existing account', 'create an account'], {placeHolder: 'Do you have a Swarm Debugging account?'});
	if(account === 'create an account'){
		//create a new account before login in
		let res = await currentDeveloper.createSwarmAccount();
		if(res === undefined){
			return -5;
		}
	} else if(account === undefined){
		return -6;
	}

	//should not be called when after creating an account
	let res = await openSwarmAccount(currentUser);
	if(res < 1) {
		return -3;
	}

	return await chooseProduct(currentUser);
}*/

export function deactivate() {
	//stop currently active sessions on logout
	currentDeveloper.logout();
}
