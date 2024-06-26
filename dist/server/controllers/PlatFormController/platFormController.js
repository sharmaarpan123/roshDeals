"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const PlatForm_1 = __importDefault(require("@/database/models/PlatForm"));
const schema_1 = require("./schema");
const catchAsync_1 = __importDefault(require("@/utilities/catchAsync"));
const Responses_1 = require("@/utilities/Responses");
const getAllPlatFormController = (0, catchAsync_1.default)(async (req, res) => {
    const AllPlatForms = await PlatForm_1.default.find({ isDeleted: false });
    return res.status(200).json((0, Responses_1.successResponse)({
        message: 'All PlatForms',
        data: AllPlatForms,
    }));
});
const addPlatFormController = (0, catchAsync_1.default)(async (req, res) => {
    const body = schema_1.addPlatFormSchema.parse(req.body);
    const { name, image } = body;
    const alreadyExists = await PlatForm_1.default.findOne({
        name: { $regex: new RegExp(name, 'i') },
    }).lean();
    if (alreadyExists) {
        return res.status(400).json((0, Responses_1.errorResponse)({
            message: 'This platform already exists',
        }));
    }
    const newPlatForm = await PlatForm_1.default.create({
        name,
        image,
    });
    const platForm = await newPlatForm.save();
    return res.status(200).json((0, Responses_1.successResponse)({
        message: 'Plat Form Added successfully',
        data: platForm,
    }));
});
const editPlatFormController = (0, catchAsync_1.default)(async (req, res) => {
    const body = schema_1.editPlatFormSchema.parse(req.body);
    const { name, platFormId, image } = body;
    if (name) {
        const alreadyExists = await PlatForm_1.default.findOne({
            name: { $regex: new RegExp(name, 'i') },
        }).lean();
        if (alreadyExists && alreadyExists._id.toString() !== platFormId) {
            return res.status(400).json((0, Responses_1.errorResponse)({
                message: 'This platform already exists',
            }));
        }
    }
    const UpdatedPlatForm = await PlatForm_1.default.findByIdAndUpdate({ _id: platFormId }, { name, image }, { new: true });
    if (UpdatedPlatForm) {
        return res.status(200).json((0, Responses_1.successResponse)({
            message: 'platForm updated successfully',
            data: UpdatedPlatForm,
        }));
    }
    else {
        return res.status(404).json((0, Responses_1.errorResponse)({
            message: 'Not found any Data with this PlatForm id',
        }));
    }
});
const deletePlatFormController = (0, catchAsync_1.default)(async (req, res) => {
    const body = schema_1.editPlatFormSchema.parse(req.body);
    const { platFormId } = body;
    const UpdatedPlatForm = await PlatForm_1.default.findByIdAndUpdate({ _id: platFormId }, {
        isDeleted: true,
    }, { new: true });
    if (UpdatedPlatForm) {
        return res.status(200).json((0, Responses_1.successResponse)({
            message: 'platForm deleted successfully',
            data: UpdatedPlatForm,
        }));
    }
    else {
        return res.status(404).json((0, Responses_1.errorResponse)({
            statusCode: 404,
            message: 'Not found any Data with this PlatForm id',
        }));
    }
});
module.exports = {
    addPlatFormController,
    editPlatFormController,
    deletePlatFormController,
    getAllPlatFormController,
};
//# sourceMappingURL=platFormController.js.map