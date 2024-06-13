import catchAsync from '@/utilities/catchAsync';
import { Request, Response } from 'express';
import { createOrderSchema } from './Schema';
import Deal from '@/database/models/Deal';
import { errorResponse, successResponse } from '@/utilities/Responses';
import Order from '@/database/models/Order';

const checkSlotCompletedDeals = async (dealIds) =>
    Deal.find({
        _id: { $in: dealIds },
        $expr: { $gte: ['$slotCompletedCount', '$slotAlloted'] },
    });

export const OrderCreateController = catchAsync(
    async (req: Request, res: Response) => {
        const { dealIds, orderId, orderScreenShot, reviewerName } =
            createOrderSchema.parse(req.body);
        const { _id } = req.user;

        // validating the deals Id// start
        const validDealsIds = await Deal.find({
            _id: { $in: dealIds },
        });

        if (dealIds.length !== validDealsIds.length) {
            return res.status(400).json(
                errorResponse({
                    message: 'Deals are not Valid',
                }),
            );
        }
        // validating the deals Id// end

        // check to sure deals slot not completed // start
        const slotCompletedDeals = await checkSlotCompletedDeals(dealIds);

        if (slotCompletedDeals.length) {
            return res.status(400).json(
                errorResponse({
                    message:
                        'These Deals Slot are completed , please cancel these orders',
                    others: { deals: slotCompletedDeals },
                }),
            );
        }

        // check to sure deals slot not completed// end

        await Deal.updateMany(
            {
                _id: { $in: dealIds },
                $expr: { $lt: ['$slotCompletedCount', '$slotAlloted'] },
            },
            { $inc: { slotCompletedCount: 1 } },
        );

        const newCreatedOrders = await Order.insertMany(
            dealIds.map((deal) => ({
                dealId: deal,
                orderId,
                orderScreenShot,
                reviewerName,
                userId: _id,
            })),
        );

        return res.status(200).json(
            successResponse({
                message: 'orders created successfully!',
                others: { orders: newCreatedOrders },
            }),
        );
    },
);
//
// export const OrderFromUpdate = catchAsync(async (req: Request, res: Response) => {

//     // const order = await Order.findOne({_id : })

// })

export const OrderList = catchAsync(async (req: Request, res: Response) => {
    const orders = await Order.find({ userId: req.user._id });
    return res.status(200).json(
        successResponse({
            message: 'Orders List.',
            others: { orders },
        }),
    );
});
