import Agent from "../models/AgentModel.js";

export const updateAgentById = async (id, updateData) => {
    try {
        const updatedAgent = await Agent.findByIdAndUpdate(id, updateData, { new: true });
        return updatedAgent;
    } catch (error) {
        throw new Error(error.message || "Error updating agent");
    }
};

export const getAgentById = async (id) => {
    try {
        const agent = await Agent.findById(id);
        return agent;
    } catch (error) {
        throw new Error(error.message || "Error updating agent");
    }
};

export const updateAgentBySocketId = async (socketId, updateData) => {
    try {
        const updatedAgent = await Agent.findOneAndUpdate({ socketId }, updateData, { new: true });
        return updatedAgent;
    } catch (error) {
        throw new Error(error.message || "Error updating agent");
    }
};

export const getOnlineAgents = async () => {
    try {
        const onlineAgents = await Agent.find({ status: 'Online' })
        return onlineAgents;
    } catch (error) {
        throw new Error(error.message || "Error geting online agent");
    }
}