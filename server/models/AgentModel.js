import mongoose from 'mongoose';

const agentSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, "Name is required!"]
    },
    email: {
        type: String,
        unique: true,
        required: [true, "Email is required!"]
    },
    password: {
        type: String,
        required: [true, "Password is required!"]
    },
    status: {
        type: String,
        enum: ["Online", "Offline"],
        default: "Offline"
    },
    socketId: String,
    maxConcurrentChats: Number
}, {timestamps: true})

const Agent = mongoose.model('Agent', agentSchema);

export default Agent;