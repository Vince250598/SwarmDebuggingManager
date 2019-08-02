"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
class Breakpoint {
    constructor(line_number, type) {
        // Char_start and char_end removed because there was no use
        this.id = -1;
        this.line_number = -1;
        this.line_number = line_number;
        this.type = type;
    }
    getID() {
        return this.id;
    }
    setID(id) {
        this.id = id;
    }
    getLineNumber() {
        return this.line_number;
    }
    setLineNumber(line_number) {
        this.line_number = line_number;
    }
    getType() {
        return this.type;
    }
    setType(type) {
        this.type = type;
    }
    // This  function is used to compare a breakpoint as it comes straight from the VSCode
    equalsVSBreakpoint(comparison) {
        let vsSourceCode = fs.readFileSync(comparison.location.uri.fsPath, 'utf8');
        if (this.line_number === comparison.location.range.start.line
            && this.type.getFullPath() === comparison.location.uri.fsPath
            && this.type.getArtefact().getSourceCode() === vsSourceCode) {
            return true;
        }
        else {
            return false;
        }
    }
}
exports.Breakpoint = Breakpoint;
//# sourceMappingURL=breakpoint.js.map