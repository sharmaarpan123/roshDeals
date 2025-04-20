import mongoose from 'mongoose';
import Seller from '../../../database/models/Seller.js';
import SellerDealLinker from '../../../database/models/SellerDealLinker.js';
import catchAsync from '../../../utilities/catchAsync.js';
import { hashPassword } from '../../../utilities/hashPassword.js';
import {
    errorResponse,
    successResponse,
} from '../../../utilities/Responses.js';
import { filterSchema } from '../../../utilities/ValidationSchema.js';
import sellerValidationSchema from './sellerSchema.js';
import Order from '../../../database/models/Order.js';

class SellerController {
    getSellerListWithFilter = catchAsync(async (req, res) => {
        const { offset, limit, search, status } = filterSchema.parse(req.query);

        const pipeline = [
            {
                $match: {
                    ...(search && {
                        $or: [
                            { name: { $regex: search, $options: 'i' } },
                            { email: { $regex: search, $options: 'i' } },
                            { phoneNumber: { $regex: search, $options: 'i' } },
                        ],
                    }),
                    ...(status && {
                        isActive: Boolean(+status),
                    }),
                },
            },
        ];

        const total = Seller.aggregate([...pipeline, { $count: 'totalCount' }]);

        pipeline.push(
            { $sort: { createdAt: -1 } },
            { $skip: +offset || 0 },
            { $limit: +limit || 10 },
        );

        const [totalCount, sellers] = await Promise.all([
            total,
            Seller.aggregate(pipeline),
        ]);

        return res.status(200).json(
            successResponse({
                message: 'Sellers fetched successfully',
                data: sellers,
                total: totalCount[0]?.totalCount || 0,
            }),
        );
    });

    getSellerById = catchAsync(async (req, res) => {
        const { sellerId } = sellerValidationSchema.getByIdSchema.parse(
            req.params,
        );

        const seller = await Seller.findById(sellerId);
        if (!seller) {
            return res.status(404).json(
                errorResponse({
                    message: 'Seller not found',
                }),
            );
        }

        return res.status(200).json(
            successResponse({
                message: 'Seller fetched successfully',
                data: seller,
            }),
        );
    });

    createSeller = catchAsync(async (req, res) => {
        const validatedBody = sellerValidationSchema.createSellerSchema.parse(
            req.body,
        );
        const { name, email, password, phoneNumber, dealIds, isActive } =
            validatedBody;

        // Check if seller with same email or phone already exists
        const existingSeller = await Seller.findOne({
            $or: [{ email }, { phoneNumber }],
        });

        if (existingSeller) {
            return res.status(400).json(
                errorResponse({
                    message:
                        existingSeller.email === email
                            ? 'Seller with this email already exists'
                            : 'Seller with this phone number already exists',
                }),
            );
        }

        // Hash the password
        const hashedPassword = await hashPassword(password);

        // Create new seller
        const newSeller = new Seller({
            name,
            email,
            password: hashedPassword,
            phoneNumber,
            isActive,
        });

        await newSeller.save();

        // Create deal linkages if dealIds are provided
        if (dealIds && dealIds.length > 0) {
            const dealLinkers = dealIds.map((dealId) => ({
                sellerId: newSeller._id,
                adminId: req.user._id,
                dealId: dealId,
                isActive: true,
            }));

            await SellerDealLinker.insertMany(dealLinkers);
        }

        return res.status(200).json(
            successResponse({
                message: 'Seller created successfully',
                data: {
                    seller: newSeller,
                    dealIds: dealIds || [],
                },
            }),
        );
    });

    updateSeller = catchAsync(async (req, res) => {
        const { sellerId, ...updateData } =
            sellerValidationSchema.updateSellerSchema.parse(req.body);

        const seller = await Seller.findById(sellerId);
        if (!seller) {
            return res.status(404).json(
                errorResponse({
                    message: 'Seller not found',
                }),
            );
        }

        if (updateData.password) {
            updateData.password = await hashPassword(updateData.password);
        }

        const updatedSeller = await Seller.findByIdAndUpdate(
            sellerId,
            updateData,
            { new: true },
        );

        return res.status(200).json(
            successResponse({
                message: 'Seller updated successfully',
                data: updatedSeller,
            }),
        );
    });

    linkSellerDeals = catchAsync(async (req, res) => {
        const { email, phoneNumber, dealIds, isActive } =
            sellerValidationSchema.linkSellerDealsSchema.parse(req.body);

        // Find seller by email or phone number
        const seller = await Seller.findOne({
            $or: [
                ...(email ? [{ email }] : []),
                ...(phoneNumber ? [{ phoneNumber }] : []),
            ],
        });

        if (!seller) {
            return res.status(404).json(
                errorResponse({
                    message:
                        'Seller not found with the provided email or phone number',
                }),
            );
        }

        // Check if any of the deals are already linked to this seller
        const existingLinks = await SellerDealLinker.find({
            sellerId: seller._id,
            dealId: {
                $in: dealIds.map((id) => new mongoose.Types.ObjectId(id)),
            },
        });

        if (existingLinks.length > 0) {
            return res.status(400).json(
                errorResponse({
                    message: 'Some deals are already linked to this seller',
                    data: {
                        existingDealIds: existingLinks.map(
                            (link) => link.dealId,
                        ),
                    },
                }),
            );
        }

        // Create deal linkages
        const dealLinkers = dealIds.map((dealId) => ({
            sellerId: seller._id,
            adminId: req.user._id,
            dealId: dealId,
            isActive,
        }));

        await SellerDealLinker.insertMany(dealLinkers);

        return res.status(200).json(
            successResponse({
                message: 'Deals linked to seller successfully',
                data: {
                    seller: {
                        id: seller._id,
                        email: seller.email,
                        phoneNumber: seller.phoneNumber,
                    },
                    dealIds,
                },
            }),
        );
    });

    getSellerDeals = catchAsync(async (req, res) => {
        const { sellerId, offset, limit, isActive } =
            sellerValidationSchema.getSellerDealsSchema.parse(req.query);

        // Build the query
        const query = { sellerId: new mongoose.Types.ObjectId(sellerId) };
        if (isActive !== undefined) {
            query.isActive = Boolean(+isActive);
        }

        // Get total count
        const total = await SellerDealLinker.countDocuments(query);

        // Get paginated results
        const sellerDeals = await SellerDealLinker.find(query)
            .sort({ createdAt: -1 })
            .skip(parseInt(offset))
            .limit(parseInt(limit))
            .populate('dealId', 'title description') // Populate deal details
            .populate('adminId', 'name email'); // Populate admin details

        return res.status(200).json(
            successResponse({
                message: 'Seller deals fetched successfully',
                data: {
                    deals: sellerDeals,
                    pagination: {
                        total,
                        offset: parseInt(offset),
                        limit: parseInt(limit),
                    },
                },
            }),
        );
    });

    removeSellerDeal = catchAsync(async (req, res) => {
        const { sellerDealId } =
            sellerValidationSchema.removeSellerDealSchema.parse(req.params);

        const deletedDeal =
            await SellerDealLinker.findByIdAndDelete(sellerDealId);

        if (!deletedDeal) {
            return res.status(404).json(
                errorResponse({
                    message: 'Seller deal not found',
                }),
            );
        }

        return res.status(200).json(
            successResponse({
                message: 'Seller deal removed successfully',
            }),
        );
    });

    addSellerDeal = catchAsync(async (req, res) => {
        const { sellerId, dealId, isActive } =
            sellerValidationSchema.addSellerDealSchema.parse(req.body);

        // Check if seller exists
        const seller = await Seller.findById(sellerId);
        if (!seller) {
            return res.status(404).json(
                errorResponse({
                    message: 'Seller not found',
                }),
            );
        }

        // Check if deal is already linked
        const existingDeal = await SellerDealLinker.findOne({
            sellerId: new mongoose.Types.ObjectId(sellerId),
            dealId: new mongoose.Types.ObjectId(dealId),
        });

        if (existingDeal) {
            return res.status(400).json(
                errorResponse({
                    message: 'This deal is already linked to the seller',
                }),
            );
        }

        // Create new deal linkage
        const newDealLink = await SellerDealLinker.create({
            sellerId: new mongoose.Types.ObjectId(sellerId),
            dealId: new mongoose.Types.ObjectId(dealId),
            adminId: req.user._id,
            isActive,
        });

        return res.status(200).json(
            successResponse({
                message: 'Seller deal added successfully',
                data: newDealLink,
            }),
        );
    });

    getAdminDealSellers = catchAsync(async (req, res) => {
        const { offset, limit, search, isActive } =
            sellerValidationSchema.getAdminDealSellersSchema.parse(req.body);

        // Build the pipeline
        const pipeline = [
            // Match deals linked to the admin
            {
                $match: {
                    adminId: new mongoose.Types.ObjectId(req.user._id),
                    ...(isActive !== undefined && {
                        isActive: Boolean(+isActive),
                    }),
                },
            },
            // Group by sellerId to get unique sellers
            {
                $group: {
                    _id: '$sellerId',
                    dealCount: { $sum: 1 },
                },
            },
            // Lookup seller details
            {
                $lookup: {
                    from: 'sellers',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'seller',
                },
            },
            // Unwind seller array
            {
                $unwind: '$seller',
            },
            // Add search filter if provided
            ...(search
                ? [
                      {
                          $match: {
                              $or: [
                                  {
                                      'seller.name': {
                                          $regex: search,
                                          $options: 'i',
                                      },
                                  },
                                  {
                                      'seller.email': {
                                          $regex: search,
                                          $options: 'i',
                                      },
                                  },
                                  {
                                      'seller.phoneNumber': {
                                          $regex: search,
                                          $options: 'i',
                                      },
                                  },
                              ],
                          },
                      },
                  ]
                : []),

            {
                $replaceRoot: {
                    newRoot: '$seller',
                },
            },
        ];

        // Get total count
        const totalPipeline = [...pipeline, { $count: 'totalCount' }];
        const total = await SellerDealLinker.aggregate(totalPipeline);

        // Add pagination
        pipeline.push(
            { $sort: { createdAt: -1 } },
            { $skip: parseInt(offset) },
            { $limit: parseInt(limit) },
        );

        const sellers = await SellerDealLinker.aggregate(pipeline);

        return res.status(200).json(
            successResponse({
                message: 'Sellers linked to admin deals fetched successfully',
                data: sellers,
                others: {
                    total: total[0]?.totalCount || 0,
                },
            }),
        );
    });

    getSellerOrdersByDealId = catchAsync(async (req, res) => {
        const {
            dealId,
            offset = 0,
            limit = 10,
            orderFormStatus,
            selectedPlatformFilter,
            startDate,
            endDate,
        } = req.query;

        if (!dealId) {
            return res.status(400).json(
                errorResponse({
                    message: 'Deal ID is required',
                }),
            );
        }

        // First verify if the seller has access to this deal
        const sellerDealLink = await SellerDealLinker.findOne({
            sellerId: req.user._id,
            dealId: new mongoose.Types.ObjectId(dealId),
            isActive: true,
        });

        if (!sellerDealLink) {
            return res.status(403).json(
                errorResponse({
                    message: 'You do not have access to this deal',
                }),
            );
        }

        const aggregateArr = [
            {
                $match: {
                    dealId: new mongoose.Types.ObjectId(dealId),
                    ...(startDate && {
                        orderDate: {
                            $gte: new Date(startDate),
                            $lt: new Date(new Date(endDate).setDate(new Date(endDate).getDate() + 1)),
                        },
                    }),
                    ...(orderFormStatus && { orderFormStatus }),
                },
            },
            {
                $lookup: {
                    from: 'deals',
                    localField: 'dealId',
                    foreignField: '_id',
                    as: 'dealId',
                },
            },
            { $unwind: '$dealId' },
            {
                $lookup: {
                    from: 'brands',
                    localField: 'dealId.brand',
                    foreignField: '_id',
                    as: 'dealId.brand',
                },
            },
            { $unwind: '$dealId.brand' },
            {
                $lookup: {
                    from: 'dealcategories',
                    localField: 'dealId.dealCategory',
                    foreignField: '_id',
                    as: 'dealId.dealCategory',
                },
            },
            { $unwind: '$dealId.dealCategory' },
            {
                $lookup: {
                    from: 'platforms',
                    localField: 'dealId.platForm',
                    foreignField: '_id',
                    as: 'dealId.platForm',
                },
            },
            { $unwind: '$dealId.platForm' },
            {
                $match: {
                    ...(selectedPlatformFilter?.length && {
                        'dealId.platForm._id': {
                            $in: selectedPlatformFilter?.map(
                                (i) => new mongoose.Types.ObjectId(i),
                            ) || [],
                        },
                    }),
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'userId',
                },
            },
            { $unwind: '$userId' },
            { $sort: { createdAt: -1 } },
        ];

        if (limit || offset) {
            aggregateArr.push({ $skip: parseInt(offset) });
            aggregateArr.push({ $limit: parseInt(limit) });
        }

        const orders = Order.aggregate(aggregateArr);

        if (limit || offset) {
            aggregateArr.pop();
            aggregateArr.pop();
        }

        aggregateArr.push({ $count: 'total' });

        const totalCount = Order.aggregate(aggregateArr);

        const data = await Promise.all([orders, totalCount]);

        return res.status(200).json(
            successResponse({
                message: 'Orders fetched successfully',
                data: {
                    orders: data[0],
                    pagination: {
                        total: data[1].length > 0 ? data[1][0].total : 0,
                        offset: parseInt(offset),
                        limit: parseInt(limit),
                    },
                },
            }),
        );
    });
}

export default new SellerController();
