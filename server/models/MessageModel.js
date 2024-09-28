import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    chatId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ChatSession'
    },
    sender: {
        type: String,
        required: true,
        enum: ['Agent', 'Customer']
    },
    message: { type: String, required: true }
}, {timestamps: true})

const Message = mongoose.model('Message', messageSchema);

export default Message;