import mongoose from 'mongoose';

const chatSessionSchema = new mongoose.Schema({
    agentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Agent'
    },
    customerContact: {
        type: String,
        required: true
    },
    customerName: String,
    status: {
        type: String,
        enum: ["Pending", "Active", "Closed"],
        default: "Pending"
    },
    lastMessage: String
}, {timestamps: true})

const ChatSession = mongoose.model('ChatSession', chatSessionSchema);

export default ChatSession;