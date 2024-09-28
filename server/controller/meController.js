import { updateAgentById } from "../service/agentService.js";


export const updateMe = async (req, res) => {
    try {
        const updatedAgent = await updateAgentById(req.user._id, req.body);
        res.status(200).json({
            status: "success",
            data: updatedAgent,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Internal server error",
        });
    }
};