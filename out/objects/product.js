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
class Product {
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }
    getID() {
        return this.id;
    }
    setID(id) {
        this.id = id;
    }
    getName() {
        return this.name;
    }
    setName(name) {
        this.name = name;
    }
    //should function be static?
    static chooseProduct(currentUser, productService) {
        return __awaiter(this, void 0, void 0, function* () {
            const products = yield productService.getProducts(currentUser);
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
}
exports.Product = Product;
class ProductQuickPickItem {
    constructor(productId, label) {
        this.label = label;
        this.productId = productId;
    }
}
exports.ProductQuickPickItem = ProductQuickPickItem;
//# sourceMappingURL=product.js.map