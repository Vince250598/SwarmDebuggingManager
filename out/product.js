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
const extension_1 = require("./extension");
class ProductQuickPickItem {
    constructor(productId, label) {
        this.label = label;
        this.productId = productId;
    }
}
exports.ProductQuickPickItem = ProductQuickPickItem;
function chooseProduct(currentUser) {
    return __awaiter(this, void 0, void 0, function* () {
        const products = yield getProducts(currentUser);
        if (products.length === 0) {
            vscode.window.showInformationMessage('You are not working on any products, create a new product to start debugging!'); //would you like to create a new product?
            return -2;
        }
        else {
            var chosenProduct = yield vscode.window.showQuickPick(products, { placeHolder: 'Which Product would you like to work on?' });
        }
        if (chosenProduct) {
            return chosenProduct.productId; //label = ID
        }
        else {
            vscode.window.showInformationMessage('No product Chosen');
            return -3;
        }
    });
}
exports.chooseProduct = chooseProduct;
function getProducts(currentUser) {
    return __awaiter(this, void 0, void 0, function* () {
        //Look into multiple graphql queries in one request
        const products = [];
        const query = `query products($developerId: Long) {
		products(developerId: $developerId) {
			id
			name
		}
	}`;
        const variables = {
            developerId: currentUser.id
        };
        var data = yield graphql_request_1.request(extension_1.SERVERURL, query, variables);
        for (var i = 0; i < data.products.length; i++) {
            products.push({
                label: data.products[i].name,
                productId: data.products[i].id
            });
        }
        return products;
    });
}
exports.getProducts = getProducts;
function createProduct(currentUser) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!currentUser.isLoggedIn()) {
            vscode.window.showInformationMessage('You must be logged in to create a new product');
            return -1;
        }
        var productName = yield vscode.window.showInputBox({ prompt: 'Enter the product name' });
        //add verification product attributes
        if (productName === undefined) {
            return -2;
        }
        else if (!productName) {
            return yield createProduct(currentUser);
        }
        const productQuery = `mutation createProduct($productName: String!) {
		productCreate(product: {
			name: $productName
		}) {
			id
		}
	}`;
        const productVariables = {
            productName: productName
        };
        var productData = yield graphql_request_1.request(extension_1.SERVERURL, productQuery, productVariables);
        //id exists verification
        //delete this task when a real task is entered to keep link between developer and product
        const taskQuery = `mutation taskCreate($productId: Long!) {
		taskCreate(task: {
			url: "taskUrl"
			title: "productCreation"
			done: true
			product: {
				id: $productId
			}
		}) {
			id
		}
	}`;
        const taskVariables = {
            productId: productData.productCreate.id
        };
        if (productData.productCreate.id) {
            var taskData = yield graphql_request_1.request(extension_1.SERVERURL, taskQuery, taskVariables);
        }
        let date = new Date().toISOString();
        //create a session
        const sessionQuery = `mutation sessionStart($now: Date, $developerId: Long!, $taskId: Long!) {
		sessionStart(session: {
			developer: {
				id: $developerId
			}
			task: {
				id: $taskId
				done: true
			}
			purpose: "create a link between developer and product, not an actual session"
			finished: $now
		}) {
			id
		}
	}`;
        const sessionVariables = {
            now: date,
            developerId: currentUser.id,
            taskId: taskData.taskCreate.id
        };
        if (taskData.taskCreate.id) {
            var sessionData = yield graphql_request_1.request(extension_1.SERVERURL, sessionQuery, sessionVariables);
        }
        if (productData.productCreate.id) {
            return productData.productCreate.id;
        }
        return -1;
    });
}
exports.createProduct = createProduct;
//# sourceMappingURL=product.js.map