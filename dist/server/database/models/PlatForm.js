"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const platFormSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true, unique: true },
    image: { type: String },
    isDeleted: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});
exports.default = mongoose_1.default.model('PlatForm', platFormSchema);
//# sourceMappingURL=PlatForm.js.map