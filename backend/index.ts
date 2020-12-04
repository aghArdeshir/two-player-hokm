import { createServer as createHttpServer } from "http";
import { Server as SocketServer } from "socket.io";

const http = createHttpServer();
http.on("listening", () => {
  console.log("backend listening on port 3000");
});

const players = [];

const socketServer = new SocketServer();
socketServer.attach(http);
socketServer.on("connect", (connection) => {
  console.log("a user connected");

  connection.on("register", (data: { username: string }) => {
    players.push(data.username);
  });
});

http.listen(3000);
