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
const product_1 = require("../objects/product");
const productService_1 = require("./productService");
class DeveloperService {
    constructor(developer) {
        this.developer = developer;
    }
    setDeveloper(developer) {
        this.developer = developer;
    }
    openSwarmAccount() {
        return __awaiter(this, void 0, void 0, function* () {
            let username = yield vscode.window.showInputBox({ prompt: 'Enter Username to login' });
            if (username === undefined) {
                return -1;
            }
            else if (!username) {
                vscode.window.showInformationMessage('Please enter a valid username');
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
            if (data.developer !== null && this.developer) {
                this.developer.setUsername(username);
                this.developer.setID(data.developer.id);
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
            if (data.developer !== null && this.developer) {
                this.developer.setUsername(username);
                this.developer.setID(data.developerCreate.id);
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
            if (this.developer) {
                if (this.developer.isLoggedIn()) {
                    vscode.window.showInformationMessage('Logout before logging in');
                    return -4;
                }
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
            let productService = new productService_1.ProductService(new product_1.Product(-1, "name"));
            if (this.developer) {
                return yield productService.chooseProduct(this.developer);
            }
        });
    }
}
exports.DeveloperService = DeveloperService;
//# sourceMappingURL=developerService.js.map