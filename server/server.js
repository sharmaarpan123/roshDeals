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
import { fileURLToPath } from 'url';

config();

const init = async () => {
    const PORT = process.env.PORT;
    const app = express();
    const server = http.createServer(app);
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    app.use(cors());
    app.use(logger('dev'));
    app.use(express.json());
    app.use(express.urlencoded({ extended: false, limit: '4mb' }));
    app.use(express.static(path.join('server/public')));
    app.use('/.well-known', express.static(path.join(process.cwd(), 'public', '.well-known')));

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
