import { createServer as createHttpServer } from "http";
import { Server as SocketServer, Socket } from "socket.io";
import { GAME_EVENTS, GAME_PORT } from "../common.typings";

const http = createHttpServer();
http.on("listening", () => {
  console.log(`backend listening on port ${GAME_PORT}`);
});

const players = [];

const socketServer = new SocketServer();
socketServer.attach(http);
socketServer.on(GAME_EVENTS.CONNECT, (connection: Socket) => {
  console.log("a user connected");

  connection.on(GAME_EVENTS.REGISTER, (data: { username: string }) => {
    if (players.length === 2) {
      connection.emit(GAME_EVENTS.ERROR, {
        error: "room is full (2 players are joined",
      });
      connection.disconnect(true);
    }

    players.push(data.username);

    if (players.length === 2) {
      socketServer.emit(GAME_EVENTS.GAME_STARTED);
    }
  });
});

http.listen(GAME_PORT);
