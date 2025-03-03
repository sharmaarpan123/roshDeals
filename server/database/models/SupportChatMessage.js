import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema(
    {
        msg: {
            type: String,
            required: true,
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        reciever: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        senderAdminId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Admin',
        },
        recieverAdminId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Admin',
        },
        senderUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        recieverUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        messageType: {
            type: String,
            enum: ['text', 'image', 'video'],
            default: 'text',
        },
        isRead: {
            type: Boolean,
            default: false,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    },
);
export default mongoose.model('SupportChatMessage', adminSchema);
