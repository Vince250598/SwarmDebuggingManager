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
class SessionService {
    constructor(session) {
        this.session = session;
    }
    setSession(session) {
        this.session = session;
    }
    stopSession() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.session === undefined) {
                return;
            }
            //Is this the right place for this message?
            if (this.session.getID() < 1) {
                vscode.window.showInformationMessage('No session active');
                return 0;
            }
            const query = `mutation sessionUpdate($sessionId: Long!, $finished: Date) {
                sessionUpdate(id: $sessionId, finished: $finished){
                    id
                }
            }`;
            let date = new Date().toISOString();
            const variables = {
                sessionId: this.session.getID(),
                finished: date
            };
            let data = yield graphql_request_1.request(extension_1.SERVERURL, query, variables);
            return data.sessionUpdate.id;
        });
    }
    startSession() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.session) {
                var taskId = this.session.getTask().getID();
                var currentlyActiveSessionId = this.session.getID();
                var currentUserId = this.session.getDeveloper().getID();
                var sessionDescription = this.session.getDescription();
            }
            else {
                return -1;
            }
            if (currentlyActiveSessionId > 0) {
                vscode.window.showInformationMessage('A session is already active');
                return 0;
            }
            //project and label attributes?
            if (sessionDescription === undefined) {
                return -1;
            }
            else if (!sessionDescription) {
                return yield this.startSession();
            }
            //needs developerid and taskid
            const query = `mutation sessionStart($developerId: Long!, $taskId: Long!, $description: String) {
                sessionStart(session:{
                    task:{
                        id: $taskId
                        done: false
                    }
                    developer:{
                        id: $developerId
                    }
                    description: $description
                }) {
                    id
                }
            }`;
            const variables = {
                developerId: currentUserId,
                taskId: taskId,
                description: sessionDescription
            };
            //have to add session already running and others, add session stop
            let data = yield graphql_request_1.request(extension_1.SERVERURL, query, variables);
            if (data.sessionStart.id) {
                return data.sessionStart.id;
            }
            else {
                vscode.window.showErrorMessage('error while creating session');
            }
            return 1;
        });
    }
}
exports.SessionService = SessionService;
//# sourceMappingURL=sessionService.js.map