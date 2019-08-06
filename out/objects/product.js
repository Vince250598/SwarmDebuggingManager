"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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