import * as vscode from 'vscode';
import { request } from 'graphql-request';
import { SERVERURL } from '../extension';
import { Product, ProductQuickPickItem } from '../objects/product';
import { Developer } from '../objects/developer';

export class ProductService {

    product: Product | undefined;

    constructor(product?: Product) {
        this.product = product;
    }

    setProduct(product: Product) {
        this.product = product;
    }

    async getProducts(currentUser: Developer): Promise<vscode.QuickPickItem[]> {
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
        for (var i = 0; i < data.products.length; i++) {
            products.push({
                label: data.products[i].name,
                productId: data.products[i].id
            });
        }
        return products;
    }

    async createProduct(currentUser: Developer): Promise<any> {
        if (!currentUser.isLoggedIn()) {
            vscode.window.showInformationMessage('You must be logged in to create a new product');
            return -1;
        }

        var productName = await vscode.window.showInputBox({ prompt: 'Enter the product name' });
        //add verification product attributes
        if (productName === undefined) {
            return -2;
        } else if (!productName) {
            return await this.createProduct(currentUser);
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

        if (productData.productCreate.id) {
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
            developerId: currentUser.getID(),
            taskId: taskData.taskCreate.id
        };

        if (taskData.taskCreate.id) {
            var sessionData = await request(SERVERURL, sessionQuery, sessionVariables);
            if (sessionData.sessionCreate.id && productData.productCreate.id) {
                return new Product(productData.productCreate.id, productName);
            }
        }
        return -1;
    }

}