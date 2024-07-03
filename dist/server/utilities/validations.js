"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatingMongoObjectIds = void 0;
const Brand_1 = __importDefault(require("@/database/models/Brand"));
const PlatForm_1 = __importDefault(require("@/database/models/PlatForm"));
const DealCategory_1 = __importDefault(require("@/database/models/DealCategory"));
const Deal_1 = __importDefault(require("@/database/models/Deal"));
const User_1 = __importDefault(require("@/database/models/User"));
const validatingMongoObjectIds = async ({ brand, dealCategory, platForm, deal, user, }) => {
    const validatingIdsArr = [];
    if (brand) {
        validatingIdsArr.push({
            collection: 'Brand',
            query: Brand_1.default.findOne({ _id: brand }),
        });
    }
    if (user) {
        validatingIdsArr.push({
            collection: 'User',
            query: User_1.default.findOne({ _id: brand }),
        });
    }
    if (dealCategory) {
        validatingIdsArr.push({
            collection: 'DealCategory',
            query: DealCategory_1.default.findOne({ _id: dealCategory }),
        });
    }
    if (platForm) {
        validatingIdsArr.push({
            collection: 'PlatForm',
            query: PlatForm_1.default.findOne({ _id: platForm }),
        });
    }
    if (deal) {
        validatingIdsArr.push({
            collection: 'Deal',
            query: Deal_1.default.findOne({ _id: deal }),
        });
    }
    const validatingIdsArrRes = await Promise.all(validatingIdsArr.map((item) => item.query));
    if (validatingIdsArrRes.includes(null)) {
        const ind = validatingIdsArrRes.findIndex((i) => !i);
        return `${validatingIdsArr[ind].collection} id is not valid`;
    }
    else {
        return false;
    }
};
exports.validatingMongoObjectIds = validatingMongoObjectIds;
//# sourceMappingURL=validations.js.map