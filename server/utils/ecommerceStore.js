import axios from 'axios';
import PDFDocument from 'pdfkit';
import fs from 'fs';

export class EcommerceStore {
    constructor() {}
    async _fetchAssistant(endpoint) {
        try {
            const response = await axios.get(`https://fakestoreapi.com${endpoint ? endpoint : '/'}`);
            return {
                status: 'success',
                data: response.data
            };
        } catch (error) {
            throw error;
        }
    }

    async getProductById(productId) {
        return await this._fetchAssistant(`/products/${productId}`);
    }
    async getAllCategories() {
        return await this._fetchAssistant('/products/categories?limit=100');
    }
    async getProductsInCategory(categoryId) {
        return await this._fetchAssistant(
            `/products/category/${categoryId}?limit=10`
        );
    }

    generatePDFInvoice({ order_details, file_path }) {
        const doc = new PDFDocument();
        doc.pipe(fs.createWriteStream(file_path));
        doc.fontSize(25);
        doc.text(order_details, 100, 100);
        doc.end();
        return;
    }

    generateRandomGeoLocation() {
        let storeLocations = [
            {
                latitude: 44.985613,
                longitude: 20.1568773,
                address: 'Bengaluru',
            },
            {
                latitude: 36.929749,
                longitude: 98.480195,
                address: 'Delhi',
            },
            {
                latitude: 28.91667,
                longitude: 30.85,
                address: 'Mumbai',
            },
        ];
        return storeLocations[
            Math.floor(Math.random() * storeLocations.length)
        ];
    }
};