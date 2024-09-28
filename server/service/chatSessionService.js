import ChatSession from "../models/ChatSessionModel.js";

export const updateChatSession = async (filter, updateData) => {
    try {
        const updatedChatSession = await ChatSession.findOneAndUpdate(filter, updateData, { new: true });
        return updatedChatSession;
    } catch (error) {
        throw new Error(error.message || "Error updating chat session");
    }
};

export const getChatSession = async (filter) => {
    try {
        const chatSession = await ChatSession.findOne(filter);
        return chatSession;
    } catch (error) {
        console.log(error)
        throw new Error(error.message || "Error getting session");
    }
};