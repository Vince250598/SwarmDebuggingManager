import * as vscode from 'vscode';
import { request } from 'graphql-request';
import { SERVERURL } from '../extension';
import { Type } from '../objects/type';
import { Artefact } from '../objects/artefact';
import { Product } from '../objects/product';
import { Task } from '../objects/task';
import { Session } from '../objects/session';
import { Developer } from '../objects/developer';

export class SessionService {

    session: Session | undefined;

    constructor(session?: Session) {
        this.session = session;
    }

    setSession(session: Session) {
        this.session = session;
    }

    async stopSession(currentlyActiveSessionId: number) {

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

        let data = await request(SERVERURL, query, variables);
        return data.sessionUpdate.id;
    }

    async startSession(taskId: number, currentlyActiveSessionId: number, currentUserId: number): Promise<number> {
        if (currentlyActiveSessionId > 0) {
            vscode.window.showInformationMessage('a session is already active');
            return 0;
        }

        //project and label attributes?

        var sessionDescription = await vscode.window.showInputBox({ prompt: 'Enter a description for the session you want to start' });

        if (sessionDescription === undefined) {
            return -1;
        } else if (!sessionDescription) {
            return await this.startSession(taskId, currentlyActiveSessionId, currentUserId);
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

        let data = await request(SERVERURL, query, variables);
        if (data.sessionStart.id) {
            return data.sessionStart.id;
        } else {
            vscode.window.showErrorMessage('error while creating session');
        }

        return 1;
    }

}

