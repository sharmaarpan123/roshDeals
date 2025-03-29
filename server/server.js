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
    const HTTPS_PORT = process.env.HTTPS_PORT || 3000;
    const HTTP_PORT = process.env.HTTP_PORT || 8080; 

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
    const httpsServer = https.createServer(sslOptions, app);
    httpsServer.on('error', (error) => {
        console.error('HTTPS Server error:', error);
    });

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
    } catch (error) {
        console.error('Failed to initialize MongoDB or cache:', error);
        process.exit(1);
    }

    Routes(app); // Initialize routes

    // Start HTTPS Server
    httpsServer.listen(HTTPS_PORT, () => {
        console.log(`🚀 HTTPS Server running on port ${HTTPS_PORT}`);
    });

    // Start HTTP Server and Redirect to HTTPS
    http.createServer((req, res) => {
        res.writeHead(301, { Location: `https://${req.headers.host}${req.url}` });
        res.end();
    }).listen(HTTP_PORT, () => {
        console.log(`🔄 Redirecting HTTP to HTTPS on port ${HTTP_PORT}`);
    });

    // Initialize Socket.IO on HTTPS server
    const io = new SocketServer(httpsServer);
    InitSocket(io);
};

// 5. Add global error handling
process.on('unhandledRejection', (error) => {
    console.error('Unhandled Rejection:', error);
});

init().catch(error => {
    console.error('Failed to initialize server:', error);
    process.exit(1);
});
