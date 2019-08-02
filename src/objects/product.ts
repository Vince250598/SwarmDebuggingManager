import * as vscode from 'vscode';
import { request } from 'graphql-request';
import { Developer } from './developer';
import { SERVERURL } from '../extension';

export class Product {

    private id: number = -1;
    private name: string = "";

    constructor(name: string) {
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

export async function chooseProduct(currentUser: Developer) {

	const products: ProductQuickPickItem[] = await getProducts(currentUser);
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

export async function getProducts(currentUser: Developer) : Promise<vscode.QuickPickItem[]> {
	//Look into multiple graphql queries in one request
	const products: ProductQuickPickItem[] = [];

	const query = `query products($developerId: Long) {
		products(developerId: $developerId) {
			id
			name
		}
	}`;
	const variables = {
		developerId: currentUser.getID()
	};

	var data = await request(SERVERURL, query, variables);
	for(var i = 0; i < data.products.length; i++){
		products.push({
			label: data.products[i].name,
			productId: data.products[i].id
		});
	}
	return products;
}

export async function createProduct(currentUser: Developer): Promise<number> {
	if(!currentUser.isLoggedIn()){
		vscode.window.showInformationMessage('You must be logged in to create a new product');
		return -1;
	} 
	
	var productName = await vscode.window.showInputBox({prompt: 'Enter the product name'});
	//add verification product attributes
	if(productName === undefined){
		return -2;
	} else if(!productName) {
		return await createProduct(currentUser);
	}
	
	const productQuery = `mutation createProduct($productName: String!) {
		productCreate(product: {
			name: $productName
		}) {
			id
		}
	}`;

	const productVariables = {
		productName : productName
	};

	var productData = await request(SERVERURL, productQuery, productVariables);
	
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

	if(productData.productCreate.id){
		var taskData = await request(SERVERURL, taskQuery, taskVariables);
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
		developerId : currentUser.getID(),
		taskId : taskData.taskCreate.id
	};

	if(taskData.taskCreate.id){
		var sessionData = await request(SERVERURL, sessionQuery, sessionVariables);
	}
	if(productData.productCreate.id){
		return productData.productCreate.id;
	}

	return -1;
}