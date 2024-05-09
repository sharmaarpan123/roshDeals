import { Request, Response } from 'express';
import { addSchema, deleteSchema, editSchema } from './schema';
import catchAsync from '@/utilities/catchAsync';
import { errorResponse, successResponse } from '@/utilities/Responses';
import Brand from '@/models/Brand';

const getAllBrandController = catchAsync(
    async (req: Request, res: Response): Promise<Response> => {
        const AllDAta = await Brand.find({ isDeleted: false });
        return res.status(200).json(
            successResponse({
                message: 'All Brands',
                data: AllDAta,
            }),
        );
    },
);

const addBrandController = catchAsync(
    async (req: Request, res: Response): Promise<Response> => {
        const body = addSchema.parse(req.body);

        const { name } = body;

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
export = {
    addBrandController,
    editBrandController,
    deleteBrandController,
    getAllBrandController,
};
