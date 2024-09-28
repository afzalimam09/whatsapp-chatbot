import {
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from "../handleFactory.js";
import ChatSession from "../models/ChatSessionModel.js";
import Message from "../models/MessageModel.js";
import { Whatsapp } from "./webhookController.js";

export const getAllMessage = getAll(Message);
export const getOneMessage = getOne(Message);
export const deleteMessage = deleteOne(Message);
export const createMessage = async (req, res, next) => {
  try {
    const doc = await Message.create(req.body);
    const chatSession = await ChatSession.findById(req.body.chatId);
    await Whatsapp.sendText({
      recipientPhone: `${chatSession.customerContact}`,
      message: req.body.message
  });
    res.status(201).json({
      status: "success",
      data: doc,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.msg || "Internal server error",
    });
  }
};
export const updateMessage = updateOne(Message);
