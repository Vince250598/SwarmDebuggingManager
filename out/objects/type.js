"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Type {
    constructor(full_name, full_path, name, artefact, session) {
        this.id = -1;
        this.full_name = "";
        this.full_path = "";
        this.name = "";
        this.full_name = full_name;
        this.full_path = full_path;
        this.name = name;
        this.artefact = artefact;
        this.session = session;
    }
    getID() {
        return this.id;
    }
    setID(id) {
        this.id = id;
    }
    getFullName() {
        return this.full_name;
    }
    setFullName(full_name) {
        this.full_name = full_name;
    }
    getFullPath() {
        return this.full_path;
    }
    setFullPath(full_path) {
        this.full_path = full_path;
    }
    getArtefact() {
        return this.artefact;
    }
    setArtefact(artefact) {
        this.artefact = artefact;
    }
    getSession() {
        return this.session;
    }
    setSession(session) {
        this.session = session;
    }
    getName() {
        return this.name;
    }
    setName(name) {
        this.name = name;
    }
    equals(comparison) {
        if (this.full_name === comparison.full_name
            && this.full_path === comparison.full_path
            && this.artefact.getSourceCode() === comparison.artefact.getSourceCode()
            && this.session.getID() === comparison.session.getID()) {
            return true;
        }
        else {
            return false;
        }
    }
}
exports.Type = Type;
//# sourceMappingURL=type.js.map