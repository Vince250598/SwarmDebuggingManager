import * as vscode from 'vscode';
import { DeveloperService } from '../services/developerService';

export class Developer {

	private id: number;
	private username: string;
	private developerService: DeveloperService = new DeveloperService(this);

	constructor(id: number,
		username: string) {

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

	login() {
		return this.developerService.login();
	}

	logout() {
		if (!this.isLoggedIn()) {
			vscode.window.showInformationMessage('You are not logged in');
		} else {
			this.setID(0);
			this.setUsername('');
			vscode.window.showInformationMessage('You are now logged out');
		}
	}

	isLoggedIn() {
		if (this.id === 0 || this.username === "") {
			return false;
		} else {
			return true;
		}
	}

}