import WhatsappCloudAPI from 'whatsappcloudapi_wrapper';
export const Whatsapp = new WhatsappCloudAPI({
    accessToken: process.env.accessToken,
    senderPhoneNumberId: process.env.senderPhoneNumberId,
    WABA_ID: process.env.WABA_ID, 
    graphAPIVersion: process.env.graphAPIVersion
});

const Meta_WA_VerifyToken = process.env.Meta_WA_VerifyToken;

import { Store, CustomerSession, addToCart, listOfItemsInCart, clearCart } from '../utils/cartLogic.js';
import { closeRequestAccepted, sendTextToAgent, speakToHuman } from './webhookActions.js';

export const whatsappWebhookGet = (req, res, next) => {
    try {
        console.log('GET: Someone is pinging me!');

        let mode = req.query['hub.mode'];
        let token = req.query['hub.verify_token'];
        let challenge = req.query['hub.challenge'];

        if (
            mode &&
            token &&
            mode === 'subscribe' &&
            Meta_WA_VerifyToken === token
        ) {
            return res.status(200).send(challenge);
        } else {
            return res.sendStatus(403);
        }
    } catch (error) {
        console.error({error})
        return res.sendStatus(500);
    }
}

export const whatsappWebhook = async (req, res, next) => {
    try {
        let data = Whatsapp.parseMessage(req.body);
        if(data?.isMessage) {
            let incomingMessage = data.message;
            let recipientPhone = incomingMessage.from.phone; // extract the phone number of sender
            let recipientName = incomingMessage.from.name;
            let typeOfMsg = incomingMessage.type; // extract the type of message (some are text, others are images, others are responses to buttons etc...)
            let message_id = incomingMessage.message_id; // extract the message id

            if (!CustomerSession.get(recipientPhone)) {
                CustomerSession.set(recipientPhone, {
                    cart: [],
                });
            }
            if (typeOfMsg === 'text_message') {
                const { message, status } = await sendTextToAgent(recipientPhone, recipientName, incomingMessage.text);
                if(!message && !status) {
                    await Whatsapp.sendSimpleButtons({
                        message: `Hey ${recipientName}, \nYou are speaking to a chatbot.\nWhat do you want to do next?`,
                        recipientPhone: recipientPhone, 
                        listOfButtons: [
                            {
                                title: 'View some products',
                                id: 'see_categories',
                            },
                            {
                                title: 'Speak to a human',
                                id: 'speak_to_human',
                            },
                        ],
                    });
                } else if (message && status === 'Pending') {
                    await Whatsapp.sendText({
                        recipientPhone: recipientPhone,
                        message: message,
                    })
                } else {
                    console.log(status, "message sent to agent!")
                }
            }

            if (typeOfMsg === 'simple_button_message') {
                let button_id = incomingMessage.button_reply.id;
            
                if (button_id === 'speak_to_human') {
                    const response = await speakToHuman(recipientPhone, recipientName)
                    await Whatsapp.sendText({
                        recipientPhone: recipientPhone,
                        message: response.message,
                    });
            
                    // await Whatsapp.sendContact({
                    //     recipientPhone: recipientPhone,
                    //     contact_profile: {
                    //         addresses: [
                    //             {
                    //                 city: 'India',
                    //                 country: 'Bengaluru',
                    //             },
                    //         ],
                    //         name: {
                    //             first_name: 'Afzal',
                    //             last_name: 'Imam',
                    //         },
                    //         org: {
                    //             company: 'Istakapaza Pvt. Ltd.',
                    //         },
                    //         phones: [
                    //             {
                    //                 phone: '+91 6206864101',
                    //             }
                    //         ],
                    //     },
                    // });
                }
                if(button_id === 'close_chat_session_request') {
                    const res = await closeRequestAccepted(recipientPhone);
                    if(res.message) {
                        await Whatsapp.sendText({
                            recipientPhone: recipientPhone,
                            message: res.message,
                        });
                    }
                }
                if (button_id === 'see_categories') {
                    let categories = await Store.getAllCategories(); 
                    await Whatsapp.sendSimpleButtons({
                        message: `We have three categories for you.\nChoose one of them.`,
                        recipientPhone: recipientPhone, 
                        listOfButtons: categories.data
                            .map((category) => ({
                                title: category,
                                id: `category_${category}`,
                            }))
                            .slice(0, 3)
                    });
                }
                if (button_id.startsWith('category_')) {
                    let selectedCategory = button_id.split('category_')[1];
                    let listOfProducts = await Store.getProductsInCategory(selectedCategory);
                
                    let listOfSections = [
                        {
                            title: `🏆 Top Products: ${selectedCategory}`.substring(0,24),
                            rows: listOfProducts.data
                                .map((product) => {
                                    let id = `product_${product.id}`.substring(0,256);
                                    let title = product.title.substring(0,21);
                                    let description = `${product.price}\n${product.description}`.substring(0,68);
                                
                                    return {
                                        id,
                                        title: `${title}...`,
                                        description: `$${description}...`
                                    };
                                }).slice(0, 10)
                        },
                    ];
                
                    await Whatsapp.sendRadioButtons({
                        recipientPhone: recipientPhone,
                        headerText: `#Today Offers: ${selectedCategory}`,
                        bodyText: `Our Bot has lined up some great products for you based on your previous shopping history.\n\nPlease select one of the products below:`,
                        footerText: 'Powered by: Istakapaza',
                        listOfSections,
                    });
                }
                if (button_id.startsWith('add_to_cart_')) {
                    let product_id = button_id.split('add_to_cart_')[1];
                    await addToCart({ recipientPhone, product_id });
                    let numberOfItemsInCart = listOfItemsInCart({ recipientPhone }).count;
                
                    await Whatsapp.sendSimpleButtons({
                        message: `Your cart has been updated.\nNumber of items in cart: ${numberOfItemsInCart}.\n\nWhat do you want to do next?`,
                        recipientPhone: recipientPhone, 
                        listOfButtons: [
                            {
                                title: 'Checkout 🛍️',
                                id: `checkout`,
                            },
                            {
                                title: 'See more products',
                                id: 'see_categories',
                            },
                        ],
                    });
                }
                if (button_id === 'checkout') {
                    let finalBill = listOfItemsInCart({ recipientPhone });
                    let invoiceText = `List of items in your cart:\n`;
                
                    finalBill.products.forEach((item, index) => {
                        let serial = index + 1;
                        invoiceText += `\n#${serial}: ${item.title} @ $${item.price}`;
                    });
                
                    invoiceText += `\n\nTotal: $${finalBill.total}`;
                
                    Store.generatePDFInvoice({
                        order_details: invoiceText,
                        file_path: `./invoice_${recipientName}.pdf`,
                    });
                
                    await Whatsapp.sendText({
                        message: invoiceText,
                        recipientPhone: recipientPhone,
                    });
                
                    await Whatsapp.sendSimpleButtons({
                        recipientPhone: recipientPhone,
                        message: `Thank you for shopping with us, ${recipientName}.\n\nYour order has been received & will be processed shortly.`,
                        message_id,
                        listOfButtons: [
                            {
                                title: 'See more products',
                                id: 'see_categories',
                            },
                            {
                                title: 'Print my invoice',
                                id: 'print_invoice',
                            },
                        ],
                    });
                
                    clearCart({ recipientPhone });
                }
                if (button_id === 'print_invoice') {
                    // Send the PDF invoice
                    await Whatsapp.sendDocument({
                        recipientPhone: recipientPhone,
                        caption:`Istakapaza invoice for #${recipientName}`,
                        url: 'http://pdfkit.org/demo/out.pdf',
                        mime_type: 'application/pdf',
                        file_name: 'Demo Invoice'
                    });
                
                    // Send the location of our pickup station to the customer, so they can come and pick up their order
                    let warehouse = Store.generateRandomGeoLocation();
                
                    await Whatsapp.sendText({
                        recipientPhone: recipientPhone,
                        message: `Your order has been fulfilled. Come and pick it up, as you pay, here:`,
                    });
                
                    await Whatsapp.sendLocation({
                        recipientPhone,
                        latitude: warehouse.latitude,
                        longitude: warehouse.longitude,
                        address: warehouse.address,
                        name: 'Istakapaza',
                    });
                }
            };

            if (typeOfMsg === 'radio_button_message') {
                let selectionId = incomingMessage.list_reply.id;
                if (selectionId.startsWith('product_')) {
                    let product_id = selectionId.split('_')[1];
                    let product = await Store.getProductById(product_id);
                    const { price, title, description, category, image: imageUrl, rating } = product.data;
                
                    let emojiRating = (rvalue) => {
                        rvalue = Math.floor(rvalue || 0);
                        let output = [];
                        for (var i = 0; i < rvalue; i++) output.push('⭐');
                        return output.length ? output.join('') : 'N/A';
                    };
                
                    let text = `*${title.trim()}*\n\n\n`;
                    text += `*Description*: ${description.trim()}\n\n\n`;
                    text += `*Price: $${price}*\n`;
                    text += `*Category*: ${category}\n`;
                    text += `${rating?.count || 0} people liked this product.\n`;
                    text += `_Rated_: ${emojiRating(rating?.rate)}\n`;
                
                    await Whatsapp.sendImage({
                        recipientPhone,
                        url: imageUrl,
                        caption: text,
                    });
                
                    await Whatsapp.sendSimpleButtons({
                        message: `Here is the product, what do you want to do next?`,
                        recipientPhone: recipientPhone, 
                        listOfButtons: [
                            {
                                title: 'Add to cart🛒',
                                id: `add_to_cart_${product_id}`,
                            },
                            {
                                title: 'Speak to a human',
                                id: 'speak_to_human',
                            },
                            {
                                title: 'See more products',
                                id: 'see_categories',
                            },
                        ],
                    });
                }
            }
            await Whatsapp.markMessageAsRead({ message_id }); 
            res.status(200).send('Message processed');
        }
    } catch (error) {
        console.error({error})
        return res.sendStatus(500);
    }
}