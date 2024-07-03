"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const brandController_1 = __importDefault(require("@/controllers/BrandConroller/brandController"));
const express_1 = __importDefault(require("express"));
const BrandRouter = express_1.default.Router();
BrandRouter.post('/getAllBrands', brandController_1.default.getAllBrandController);
BrandRouter.post('/getActiveBrands', brandController_1.default.getActiveBrandController);
exports.default = BrandRouter;
//# sourceMappingURL=BrandRouter.js.map