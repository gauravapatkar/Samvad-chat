import dns from "node:dns/promises";
dns.setServers(["8.8.8.8", "1.1.1.1"]);
import express from "express";
import "dotenv/config.js";
// import dotenv from "dotenv";
// dotenv.config();
import cors from "cors";
import http from "http";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import { Server } from "socket.io";

// Created express app and http server

const app = express();
const server = http.createServer(app);

//initialize socket.io server
export const io = new Server(server, {
  cors: { origin: "*" },
});
//store online users
export const userSocketMap = {}; //{userId: socketId}

//socket.oi connection handler
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log("User Connected", userId);

  if (userId) userSocketMap[userId] = socket.id;

  //emit online users to all connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("User Disconnected", userId);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

//Middleware setup
app.use(express.json({ limit: "4mb" }));
app.use(cors());

//Route setup
app.use("/api/status", (req, res) => res.send("Server is live"));
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRoutes);

//Connect to MONgodb

await connectDB();

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log("Server is running on PORT: " + PORT));
