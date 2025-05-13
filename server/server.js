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
        res.redirect('https://www.buyrapp.in');
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

    // Add specific API route handler
    app.get('/api', (req, res) => {
        const productId = req.query.product_id;
        if (productId) {
            res.redirect(`https://www.buyrapp.in/deal/${productId}`);
        } else {
            res.redirect('https://www.buyrapp.in');
        }
    });

    await mongoInit();
    getInitialCacheValues();

    Routes(app); // routes

    server.listen(PORT || 8000, () => {
        console.log(`server start on the ${PORT || 8000}`);
    });

    const io = new SocketServer(server);
    InitSocket(io);
};
init();

//# sourceMappingURL=server.js.map
