import { createServer as createHttpServer } from "http";
import { Server as SocketServer, Socket } from "socket.io";
import { GAME_EVENTS, GAME_PORT } from "../common.typings";
import { Game } from "./Game";

const http = createHttpServer();
http.on("listening", () => {
  console.log(`backend listening on port ${GAME_PORT}`);
});

const players: string[] = [];
let game: Game;

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

      game = new Game(players[0], players[1]);

      socketServer.emit(GAME_EVENTS.GAME_STATE, game.reportGameState());
    }
  });
});

http.listen(GAME_PORT);
