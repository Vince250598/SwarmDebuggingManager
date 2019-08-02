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
function stopSession(currentlyActiveSessionId) {
    return __awaiter(this, void 0, void 0, function* () {
        //Is this the right place for this message?
        if (currentlyActiveSessionId < 1) {
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
            sessionId: currentlyActiveSessionId,
            finished: date
        };
        let data = yield graphql_request_1.request('http://localhost:8080/graphql?', query, variables);
        return data.sessionUpdate.id;
    });
}
exports.stopSession = stopSession;
function startSession(taskId, currentlyActiveSessionId, currentUserId) {
    return __awaiter(this, void 0, void 0, function* () {
        if (currentlyActiveSessionId > 0) {
            vscode.window.showInformationMessage('Session already active');
            return 0;
        }
        //project and label attributes?
        var sessionDescription = yield vscode.window.showInputBox({ prompt: 'Enter a description for the session you want to start' });
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
        let data = yield graphql_request_1.request('http://localhost:8080/graphql?', query, variables);
        if (data.sessionStart.id) {
            return data.sessionStart.id;
        }
        else {
            vscode.window.showErrorMessage('error while creating session');
        }
    });
}
exports.startSession = startSession;
//# sourceMappingURL=Session.js.map