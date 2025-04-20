import { Server } from "socket.io";
import express from "express";
import http from "http";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// Store online users with their socket IDs
const userSocketMap = {};

io.on("connection", (socket) => {
  console.log("A user connected: " + socket.id);
  const userId = socket.handshake.query.userId;
  
  if (userId) {
    // Store the socket ID for this user
    if (!userSocketMap[userId]) {
      userSocketMap[userId] = [];
    }
    userSocketMap[userId].push(socket.id);
    
    // Emit updated online users list
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  }

  socket.on("disconnect", () => {
    console.log("A user disconnected: " + socket.id);
    if (userId) {
      // Remove this socket ID from the user's list
      userSocketMap[userId] = userSocketMap[userId].filter(id => id !== socket.id);
      
      // If no more sockets for this user, remove them from the map
      if (userSocketMap[userId].length === 0) {
        delete userSocketMap[userId];
      }
      
      // Emit updated online users list
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    }
  });
});

export { io, server, app };
