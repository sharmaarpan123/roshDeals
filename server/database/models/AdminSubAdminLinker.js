import mongoose from 'mongoose';

const AdminSubAdminLinkerSchema = new mongoose.Schema({
    subAdminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true,
    },
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true,
    },
    isActive: { type: Boolean, default: true },
});

export default mongoose.model('AdminSubAdminLinker', AdminSubAdminLinkerSchema);
