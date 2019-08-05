"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Task {
    constructor(color, title, url, product) {
        this.id = -1;
        this.color = "000000";
        this.title = "";
        this.url = "";
        this.color = color;
        this.title = title;
        this.url = url;
        this.product = product;
    }
    getID() {
        return this.id;
    }
    setID(id) {
        this.id = id;
    }
    getColor() {
        return this.color;
    }
    setColor(color) {
        this.color = color;
    }
    getTitle() {
        return this.title;
    }
    setTitle(title) {
        this.title = title;
    }
    getURL() {
        return this.url;
    }
    setURL(url) {
        this.url = url;
    }
    getProduct() {
        return this.product;
    }
    setProduct(product) {
        this.product = this.product;
    }
}
exports.Task = Task;
//# sourceMappingURL=task.js.map