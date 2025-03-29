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
  const PORT = process.env.PORT || 8000;
  const HTTP_PORT = 80;
  const HTTPS_PORT = 443;

  const app = express();
  const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

  await mongoInit();
  getInitialCacheValues();
  Routes(app); // Initialize routes

  // Load Cloudflare SSL Certificate & Key
  const sslOptions = {
    key: fs.readFileSync("/home/ubuntu/ssl/cloudflare.key"), // Updated key path
    cert: fs.readFileSync("/home/ubuntu/ssl/cloudflare.pem"), // Updated cert path
  };

  // Start HTTPS Server
  const httpsServer = https.createServer(sslOptions, app);
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

init();
