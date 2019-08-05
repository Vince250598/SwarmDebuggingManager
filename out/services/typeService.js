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
const extension_1 = require("../extension");
const type_1 = require("../objects/type");
const artefact_1 = require("../objects/artefact");
const product_1 = require("../objects/product");
const task_1 = require("../objects/task");
const session_1 = require("../objects/session");
const developer_1 = require("../objects/developer");
class TypeService {
    constructor(artefact, type) {
        this.artefact = artefact;
        this.type = type;
    }
    setArtefact(artefact) {
        this.artefact = artefact;
    }
    setType(type) {
        this.type = type;
    }
    create() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.type && this.artefact) {
                const query = `mutation typeCreate(
                $typeName: String, 
                $typeFullName: String, 
                $typeFullPath: String, 
                $sessionId: Long,
                $inputSource: String) {
                typeCreate(typeWrapper: {
                type: {
                    name: $typeName,
                    fullName: $typeFullName,
                    fullPath: $typeFullPath,
                    session:{
                    id: $sessionId
                    }
                }, 
                source: $inputSource
                }) {
                id
                artefact {
                    id
                    typeHash
                }
                }
            }`;
                const variables = {
                    typeName: this.type.name,
                    typeFullName: this.type.getFullName(),
                    typeFullPath: this.type.getFullPath(),
                    sessionId: this.type.getSession().getID(),
                    inputSource: this.artefact.getSourceCode()
                };
                var data = yield graphql_request_1.request(extension_1.SERVERURL, query, variables);
                this.type.setID(data.typeCreate.id);
                this.artefact.setID(data.typeCreate.artefact.id);
                this.artefact.setTypeHash(data.typeCreate.artefact.id);
                return true;
            }
            else {
                return false;
            }
        });
    }
    getAllBySession(session) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `query types($sessionId: Long) {
            types(sessionId: $sessionId) {
            id
            fullPath
            fullName
            name
            artefact {
                id
                sourceCode
                typeHash
            }
            session {
                id
                description
                started
                label
                project
                purpose
                developer {
                id
                color
                username
                }
                task {
                id
                color
                title
                url
                product {
                    id
                    name
                }
                }
            }
            }
        }`;
            const variables = {
                sessionId: session.getID()
            };
            var data = yield graphql_request_1.request(extension_1.SERVERURL, query, variables);
            var answer = [];
            var i = 0;
            for (let i = 0; i < data.types.length; i++) {
                let tempArtefact = new artefact_1.Artefact(data.types[i].artefact.sourceCode);
                tempArtefact.setID(data.types[i].artefact.id);
                tempArtefact.setTypeHash(data.types[i].artefact.typeHash);
                let tempProduct = new product_1.Product(data.types[i].session.task.product.id, data.types[i].session.task.product.name);
                let tempTask = new task_1.Task(data.types[i].session.task.color, data.types[i].session.task.title, data.types[i].session.task.url, tempProduct);
                tempTask.setID(data.types[i].session.task.id);
                let tempDeveloper = new developer_1.Developer(data.types[i].session.developer.color, data.types[i].session.developer.name);
                tempDeveloper.setID(data.types[i].session.developer.id);
                let tempSession = new session_1.Session(data.types[i].session.description, data.types[i].session.started, data.types[i].session.label, data.types[i].session.project, data.types[i].session.purpose, tempDeveloper, tempTask);
                tempSession.setID(data.types[i].session.id);
                let tempType = new type_1.Type(data.types[i].fullName, data.types[i].fullPath, data.types[i].name, tempArtefact, tempSession);
                tempType.setID(data.types[i].id);
                answer[i] = tempType;
            }
            return answer;
        });
    }
}
exports.TypeService = TypeService;
//# sourceMappingURL=typeService.js.map