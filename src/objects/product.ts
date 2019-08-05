import * as vscode from 'vscode';
import { request } from 'graphql-request';
import { Developer } from './developer';
import { ProductService } from '../services/productService';
import { SERVERURL } from '../extension';

export class Product {

    private id: number;
    private name: string;

    constructor(id: number, name: string) {
		this.id = id;
        this.name = name;
    }

    getID() {
        return this.id;
    }

    setID(id: number) {
        this.id = id;
    }

    getName() {
        return this.name;
    }

    setName(name: string) {
        this.name = name;
	}

    //should function be static?
	static async chooseProduct(currentUser: Developer, productService: ProductService) {

		const products: ProductQuickPickItem[] = await productService.getProducts(currentUser);
		if(products.length === 0){
			vscode.window.showInformationMessage('You are not working on any products, create a new product to start debugging!'); //would you like to create a new product?
			return -2;
		}else{
			var chosenProduct = await vscode.window.showQuickPick(products, {placeHolder: 'Which Product would you like to work on?'});
		}
		if(chosenProduct) {
			return chosenProduct.productId; //label = ID
		}else {
			vscode.window.showInformationMessage('No product Chosen');
			return -3;
		}
    }

}

export class ProductQuickPickItem implements vscode.QuickPickItem {

	productId?: number;
	label: string;
	description?: string;
	detail?: string;
	picked?: boolean;
	alwaysShow?: boolean;

	constructor(
		productId: number,
		label: string,
	){
		this.label = label;
		this.productId = productId;
	}
	
}