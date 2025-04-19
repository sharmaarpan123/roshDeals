import mongoose from 'mongoose';

const SellerDealLinkerSchema = new mongoose.Schema({
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller',
        required: true,
    },
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true,
    },
    dealId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Deal',
        required: true,
    },
    isActive: { type: Boolean, default: true },
});

export default mongoose.model('SellerDealLinker', SellerDealLinkerSchema);
