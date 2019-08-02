"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Artefact {
    constructor(source_code) {
        this.id = -1;
        this.source_code = "";
        this.type_hash = -1; // Generated in the server
        this.source_code = source_code;
    }
    getID() {
        return this.id;
    }
    setID(id) {
        this.id = id;
    }
    getSourceCode() {
        return this.source_code;
    }
    setSourceCode(source_code) {
        this.source_code = source_code;
    }
    getTypeHash() {
        return this.type_hash;
    }
    setTypeHash(type_hash) {
        this.type_hash = type_hash;
    }
    equals(comparison) {
        if (this.source_code === comparison.source_code) {
            return true;
        }
        else {
            return false;
        }
    }
}
exports.Artefact = Artefact;
//# sourceMappingURL=artefact.js.map