import { createServer as createHttpServer } from "http";
import { Server as SocketServer, Socket } from "socket.io";

const http = createHttpServer();
http.on("listening", () => {
  console.log("backend listening on port 3000");
});

const players = [];

const socketServer = new SocketServer();
socketServer.attach(http);
socketServer.on("connect", (connection: Socket) => {
  console.log("a user connected");

  connection.on("register", (data: { username: string }) => {
    if (players.length === 2) {
      connection.emit("error", { error: "room is full (2 players are joined" });
      connection.disconnect(true);
    }

    players.push(data.username);

    if (players.length === 2) {
      socketServer.emit("game-started");
    }
  });
});

http.listen(3000);
