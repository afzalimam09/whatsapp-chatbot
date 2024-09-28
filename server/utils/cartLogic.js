import { EcommerceStore } from "./ecommerceStore.js";

let Store = new EcommerceStore();
const CustomerSession = new Map();

//cart logic
const addToCart = async ({ product_id, recipientPhone }) => {
    let product = await Store.getProductById(product_id);
    if (product.status === 'success') {
        CustomerSession.get(recipientPhone).cart.push(product.data);
    }
};

const listOfItemsInCart = ({ recipientPhone }) => {
    let total = 0;
    let products = CustomerSession.get(recipientPhone).cart;
    total = products.reduce(
        (acc, product) => acc + product.price,
        total
    );
    let count = products.length;
    return { total, products, count };
};

const clearCart = ({ recipientPhone }) => {
    CustomerSession.get(recipientPhone).cart = [];
};

export {Store, CustomerSession, clearCart, listOfItemsInCart, addToCart}