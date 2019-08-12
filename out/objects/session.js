"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Session {
    constructor(description, started, label, project, purpose, developer, task) {
        this.id = -1;
        this.description = "";
        this.finished = new Date();
        this.vscodeSession = "";
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
    setID(id) {
        this.id = id;
    }
    getDescription() {
        return this.description;
    }
    setDescription(description) {
        this.description = description;
    }
    getDeveloper() {
        return this.developer;
    }
    setDeveloper(developer) {
        this.developer = developer;
    }
    getStarted() {
        return this.started;
    }
    setStarted(started) {
        this.started = started;
    }
    getFinished() {
        return this.finished;
    }
    setFinished(finished) {
        this.finished = finished;
    }
    getLabel() {
        return this.label;
    }
    setlabel(label) {
        this.label = label;
    }
    getProject() {
        return this.project;
    }
    setProject(project) {
        this.project = project;
    }
    getPurpose() {
        return this.purpose;
    }
    setPurpose(purpose) {
        this.purpose = purpose;
    }
    getTask() {
        return this.task;
    }
    setTask(task) {
        this.task = task;
    }
    getVscodeSession() {
        return this.vscodeSession;
    }
    setVscodeSession(vscodeSession) {
        this.vscodeSession = vscodeSession;
    }
}
exports.Session = Session;
//# sourceMappingURL=session.js.map