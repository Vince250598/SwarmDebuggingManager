import * as vscode from 'vscode';
import { request } from 'graphql-request';
import { SERVERURL } from '../extension';
import { chooseProduct } from './product';

export class Developer {

    private id: number;
    private username: string;

    constructor(id: number, username: string) {
		this.id = id;
        this.username = username;
    }

    getID() {
        return this.id;
    }

    setID(id: number) {
        this.id = id;
    }

    getUsername() {
        return this.username;
    }

    setUsername(name: string) {
        this.username = name;
	}
	
	logout() {
		if(!this.isLoggedIn()) {
			vscode.window.showInformationMessage('You are not logged in');
		} else {
			this.setID(0);
			this.setUsername('');
			vscode.window.showInformationMessage('You are now logged out');
		}
	}

	isLoggedIn() {
		if(this.id === 0 || this.username === ""){
			return false;
		} else {
			return true;
		}
	}

	async openSwarmAccount(): Promise<number> {
		let username = await vscode.window.showInputBox({prompt: 'Enter Username to login'});
		if(username === undefined) {
			return -1;
		} else if(!username) {
			vscode.window.showInformationMessage('please enter a valid username');
			return await this.openSwarmAccount();
		}

		const query = `query findDeveloper($user: String!){
			developer(username: $user) {
				id
			}
		}`;
		const variables = {
			user: username
		};
	
		var data = await request(SERVERURL, query, variables);
		if(data.developer !== null){
			this.setUsername(username);
			this.setID(data.developer.id);
			vscode.window.showInformationMessage('logged in as ' + username);
			return 1;
		} else {
			vscode.window.showErrorMessage('Wrong Username/Username doesn\'t exist');
			return await this.openSwarmAccount();
		}
	}

	async createSwarmAccount(): Promise<number> {
		let username = (await vscode.window.showInputBox({prompt: 'Choose a Username'}));
		//add password later
		if(username === undefined){
			return -1;
		}
		else if(!username){
			vscode.window.showErrorMessage('You must enter a username');
			return await this.createSwarmAccount();
		}
		
		const query = `mutation developerCreate($user: String!){
			developerCreate(developer:{
				username: $user
			}) {
				id
			}
		}`;
	
		const variables = {
			user: username
		};
	
		var data = await request(SERVERURL, query, variables);
		if(data.developer !== null){
			this.setUsername(username);
			this.setID(data.developerCreate.id);
			vscode.window.showInformationMessage('logged in as ' + username);
			return 1;
		} else {
			vscode.window.showErrorMessage('Error while creating account, try again');
			return await this.createSwarmAccount();
		}
	}

	async login() {
		//should a new account be logged in when created?
		if(this.isLoggedIn()){
			vscode.window.showInformationMessage('Logout before logging in');
			return -4;
		}
	
		const account = await vscode.window.showQuickPick(['existing account', 'create an account'], {placeHolder: 'Do you have a Swarm Debugging account?'});
		if(account === undefined) {
			return -6;
		}
		if(account === 'create an account'){
			//create a new account before login in
			let res = await this.createSwarmAccount();
			if(res < 1){
				return -5;
			}
		} else if(account === 'existing account'){
			let res = await this.openSwarmAccount();
			if(res < 1) {
				return -3;
			}
		}			
	
		return await chooseProduct(this);
	}
}


/*export function logout(currentDeveloper: Developer): void {
	if(!currentDeveloper.isLoggedIn()){
		vscode.window.showInformationMessage('You are not logged in');
	} else {
		currentDeveloper.logout();
		vscode.window.showInformationMessage('You are now logged out');
	}
}*/

/*export async function openSwarmAccount(currentDeveloper: Developer): Promise<number>{
	let username = await vscode.window.showInputBox({prompt: 'Enter Username to login'});
	if(username === undefined){
		return -1;
	} else if(!username){
		vscode.window.showInformationMessage('please enter a valid username');
		return await openSwarmAccount(currentDeveloper);
	}
	//add password later
	
	const query = `query findDeveloper($user: String!){
		developer(username: $user) {
			id
		}
	}`;
	const variables = {
		user: username
	};

	var data = await request(SERVERURL, query, variables);
	if(data.developer !== null){
		currentDeveloper.setUsername(username);
		currentDeveloper.setID(data.developer.id);
		vscode.window.showInformationMessage('logged in as ' + username);
		return 1;
	} else {
		vscode.window.showErrorMessage('Wrong Username/Username doesn\'t exist');
		return openSwarmAccount(currentDeveloper);
	}
}*/

/*export async function createSwarmAccount(): Promise<void> {
	//if cancelled, variable is undefined
	let username = (await vscode.window.showInputBox({prompt: 'Choose a Username'}));
	//add password later
	if(username === undefined){
		return undefined;
	}
	else if(!username){
		vscode.window.showErrorMessage('You must enter a username');
		await createSwarmAccount();
		return;
	}
	
	const query = `mutation developerCreate($user: String!){
		developerCreate(developer:{
			username: $user
		}) {
			id
		}
	}`;

	const variables = {
		user: username
	};

	try{
		let data = await request(SERVERURL, query, variables);
		return;
	} catch(error) {
		console.log(error);
		vscode.window.showErrorMessage('Error while creating account, try again');
		await createSwarmAccount();
	}*/