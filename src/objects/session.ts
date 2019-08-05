import * as vscode from 'vscode';
import { request } from 'graphql-request';
import { SERVERURL } from '../extension';
import { Developer } from './developer';

export class Session {

    private id: number = -1;
    private description: string = "";
    private started: Date = new Date();
    private finished: Date = new Date();
    private label: string = "";
    private project: string = "";
    private purpose: string = "";
    private developer: Developer;
    private task: Task;

    constructor(description: string,
        started: Date,
        label: string,
        project: string,
        purpose: string,
        developer: Developer,
        task: Task) {

        this.description = description;
        this.started = started;
        this.label = label;
        this.project = project;
        this.purpose = purpose;
        this.developer = developer;
        this.task = task;

    }

    getID() {
        return this.id;
    }

    setID(id: number) {
        this.id = id;
    }

    getDescription() {
        return this.description;
    }

    setDescription(description: string) {
        this.description = description;
    }

    getDeveloper() {
        return this.developer;
    }

    setDeveloper(developer: Developer) {
        this.developer = developer;
    }

    getStarted() {
        return this.started;
    }

    setStarted(started: Date) {
        this.started = started;
    }

    getFinished() {
        return this.finished;
    }

    setFinished(finished: Date) {
        this.finished = finished;
    }

    getLabel() {
        return this.label;
    }

    setlabel(label: string) {
        this.label = label;
    }

    getProject() {
        return this.project;
    }

    setProject(project: string) {
        this.project = project;
    }

    getPurpose() {
        return this.purpose;
    }

    setPurpose(purpose: string) {
        this.purpose = purpose;
    }

    getTask() {
        return this.task;
    }

    setTask(task: Task) {
        this.task = task;
    }

}

export async function stopSession(currentlyActiveSessionId: number) {

	//Is this the right place for this message?
	if(currentlyActiveSessionId < 1){
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

export async function startSession(taskId: number, currentlyActiveSessionId: number, currentUserId: number): Promise<number> {
	if(currentlyActiveSessionId > 0){
		vscode.window.showInformationMessage('a session is already active');
		return 0;
	}

	//project and label attributes?

	var sessionDescription = await vscode.window.showInputBox({prompt: 'Enter a description for the session you want to start'});

	if(sessionDescription === undefined) {
		return -1;
	} else if(!sessionDescription) {
		return await startSession(taskId, currentlyActiveSessionId, currentUserId);
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
		developerId : currentUserId,
		taskId : taskId,
		description : sessionDescription
	};

	//have to add session already running and others, add session stop

	let data = await request(SERVERURL, query, variables);
	if(data.sessionStart.id){
		return data.sessionStart.id;
	} else {
		vscode.window.showErrorMessage('error while creating session');
	}

	return 1;
}