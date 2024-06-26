"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commonTypes_1 = require("@/utilities/commonTypes");
const mongoose_1 = __importDefault(require("mongoose"));
const PosterSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    title: { type: String, required: true },
    image: { type: String },
    posterType: {
        type: String,
        enum: commonTypes_1.POSTER_ENUM,
        required: true,
    },
    brand: { type: mongoose_1.default.Types.ObjectId, ref: 'Brand' },
    dealCategory: { type: mongoose_1.default.Types.ObjectId, ref: 'DealCategory' },
    deal: { type: mongoose_1.default.Types.ObjectId, ref: 'Deal' },
    redirectUrl: { type: String },
    isDeleted: { type: Boolean, default: false },
    isActive: { type: Boolean, default: false },
}, {
    timestamps: true,
});
exports.default = mongoose_1.default.model('Poster', PosterSchema);
//# sourceMappingURL=Poster.js.map