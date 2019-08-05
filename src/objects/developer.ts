import * as vscode from 'vscode';
import { Product } from './product';

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

}