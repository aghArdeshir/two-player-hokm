import { createServer as createHttpServer } from "http";
import { Server as SocketServer, Socket } from "socket.io";
import { CARD_FORMAT, GAME_EVENTS, GAME_PORT } from "../common.typings";
import { Game, Player } from "./Game";

const http = createHttpServer();
http.on("listening", () => {
  console.log(`backend listening on port ${GAME_PORT}`);
});

const players: Player[] = [];
let game: Game;

const socketServer = new SocketServer();
socketServer.attach(http);
socketServer.on(GAME_EVENTS.CONNECT, (connection: Socket) => {
  console.log("a user connected");

  function emitGameState() {
    players.forEach((player) => {
      const gameState = {
        ...game.reportGameState(),
        ...player.reportGameState(),
      };

      if (gameState.turn !== gameState.player) delete gameState.card;

      player.connection.emit(GAME_EVENTS.GAME_STATE, gameState);
    });
  }

  connection.on(GAME_EVENTS.REGISTER, ({ username }: { username: string }) => {
    if (players.length === 2) {
      connection.emit(GAME_EVENTS.ERROR, {
        error: "room is full (2 players are joined",
      });
      connection.disconnect(true);
    }

    players.push(
      new Player(username, players.length === 0 ? 1 : 2, connection)
    );

    if (players.length === 2) {
      players[Math.random() > 0.5 ? 1 : 0].setAsHaakem();

      socketServer.emit(GAME_EVENTS.GAME_STARTED);

      game = new Game(players[0], players[1]);

      emitGameState();
    }
  });

  connection.on(GAME_EVENTS.HOKM, (format: CARD_FORMAT) => {
    game.setHokm(format);
    emitGameState();
  });
});

http.listen(GAME_PORT);
