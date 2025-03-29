import cors from "cors";
import { config } from "dotenv";
import express from "express";
import http from "http";
import https from "https"; // Import HTTPS module
import fs from "fs"; // Import File System module
import logger from "morgan";
import path from "path";
import { Server as SocketServer } from "socket.io";
import InitSocket from "../socket/InitSocket.js";
import mongoInit from "./database/index.js";
import "./init-aliases.js";
import Routes from "./Routes.js";
import getInitialCacheValues from "./utilities/getInitialCacheValues.js";
import { fileURLToPath } from "url";

config();

const init = async () => {
    // 1. Use more descriptive environment variables
    const HTTPS_PORT = process.env.PORT || 3000;
    const HTTP_PORT =  8080; 

    const app = express();
    const __dirname = path.dirname(fileURLToPath(import.meta.url));

    // 2. Add error handling for SSL file reading
    let sslOptions;
    try {
        sslOptions = {
            key: fs.readFileSync("/home/ubuntu/ssl/cloudflare.key"),
            cert: fs.readFileSync("/home/ubuntu/ssl/cloudflare.pem"),
        };
    } catch (error) {
        console.error("Failed to load SSL certificates:", error);
        process.exit(1);
    }

    // 3. Add error handling for server creation
    const startHttpsServer = () => {
        return new Promise((resolve, reject) => {
            const httpsServer = https.createServer(sslOptions, app);
            
            httpsServer.on('error', (error) => {
                if (error.code === 'EADDRINUSE') {
                    console.error(`Port ${HTTPS_PORT} is already in use. Please stop other instances first.`);
                    process.exit(1);
                }
                reject(error);
            });

            httpsServer.listen(HTTPS_PORT, () => {
                console.log(`🚀 HTTPS Server running on port ${HTTPS_PORT}`);
                resolve(httpsServer);
            });
        });
    };

    // Add error handling for HTTP server
    const startHttpServer = () => {
        return new Promise((resolve, reject) => {
            const httpServer = http.createServer((req, res) => {
                res.writeHead(301, { Location: `https://${req.headers.host}${req.url}` });
                res.end();
            });

            httpServer.on('error', (error) => {
                if (error.code === 'EADDRINUSE') {
                    console.error(`Port ${HTTP_PORT} is already in use. Please stop other instances first.`);
                    process.exit(1);
                }
                reject(error);
            });

            httpServer.listen(HTTP_PORT, () => {
                console.log(`🔄 Redirecting HTTP to HTTPS on port ${HTTP_PORT}`);
                resolve(httpServer);
            });
        });
    };

    app.use(cors());
    app.use(logger("dev"));
    app.use(express.json());
    app.use(express.urlencoded({ extended: false, limit: "4mb" }));
    app.use("/.well-known", express.static(path.join(process.cwd(), "server/public", ".well-known")));
    app.use("/images", express.static(path.join(process.cwd(), "server/public", "images")));
    app.get("/", (req, res) => {
        res.sendFile(path.join(process.cwd(), "server/public", "deep-link.html"));
    });
    app.get("/buyr.apk", (req, res) => {
        res.sendFile(path.join(process.cwd(), "server/public", "buyr.apk"));
    });

    // 4. Add proper error handling for MongoDB connection
    try {
        await mongoInit();
        getInitialCacheValues();
        const httpsServer = await startHttpsServer();
        await startHttpServer();
        
        // Initialize Socket.IO after servers are started
        const io = new SocketServer(httpsServer);
        InitSocket(io);
    } catch (error) {
        console.error('Server initialization failed:', error);
        process.exit(1);
    }
};

// 5. Add global error handling
process.on('unhandledRejection', (error) => {
    console.error('Unhandled Rejection:', error);
});

init().catch(error => {
    console.error('Failed to initialize server:', error);
    process.exit(1);
});
