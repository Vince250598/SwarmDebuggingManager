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
const graphql_request_1 = require("graphql-request");
const breakpoint_1 = require("../objects/breakpoint");
const type_1 = require("../objects/type");
const artefact_1 = require("../objects/artefact");
const product_1 = require("../objects/product");
const task_1 = require("../objects/task");
const session_1 = require("../objects/session");
const developer_1 = require("../objects/developer");
const extension_1 = require("../extension");
class BreakpointService {
    constructor(breakpoint) {
        this.breakpoint = breakpoint;
    }
    setBreakpoint(breakpoint) {
        this.breakpoint = breakpoint;
    }
    create() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.breakpoint) {
                const query = `mutation breakpointCreate(
                $breakpointLineNumber: Int, 
                $typeId: Long) {
              breakpointCreate(breakpoint: {
                lineNumber: $breakpointLineNumber,
                type: {
                  id: $typeId
                }
              }){
                id
              }
            }`;
                const variables = {
                    breakpointLineNumber: this.breakpoint.getLineNumber(),
                    typeId: this.breakpoint.getType().getID()
                };
                var data = yield graphql_request_1.request(extension_1.SERVERURL, query, variables);
                this.breakpoint.setID(data.breakpointCreate.id);
                return true;
            }
            else {
                return false;
            }
        });
    }
    getAll(task) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `query breakpoint($taskId: Long){
            breakpoint(taskId: $taskId) {
            lineNumber,
            type{
                id,
                fullPath,
                fullName,
                name,
                artefact{
                id,
                sourceCode,
                typeHash
                },
                session{
                id,
                description,
                started,
                label,
                project,
                purpose,
                developer{
                    id,
                    color,
                    username
                },
                task{
                    id,
                    color,
                    title,
                    product {
                    id,
                    name
                    }
                }
                }
            }
            }
        }`;
            const variables = {
                taskId: task.getID()
            };
            var data = yield graphql_request_1.request(extension_1.SERVERURL, query, variables);
            var answer = [];
            for (let i = 0; i < data.breakpoint.length; i++) {
                let tempArtefact = new artefact_1.Artefact(data.breakpoint[i].type.artefact.sourceCode);
                tempArtefact.setID(data.breakpoint[i].type.artefact.id);
                tempArtefact.setTypeHash(data.breakpoint[i].type.artefact.typeHash);
                let tempProduct = new product_1.Product(data.breakpoint[i].type.session.task.product.id, data.breakpoint[i].type.session.task.product.name);
                let tempTask = new task_1.Task(data.breakpoint[i].type.session.task.color, data.breakpoint[i].type.session.task.title, data.breakpoint[i].type.session.task.url, tempProduct);
                tempTask.setID(data.breakpoint[i].type.session.task.id);
                let tempDeveloper = new developer_1.Developer(data.breakpoint[i].type.session.developer.color, data.breakpoint[i].type.session.developer.name);
                tempDeveloper.setID(data.breakpoint[i].type.session.developer.id);
                let tempSession = new session_1.Session(data.breakpoint[i].type.session.description, data.breakpoint[i].type.session.started, data.breakpoint[i].type.session.label, data.breakpoint[i].type.session.project, data.breakpoint[i].type.session.purpose, tempDeveloper, tempTask);
                tempSession.setID(data.breakpoint[i].type.session.id);
                let tempType = new type_1.Type(data.breakpoint[i].type.fullName, data.breakpoint[i].type.fullPath, data.breakpoint[i].type.name, tempArtefact, tempSession);
                tempType.setID(data.breakpoint[i].type.id);
                let tempBreakpoint = new breakpoint_1.Breakpoint(data.breakpoint[i].lineNumber, tempType);
                answer[i] = tempBreakpoint;
            }
            return answer;
        });
    }
}
exports.BreakpointService = BreakpointService;
//# sourceMappingURL=breakpointService.js.map