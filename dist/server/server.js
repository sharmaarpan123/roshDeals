"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-unused-vars */
require("./init-aliases");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const AuthRouter_1 = __importDefault(require("./routes/AuthRouter"));
const morgan_1 = __importDefault(require("morgan"));
const path_1 = __importDefault(require("path"));
const database_1 = __importDefault(require("./database"));
const catchErrorHandler_1 = __importDefault(require("./utilities/catchErrorHandler"));
const AdminRouter_1 = __importDefault(require("./routes/AdminRouter"));
const commonTypes_1 = require("./utilities/commonTypes");
const AuthMiddleware_1 = __importDefault(require("./utilities/AuthMiddleware"));
const DealRouter_1 = __importDefault(require("./routes/DealRouter"));
const DealCategoryRouter_1 = __importDefault(require("./routes/DealCategoryRouter"));
const PlatFromRouter_1 = __importDefault(require("./routes/PlatFromRouter"));
const BrandRouter_1 = __importDefault(require("./routes/BrandRouter"));
const GetHomeResult_1 = __importDefault(require("./controllers/GetHomeResult"));
const activeDealByBrandAndCategory_1 = __importDefault(require("./controllers/getDeals/activeDealByBrandAndCategory"));
const UserRouter_1 = __importDefault(require("./routes/UserRouter"));
const OrderRouter_1 = __importDefault(require("./routes/OrderRouter"));
const fileUpload_1 = __importDefault(require("./controllers/fileUpload"));
const multer_1 = require("./utilities/multer");
const init = async () => {
    const PORT = process.env.PORT;
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)());
    app.use((0, morgan_1.default)('dev'));
    app.use(express_1.default.json());
    app.use(express_1.default.urlencoded({ extended: false }));
    app.use(express_1.default.static(path_1.default.join('public')));
    await (0, database_1.default)();
    app.get('/health', (req, res) => res.json({
        message: 'I m fine',
    }));
    app.use('/auth', AuthRouter_1.default);
    app.use('/admin', (0, AuthMiddleware_1.default)([commonTypes_1.ROLE_TYPE_ENUM.ADMIN]), AdminRouter_1.default);
    app.use('/deal', DealRouter_1.default);
    app.use('/dealCategory', DealCategoryRouter_1.default);
    app.use('/platForm', PlatFromRouter_1.default);
    app.use('/brand', BrandRouter_1.default);
    app.get('/getHomeData', GetHomeResult_1.default);
    app.post('/getDealsByIds', activeDealByBrandAndCategory_1.default);
    app.use('/user', (0, AuthMiddleware_1.default)([commonTypes_1.ROLE_TYPE_ENUM.USER]), UserRouter_1.default);
    app.use('/order', (0, AuthMiddleware_1.default)([commonTypes_1.ROLE_TYPE_ENUM.USER]), OrderRouter_1.default);
    app.use('/fileUpload', (0, AuthMiddleware_1.default)(Object.values(commonTypes_1.ROLE_TYPE_ENUM).map((i) => i)), multer_1.upload.single('file'), fileUpload_1.default);
    app.use(catchErrorHandler_1.default);
    app.listen(PORT || 8000, () => {
        console.log(`server start on the ${PORT}`);
    });
};
init();
//# sourceMappingURL=server.js.map