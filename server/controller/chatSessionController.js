import {
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from "../handleFactory.js";
import ChatSession from "../models/ChatSessionModel.js";

export const createChatSession = async(req, res) => {
  try {
    const { customerContact, customerName } = req.body;
    const data = {
      customerName,
      customerContact,
      agentId: req.user._id
    }
    const doc = await ChatSession.create(data);
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
}
export const getAllChatSession = async (req, res, next) => {
  try {
    const filter = { agentId: req.user._id };
    if(req.query.status) filter.status = req.query.status;
    const doc = await ChatSession.find(filter).sort({ updatedAt: -1 });
    res.status(200).json({
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
export const getAllPendingChatSession = async (req, res, next) => {
  try {
    const doc = await ChatSession.find({ status: "Pending" });
    res.status(200).json({
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
export const getOneChatSession = getOne(ChatSession);
export const deleteOneChatSession = deleteOne(ChatSession);
export const updateChatSession = updateOne(ChatSession);
