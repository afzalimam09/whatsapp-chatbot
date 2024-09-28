import Message from "../models/MessageModel.js";

export const createMessage = async (data) => {
    try {
        const doc = await Message.create(data);
        return doc;
      } catch (error) {
        console.log(error);
        throw new Error(error.message || "Error create message");
      }
}