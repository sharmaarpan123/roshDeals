import Deal from '@/database/models/Deal';
import { errorResponse, successResponse } from '@/utilities/Responses';
import catchAsync from '@/utilities/catchAsync';
import { Request, Response } from 'express';
import { addDealSchema, editDealSchema, getDeal } from './schema';
import { validatingMongoObjectIds } from '@/utilities/validations';
import { filterSchema } from '@/utilities/ValidationSchema';

export const addDealController = catchAsync(
    async (req: Request, res: Response): Promise<Response> => {
        const body = addDealSchema.parse(req.body);

        const {
            actualPrice,
            brand,
            cashBack,
            dealCategory,
            platForm,
            postUrl,
            productCategories,
            productName,
            slotAlloted,
            isActive,
        } = body;

        const newDeal = await Deal.create({
            actualPrice,
            brand,
            cashBack,
            dealCategory,
            platForm,
            postUrl,
            productCategories,
            productName,
            slotAlloted,
            isActive: isActive === false ? false : true, // we want by default  active true  so if
            //on add time isActive is  false it will false other wise it will be all time true
            // we can edit on edit api
        });

        const DealRes = await newDeal.save();

        return res.status(200).json(
            successResponse({
                message: 'Deal  Added successfully',
                data: DealRes,
            }),
        );
    },
);

export const editDealController = catchAsync(
    async (req: Request, res: Response): Promise<Response> => {
        const body = editDealSchema.parse(req.body);

        const {
            dealId,
            actualPrice,
            brand,
            cashBack,
            dealCategory,
            platForm,
            postUrl,
            productCategories,
            productName,
            slotAlloted,
            isActive,
        } = body;

        // validating the brandId ,  dealCategoryId ,  platFormId ,  that they are existing on our db
        const inValidMongoIdMessage = await validatingMongoObjectIds({
            brand,
            dealCategory,
            platForm,
        });

        if (inValidMongoIdMessage) {
            return res.status(400).json(
                errorResponse({
                    message: inValidMongoIdMessage,
                }),
            );
        }

        const dealUpdated = await Deal.findOneAndUpdate(
            {
                _id: dealId,
            },
            {
                actualPrice,
                brand,
                cashBack,
                dealCategory,
                platForm,
                postUrl,
                productCategories,
                productName,
                slotAlloted,
                ...(isActive && { isActive }),
            },
            {
                new: true,
            },
        );

        if (dealUpdated) {
            return res.status(200).json(
                successResponse({
                    message: 'updated successfully',
                    data: dealUpdated,
                }),
            );
        } else {
            return res.status(404).json(
                errorResponse({
                    message: 'Not found any Data with this deal id',
                }),
            );
        }
    },
);

export const dealDetails = catchAsync(
    async (req: Request, res: Response): Promise<Response> => {
        const body = getDeal.parse(req.params);
        const { dealId } = body;

        const DealRes = await Deal.findOne({ _id: dealId });

        if (!DealRes) {
            return res.status(400).json(
                errorResponse({
                    message: 'No Data Found',
                }),
            );
        }

        return res.status(200).json(
            successResponse({
                message: 'Deal Fetched',
                data: DealRes,
            }),
        );
    },
);

export const activeDealsController = catchAsync(
    async (req: Request, res: Response) => {
        const { limit, offset, search } = filterSchema.parse(req.body);

        const activelyDeals = Deal.find({
            isDeleted: false,
            isActive: true,
            isSlotCompleted: false,
            ...(search && { productName: { $regex: search, $options: 'i' } }),
        })
            .populate('brand')
            .populate('dealCategory')
            .populate('platForm')
            .sort({ createdAt: -1 })
            .skip(offset || 0)
            .limit(limit || 20);

        const total = Deal.find({
            isDeleted: false,
            isActive: true,
            isSlotCompleted: false,
            ...(search && { productName: { $regex: search, $options: 'i' } }),
        }).countDocuments();

        const data = await Promise.all([activelyDeals, total]);

        if (activelyDeals) {
            return res.status(200).json(
                successResponse({
                    message: 'Deals Fetched',
                    data: data[0],
                    total: data[1],
                }),
            );
        }
    },
);
