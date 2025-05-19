import cors from 'cors';
import { config } from 'dotenv';
import express from 'express';
import http from 'http';
import logger from 'morgan';
import path from 'path';
import { Server as SocketServer } from 'socket.io';
import InitSocket from '../socket/InitSocket.js';
import mongoInit from './database/index.js';
import './init-aliases.js';
import Routes from './Routes.js';
import getInitialCacheValues from './utilities/getInitialCacheValues.js';
import Order from './database/models/Order.js';

config();

const init = async () => {
    const PORT = process.env.PORT;
    const app = express();
    const server = http.createServer(app);
    app.use(cors());
    app.use(logger('dev'));
    app.use(express.json());
    app.use(express.urlencoded({ extended: false, limit: '4mb' }));
    app.use(
        '/.well-known',
        express.static(
            path.join(process.cwd(), 'server/public', '.well-known'),
        ),
    );
    app.use(
        '/images',
        express.static(path.join(process.cwd(), 'server/public', 'images')),
    );
    app.get('/', (req, res) => {
        const productId = req.query.product_id;
        if (productId) {
            res.redirect(`https://www.buyrapp.in/deal/${productId}`);
        } else {
            res.redirect('https://www.buyrapp.in');
        }
    });
    // Add new tutorials route
    app.get('/tutorials', (req, res) => {
        res.sendFile(
            path.join(process.cwd(), 'server/public', 'tutorials.html'),
        );
    });
    app.get('/buyr.apk', (req, res) => {
        res.sendFile(path.join(process.cwd(), 'server/public', 'buyr.apk'));
    });

    await mongoInit();
    getInitialCacheValues();

    // const orders = await Order.find({
    //     orderPrice: { $exists: false },
    // }).populate({
    //     path: 'dealId',
    //     populate: {
    //         path: 'parentDealId',
    //     },
    // });

    // const updatedOrders = orders.map((itm) => {
    //     return {
    //         _id: itm?.dealId?._id,
    //         orderPrice:
    //             itm?.dealId?.parentDealId?.actualPrice ||
    //             itm?.dealId?.actualPrice,
    //         ...(!itm?.dealId?.isCommissionDeal && {
    //             lessAmount: itm?.dealId?.lessAmount,
    //         }),
    //         ...(itm?.dealId?.isCommissionDeal && {
    //             commissionValue: itm?.dealId?.commissionValue,
    //         }),
    //         isCommissionDeal: itm?.dealId?.isCommissionDeal,
    //     };
    // });

    // console.log(updatedOrders ,  updatedOrders.length , "uadf=======")

    // const newUpdates = updatedOrders.map(async (item) => {
    //     return Order.findOneAndUpdate(
    //         { dealId: item?._id },
    //         {
    //             $set: {
    //                 orderPrice: item?.orderPrice,
    //                 lessAmount: item?.lessAmount,
    //                 commissionValue: item?.commissionValue,
    //                 isCommissionDeal: item?.isCommissionDeal,
    //             },
    //         },
    //     );
    // });

    // const result = await Promise.all(newUpdates);

    // console.log(result, result?.length, 'orders---------------');

    Routes(app); // routes

    server.listen(PORT || 8000, () => {
        console.log(`server start on the ${PORT || 8000}`);
    });

    const io = new SocketServer(server);
    InitSocket(io);
};
init();

//# sourceMappingURL=server.js.map
