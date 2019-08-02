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
const extension_1 = require("../extension");
const product_1 = require("./product");
class Developer {
    constructor(id, username) {
        this.id = id;
        this.username = username;
    }
    getID() {
        return this.id;
    }
    setID(id) {
        this.id = id;
    }
    getUsername() {
        return this.username;
    }
    setUsername(name) {
        this.username = name;
    }
    logout() {
        if (!this.isLoggedIn()) {
            vscode.window.showInformationMessage('You are not logged in');
        }
        else {
            this.setID(0);
            this.setUsername('');
            vscode.window.showInformationMessage('You are now logged out');
        }
    }
    isLoggedIn() {
        if (this.id === 0 || this.username === "") {
            return false;
        }
        else {
            return true;
        }
    }
    openSwarmAccount() {
        return __awaiter(this, void 0, void 0, function* () {
            let username = yield vscode.window.showInputBox({ prompt: 'Enter Username to login' });
            if (username === undefined) {
                return -1;
            }
            else if (!username) {
                vscode.window.showInformationMessage('please enter a valid username');
                return yield this.openSwarmAccount();
            }
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
                this.setUsername(username);
                this.setID(data.developer.id);
                vscode.window.showInformationMessage('logged in as ' + username);
                return 1;
            }
            else {
                vscode.window.showErrorMessage('Wrong Username/Username doesn\'t exist');
                return yield this.openSwarmAccount();
            }
        });
    }
    createSwarmAccount() {
        return __awaiter(this, void 0, void 0, function* () {
            let username = (yield vscode.window.showInputBox({ prompt: 'Choose a Username' }));
            //add password later
            if (username === undefined) {
                return -1;
            }
            else if (!username) {
                vscode.window.showErrorMessage('You must enter a username');
                return yield this.createSwarmAccount();
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
            var data = yield graphql_request_1.request(extension_1.SERVERURL, query, variables);
            if (data.developer !== null) {
                this.setUsername(username);
                this.setID(data.developerCreate.id);
                vscode.window.showInformationMessage('logged in as ' + username);
                return 1;
            }
            else {
                vscode.window.showErrorMessage('Error while creating account, try again');
                return yield this.createSwarmAccount();
            }
        });
    }
    login() {
        return __awaiter(this, void 0, void 0, function* () {
            //should a new account be logged in when created?
            if (this.isLoggedIn()) {
                vscode.window.showInformationMessage('Logout before logging in');
                return -4;
            }
            const account = yield vscode.window.showQuickPick(['existing account', 'create an account'], { placeHolder: 'Do you have a Swarm Debugging account?' });
            if (account === undefined) {
                return -6;
            }
            if (account === 'create an account') {
                //create a new account before login in
                let res = yield this.createSwarmAccount();
                if (res < 1) {
                    return -5;
                }
            }
            else if (account === 'existing account') {
                let res = yield this.openSwarmAccount();
                if (res < 1) {
                    return -3;
                }
            }
            return yield product_1.chooseProduct(this);
        });
    }
}
exports.Developer = Developer;
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
//# sourceMappingURL=developer.js.map