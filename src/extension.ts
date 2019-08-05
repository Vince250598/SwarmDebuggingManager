import * as vscode from 'vscode';
import { TaskProvider, TreeTask } from './taskProvider';
import { Developer } from './objects/developer';
import { Product } from './objects/product';
//import { getProducts, createProduct, ProductQuickPickItem, chooseProduct } from './objects/product';
//import { endTask, createTask, updateTaskTitle } from './objects/task';
import { SessionService } from './services/sessionService';
import { ProductService } from './services/productService';
import { TaskService } from './services/taskService';
import { Session } from './objects/session';
import { Task } from './objects/task';

export const SERVERURL = 'http://localhost:8080/graphql?';

var currentlyActiveSessionId: number;
var currentlyActiveProduct: Product;
var currentlyActiveTask: Task;
var currenttlyActiveDeveloper: Developer;
var currentlyActiveSession: Session;
clearSet();

export async function activate(context: vscode.ExtensionContext) {

	console.log('SwarmAccountManager is now active');
	let sessionService = new SessionService(currentlyActiveSession);
	let productService = new ProductService(currentlyActiveProduct);
	let taskService = new TaskService(currentlyActiveTask);

	const taskProvider = new TaskProvider(context, -1); //ajouter le cas -1

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

	vscode.commands.registerCommand('extension.swarm-debugging.createProduct', async () => {
		var productName = undefined;
		while (productName === undefined) {
			productName = await vscode.window.showInputBox({ prompt: 'Enter the product name' });
		}

		currentlyActiveProduct = new Product(taskProvider.getProductID(), productName);

		productService.setProduct(currentlyActiveProduct);
		productService.createProduct(currenttlyActiveDeveloper).then((res: number) => {
			if (res > 0) {
				taskProvider.updateProductId(res);
				currentlyActiveProduct.setID(res);
			}
		});
	});

	vscode.commands.registerCommand('extension.swarm-debugging.createTask', () => {
		currentlyActiveTask = new Task("000000", "", "", currentlyActiveProduct);
		taskService.setTask(currentlyActiveTask);
		taskService.createTask(currenttlyActiveDeveloper).then((res: number) => {
			currentlyActiveTask.setID(res);
			taskProvider.refresh();
		});
	});

	vscode.commands.registerCommand('extension.swarm-debugging.startSession', async (task: TreeTask) => {

		var sessionDescription = await vscode.window.showInputBox({ prompt: 'Enter a description for the session you want to start' });
		if (!sessionDescription) {
			sessionDescription = "";
		}

		currentlyActiveTask.setID(task.taskId);

		currentlyActiveSession = new Session(sessionDescription,
			new Date(),
			"",
			"",
			"",
			currenttlyActiveDeveloper,
			currentlyActiveTask);
		currentlyActiveSession.setID(currentlyActiveSessionId);

		sessionService.setSession(currentlyActiveSession);
		sessionService.startSession().then((res: number) => {
			if (res > 0) {
				currentlyActiveSession.setID(res);
				//currentlyActiveSessionId = res;
				vscode.window.showInformationMessage('started a session');
			}
		});
	});

	vscode.commands.registerCommand('extension.swarm-debugging.stopSession', () => {
		sessionService.stopSession().then((res: number) => {
			if (res > 0) {
				currentlyActiveSessionId = -1;
				clearSession();
				vscode.window.showInformationMessage('Stopped session');
			}
		});
	});

	vscode.commands.registerCommand('extension.swarm-debugging.endTask', (task: TreeTask) => {
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
		} else {
			Product.chooseProduct(currenttlyActiveDeveloper, productService).then((res: number | undefined) => {
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

	vscode.commands.registerCommand('extension.swarm-debugging.updateTaskTitle', (task: TreeTask) => {
		if (currentlyActiveSessionId < 1) {
			taskService.updateTaskTitle(task.taskId).then((res: number) => {
				if (res !== -1) {
					taskProvider.refresh();
				}
			});
		}
	});

}

export function deactivate() {
	//stop currently active sessions on logout
	currenttlyActiveDeveloper.logout();
}

function clearSet() {
	currentlyActiveSessionId = -1;
	currentlyActiveProduct = new Product(0, "");
	currentlyActiveTask = new Task("", "", "", currentlyActiveProduct);
	currenttlyActiveDeveloper = new Developer(0, '');
	currentlyActiveSession = new Session("", new Date(), "", "", "", currenttlyActiveDeveloper, currentlyActiveTask);
	currentlyActiveSession.setID(-1);
}

function clearSession() {
	currentlyActiveSession = new Session("", new Date(), "", "", "", currenttlyActiveDeveloper, currentlyActiveTask);
	currentlyActiveSession.setID(-1);
}