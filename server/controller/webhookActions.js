import { io } from "../app.js";
import Agent from "../models/AgentModel.js";
import ChatSession from "../models/ChatSessionModel.js"
import { getAgentById } from "../service/agentService.js";
import { createMessage } from "../service/messageService.js";
import { ACTIONS } from "../socket/actions.js";
import { updateChatSession } from "../service/chatSessionService.js";


// Speak to human logic goes here
export const speakToHuman = async (recipientPhone, recipientName) => {
    try {
        // step 1. check if there any active chat session for this user
        console.log(recipientName, recipientPhone)
        const existingChatSession = await ChatSession.findOne({ customerContact: recipientPhone, status: { $in: ['Pending', 'Active'] } });
        if(existingChatSession) {
            console.log(`There is already a ${existingChatSession.status} chat session for this user. Status: ${existingChatSession.status}`);
            return { message: `There is already a ${existingChatSession.status} chat session. Please wait for our agent to accept the request and respond! \nThank You for your time.`}
        }
        // step 2. if there is no active chat session then create a chat session with status pending
        const newChatSession = await ChatSession.create({ customerContact: recipientPhone, customerName: recipientName });
        // step 3. check all the online agents and emit an event to them via socket io
        const onlineAgents = await Agent.find({ status: 'Online' });
        if(onlineAgents.length === 0) {
            // send a message to user saying 'no online agents at this time. we will connect you soon'.
            console.log("No online agents at this time.")
            return { message: `There is no online agents at this time. You request has been taken. We'll get back to you as our agent comes online. \nThank you for your valuable time.`}
        }
        // emit this event to all agent on ui at real time via socket io.
        onlineAgents.forEach(agent => {
            io.to(agent.socketId).emit(ACTIONS.NEW_CHAT_SESSION_REQUEST, newChatSession);
        });

        return { message: `Thank you for your message. Please wait our agent will reply you in a minute.`}
    } catch (error) {
        console.log(error);
        // send a message again to user saying some technical issue at this time. we will connect you soon.
    }
}

export const closeRequestAccepted = async (recipientPhone) => {
    try {
        const chatSession = await ChatSession.findOne({ customerContact: recipientPhone, status: 'Active' });
        if(!chatSession) {
            console.log("No active chat session found");
            return { message: null }
        } else {
            chatSession.status = 'Closed';
            chatSession.lastMessage = 'Chat session closed by customer.'
            await chatSession.save();
            const message = {
                chatId: chatSession._id,
                sender: 'Customer',
                message: 'Chat session closed by customer.'
            }
            const savedMessage = await createMessage(message);
            const agent = await getAgentById(chatSession.agentId);
            io.to(agent.socketId).emit(ACTIONS.CHAT_CLOSE_REQUEST_ACCEPTED, chatSession);
            io.to(agent.socketId).emit(ACTIONS.NEW_MESSAGE_RECEIVED, savedMessage)
            return { message: `Thank you for reaching out! I'm glad I could assist you. If you have any more questions in the future, feel free to contact us. Have a great day!`}
        }
    } catch (error) {
        console.log(error)
    }
}

export const sendTextToAgent = async (recipientPhone, recipientName, text) => {
    try {
        const existingChatSession = await ChatSession.findOne({ customerContact: recipientPhone, status: { $in: ['Pending', 'Active'] } });
        if(!existingChatSession) {
            return { message: '', status: null }
        }
        if(existingChatSession && existingChatSession.status === 'Pending') {
            console.log(`There is already a ${existingChatSession.status} chat session for this user. Status: ${existingChatSession.status}`);
            return { message: `Please wait for our agent to accept the request and respond! \nThank You for your time.`, status: 'Pending' }
        }
        // there is a active chat going on, save this message to db, and sent this message to agent.
        const message = {
            chatId: existingChatSession._id,
            sender: 'Customer',
            message: text.body
        }
        const savedMessage = await createMessage(message);
        const updatedChatSession = await updateChatSession({ _id: existingChatSession._id }, { lastMessage: text.body })
        const agent = await getAgentById(existingChatSession.agentId);
        io.to(agent.socketId).emit(ACTIONS.NEW_MESSAGE_RECEIVED, savedMessage);
        io.to(agent.socketId).emit(ACTIONS.UPDATE_CONTACT_LIST, updatedChatSession._id);
        return { message: '', status: 'Active' }
    } catch (error) {
        console.log(error)
        return { message: '', status: 'Active'}
    }
}