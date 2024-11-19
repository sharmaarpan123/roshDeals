import AdminModule from '../../../database/models/AdminModule.js';
import catchAsync from '../../../utilities/catchAsync.js';
import { successResponse } from '../../../utilities/Responses.js';
import { filterSchema } from '../../../utilities/ValidationSchema.js';
import AdminModuleValidationSchema from './schema.js';

class AdminModuleController {
    getAdminModulesListWithFilter = catchAsync(async (req, res) => {
        const { offset, limit, search } = filterSchema.parse(req.query);

        let AllDAta = AdminModule.find({
            ...(search && { name: { $regex: search, $options: 'i' } }),
        }).sort({ createdAt: -1 });

        if (typeof offset !== 'undefined') {
            AllDAta = AllDAta.skip(offset);
        }

        if (typeof limit !== 'undefined') {
            AllDAta = AllDAta.limit(limit);
        }

        const total = AdminModule.find({
            ...(search && { name: { $regex: search, $options: 'i' } }),
        }).countDocuments();
        const data = await Promise.all([AllDAta, total]);
        return res.status(200).json(
            successResponse({
                message: 'All Modules',
                data: data[0],
                total: data[1],
            }),
        );
    });

    getAdminModuleById = catchAsync(async (req, res) => {
        const { moduleId } = AdminModuleValidationSchema.getByIdSchema.parse(
            req.params,
        );

        const data = await AdminModule.findOne({
            _id: moduleId,
        });

        return res.status(200).json(
            successResponse({
                message: 'Module get successfully',
                data: data,
            }),
        );
    });

    AddAdminModuleController = catchAsync(async (req, res) => {
        const { name, uniqueSlug } =
            AdminModuleValidationSchema.addAdminModuleSchema.parse(req.body);

        const newModule = await AdminModule.create({ name, uniqueSlug });

        const data = await newModule.save();

        return res.status(200).json(
            successResponse({
                data,
                message: 'successfully created module',
            }),
        );
    });
    updateAdminModuleController = catchAsync(async (req, res) => {
        const { moduleId, ...restBody } =
            AdminModuleValidationSchema.updateAdminModuleSchema.parse(req.body);

        const updatedData = await AdminModule.findOneAndUpdate(
            { _id: moduleId },
            { ...restBody },
            {
                new: true,
            },
        );

        return res.status(200).json(
            successResponse({
                data: updatedData,
                message: 'updated module',
            }),
        );
    });
}

export default new AdminModuleController();
