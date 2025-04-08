import mongoose from 'mongoose';

export const notificationType = {
    order: 'order',
    deal: 'deal',
    newBrandDealCreated: 'newBrandDealCreated',
    orderFormUpdate: 'orderFromUpdate',
};

const NotificationSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Types.ObjectId, ref: 'User' },
        userCurrentAdminReference: {
            type: mongoose.Types.ObjectId,
            ref: 'Admin',
        },
        adminId: { type: mongoose.Types.ObjectId, ref: 'Admin' },
        dealId: { type: mongoose.Types.ObjectId, ref: 'Deal' },
        brandId: { type: mongoose.Types.ObjectId, ref: 'Brand' },
        orderId: { type: mongoose.Types.ObjectId, ref: 'Order' },
        title: { type: String, required: true },
        body: { type: String, required: true },

        type: {
            type: String,
            enum: Object.values(notificationType),
            required: true,
        },
    },
    {
        timestamps: true,
    },
);
export default mongoose.model('Notification', NotificationSchema);
//# sourceMappingURL=Order.js.map
