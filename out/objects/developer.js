"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const developerService_1 = require("../services/developerService");
class Developer {
    constructor(id, username) {
        this.developerService = new developerService_1.DeveloperService(this);
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
    login() {
        return this.developerService.login();
    }
    logout() {
        if (!this.isLoggedIn()) {
            vscode.window.showInformationMessage('You are not logged in');
            return -1;
        }
        else {
            this.setID(0);
            this.setUsername('');
            vscode.window.showInformationMessage('You are now logged out');
            return 1;
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
}
exports.Developer = Developer;
//# sourceMappingURL=developer.js.map