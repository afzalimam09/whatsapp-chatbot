import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server } from "socket.io";
import "dotenv/config";

import authRoute from "./routes/authRoute.js";
import chatSessionRoute from "./routes/chatSessionRoute.js";
import messageRoute from "./routes/messageRoute.js";
import webhookRoute from "./routes/webhookRoute.js";
import meRoute from "./routes/meRoute.js";
import { chatSocket } from "./socket/chatSocket.js";

const app = express();

app.use(cors({ credentials: true, origin: process.env.FRONTEND_URL }));
app.options("*", cors({ credentials: true }));

app.use(express.json({ limit: "10kb" }));
app.use(
    express.urlencoded({
        extended: true,
        limit: "10kb",
    })
);
app.use(cookieParser());

app.get("/", (req, res, next) => {
    res.send("Hello from server");
});

app.use("/meta_wa_callbackurl", webhookRoute);
app.use("/auth", authRoute);
app.use("/chat", chatSessionRoute);
app.use("/message", messageRoute);
app.use("/me", meRoute);
app.use("*", (req, res) => res.status(404).send("Not found"));

const DB_URL = process.env.MONGODB_URI;
mongoose.connection.on("connected", () => console.log("Databse connected"));
mongoose.connection.on("disconnected", () =>
    console.log("Databse disconnected")
);
mongoose.connection.on("reconnected", () => console.log("Databse reconnected"));
mongoose.connect(DB_URL);

const server = createServer(app);
export const io = new Server(server, {
    serveClient: false,
    cors: {
        origin: "*",
    },
});

chatSocket();

const PORT = 9000;
server.listen(PORT, () => {
    console.log(`Server started on PORT: ${PORT}`);
});
