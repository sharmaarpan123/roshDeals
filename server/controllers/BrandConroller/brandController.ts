import { Request, Response } from 'express';
import { addSchema, deleteSchema, editSchema } from './schema';
import catchAsync from '@/utilities/catchAsync';
import { errorResponse, successResponse } from '@/utilities/Responses';
import Brand from '@/database/models/Brand';
import { filterSchema } from '@/utilities/ValidationSchema';
import Deal from '@/database/models/Deal';

const geBrandByIdController = catchAsync(
    async (req: Request, res: Response): Promise<Response> => {
        const { brandId } = deleteSchema.parse(req.params);

        const brandDetails = await Brand.findOne({
            _id: brandId,
        });

        return res.status(200).json(
            successResponse({
                message: 'All Brands',
                data: brandDetails,
            }),
        );
    },
);

const getAllBrandController = catchAsync(
    async (req: Request, res: Response): Promise<Response> => {
        const { offset, limit, search } = filterSchema.parse(req.body);

        const AllDAta = Brand.find({
            ...(search && { name: { $regex: search, $options: 'i' } }),
        })
            .skip(offset || 0)
            .limit(limit || 20);

        const total = Brand.find({
            ...(search && { name: { $regex: search, $options: 'i' } }),
        }).countDocuments();

        const data = await Promise.all([AllDAta, total]);

        return res.status(200).json(
            successResponse({
                message: 'All Brands',
                data: data[0],
                total: data[1],
            }),
        );
    },
);

const addBrandController = catchAsync(
    async (req: Request, res: Response): Promise<Response> => {
        const body = addSchema.parse(req.body);

        const { name, image } = body;

        const alreadyExists = await Brand.findOne({
            name: { $regex: new RegExp(name, 'i') },
        }).lean();

        if (alreadyExists) {
            return res.status(400).json(
                errorResponse({
                    message: 'This Brand already exists',
                }),
            );
        }

        const newBrand = await Brand.create({
            name,
            image,
        });

        const DealCategoryRes = await newBrand.save();

        return res.status(200).json(
            successResponse({
                message: 'Brand Added successfully',
                data: DealCategoryRes,
            }),
        );
    },
);

const editBrandController = catchAsync(
    async (req: Request, res: Response): Promise<Response> => {
        const body = editSchema.parse(req.body);

        const { name, brandId, image } = body;

        if (name) {
            // checking unique name
            const alreadyExists = await Brand.findOne({
                name: { $regex: new RegExp(name, 'i') },
            }).lean();

            if (alreadyExists && alreadyExists._id.toString() !== brandId) {
                return res.status(400).json(
                    errorResponse({
                        message: 'This Brand already exists',
                    }),
                );
            }
        }

        const UpdatedBrand = await Brand.findByIdAndUpdate(
            { _id: brandId },
            { name, image },
            { new: true },
        );

        if (UpdatedBrand) {
            return res.status(200).json(
                successResponse({
                    message: 'updated successfully',
                    data: UpdatedBrand,
                }),
            );
        } else {
            return res.status(404).json(
                errorResponse({
                    message: 'Not found any Data with this Brand id',
                }),
            );
        }
    },
);

const deleteBrandController = catchAsync(
    async (req: Request, res: Response): Promise<Response> => {
        const body = deleteSchema.parse(req.body);

        const { brandId } = body;

        const deletedData = await Brand.findByIdAndUpdate(
            { _id: brandId },
            {
                isDeleted: true,
            },
            { new: true },
        );

        if (deletedData) {
            return res.status(200).json(
                successResponse({
                    message: 'deleted successfully',
                    data: deletedData,
                }),
            );
        } else {
            return res.status(404).json(
                errorResponse({
                    statusCode: 404,
                    message: 'Not found any Data with this  Brand id',
                }),
            );
        }
    },
);

const getActiveBrandController = catchAsync(
    async (req: Request, res: Response): Promise<Response> => {
        const { offset, limit, search } = filterSchema.parse(req.body);

        const brandData = await Deal.aggregate([
            {
                $match: {
                    isDeleted: false,
                    isActive: true,
                    isSlotCompleted: false,
                },
            },
            {
                $lookup: {
                    from: 'brands', // Collection name in your database
                    localField: 'brand',
                    foreignField: '_id',
                    as: 'brandData',
                },
            },
            {
                $match: {
                    'brandData.name': { $regex: search || '', $options: 'i' },
                },
            },
            {
                $unwind: '$brandData',
            },
            {
                $group: {
                    _id: '$brandData._id', // Group by the unique identifier of the brand document
                    brandData: { $first: '$brandData' }, // Keep the first document in each group
                },
            },
            {
                $replaceRoot: {
                    newRoot: '$brandData',
                },
            },
            {
                $skip: offset || 0,
            },
            {
                $limit: limit || 10,
            },
        ]);

        return res.status(200).json(
            successResponse({
                message: 'All active Brands',
                data: brandData,
            }),
        );
    },
);

export = {
    addBrandController,
    editBrandController,
    deleteBrandController,
    getAllBrandController,
    getActiveBrandController,
    geBrandByIdController,
};
