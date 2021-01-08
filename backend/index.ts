import { createServer as createHttpServer } from "http";
import { Server as SocketServer, Socket } from "socket.io";
import {
  GAME_ACTION,
  GAME_EVENTS,
  GAME_PORT,
  IPlayerAction,
} from "../common.typings";
import { Game } from "./Game";
import { Player } from "./Player";

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

  connection.on(GAME_EVENTS.REGISTER, (args: { username: string }) => {
    const { username } = args;
    console.log({ args });
    if (players.length === 2) {
      players.splice(0, 2); // only for easier dev
      // connection.emit(GAME_EVENTS.ERROR, {
      //   error: "room is full (2 players are joined",
      // });
      // connection.disconnect(true);
    }

    players.push(new Player(username, connection));

    if (players.length === 2) {
      game = new Game(players[0], players[1]);
      // players[Math.random() > 0.5 ? 1 : 0].setAsHaakem();
      players[0].setAsHaakem();
      game.emitGameState();
    }
  });

  connection.on(GAME_EVENTS.ACTION, (action: IPlayerAction) => {
    const player = players.find((player) => player.connection === connection);

    if (action.action === GAME_ACTION.CHOOSE_HOKM) {
      game.setHokm(action.hokm);
      game.emitGameState();
    } else if (action.action === GAME_ACTION.DROP_TWO) {
      game.dropTwo(action.cardsToDrop, connection);
      if (players.every((player) => player.cards.length === 3)) {
        game.setAction(GAME_ACTION.PICK_CARDS);
        game.emitGameState();
      }
    } else if (action.action === GAME_ACTION.PICK_CARDS) {
      if (action.picks) {
        game.acceptCard(player, action.card);
      } else {
        game.refuseCard(player);
      }
      game.emitGameState();
    } else if (action.action === GAME_ACTION.PLAY) {
      game.play(player, action.card);
      game.emitGameState();
    }
  });
});

http.listen(GAME_PORT);
