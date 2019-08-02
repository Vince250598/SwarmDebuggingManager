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
class User {
    constructor(id, username) {
        this.id = id;
        this.username = username;
    }
    logout() {
        this.id = 0;
        this.username = '';
    }
    isLoggedIn() {
        if (this.id === 0 || this.username === "") {
            return false;
        }
        else {
            return true;
        }
    }
}
exports.User = User;
function logout(currentUser) {
    if (!currentUser.isLoggedIn()) {
        vscode.window.showInformationMessage('You are not logged in');
    }
    else {
        currentUser.logout();
        vscode.window.showInformationMessage('You are now logged out');
    }
}
exports.logout = logout;
function openSwarmAccount(currentUser) {
    return __awaiter(this, void 0, void 0, function* () {
        let username = yield vscode.window.showInputBox({ prompt: 'Enter Username to login' });
        if (username === undefined) {
            return -1;
        }
        else if (!username) {
            vscode.window.showInformationMessage('please enter a valid username');
            return yield openSwarmAccount(currentUser);
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
        var data = yield graphql_request_1.request(extension_1.SERVERURL, query, variables);
        if (data.developer !== null) {
            currentUser.username = username;
            currentUser.id = data.developer.id;
            vscode.window.showInformationMessage('logged in as ' + username);
            return 1;
        }
        else {
            vscode.window.showErrorMessage('Wrong Username/Username doesn\'t exist');
            return openSwarmAccount(currentUser);
        }
    });
}
exports.openSwarmAccount = openSwarmAccount;
function createSwarmAccount() {
    return __awaiter(this, void 0, void 0, function* () {
        //if cancelled, variable is undefined
        let username = (yield vscode.window.showInputBox({ prompt: 'Choose a Username' }));
        //add password later
        if (username === undefined) {
            return undefined;
        }
        else if (!username) {
            vscode.window.showErrorMessage('You must enter a username');
            yield createSwarmAccount();
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
        try {
            let data = yield graphql_request_1.request(extension_1.SERVERURL, query, variables);
            return;
        }
        catch (error) {
            console.log(error);
            vscode.window.showErrorMessage('Error while creating account, try again');
            yield createSwarmAccount();
        }
    });
}
exports.createSwarmAccount = createSwarmAccount;
//# sourceMappingURL=developer.js.map