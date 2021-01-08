import { createServer as createHttpServer } from "http";
import { Server as SocketServer, Socket } from "socket.io";
import {
  GAME_ACTION,
  GAME_EVENTS,
  GAME_PORT,
  IPlayerAction,
} from "../common.typings";
import { Game, Player } from "./Game";

const http = createHttpServer();
http.on("listening", () => {
  console.log(`backend listening on port ${GAME_PORT}`);
});

const players: Player[] = [];

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

    players.push(
      new Player(username, players.length === 0 ? 1 : 2, connection)
    );

    if (players.length === 2) {
      Game.TheGame = new Game(players[0], players[1]);
      // players[Math.random() > 0.5 ? 1 : 0].setAsHaakem();
      players[0].setAsHaakem();
      Game.TheGame.emitGameState();
    }
  });

  connection.on(GAME_EVENTS.ACTION, (action: IPlayerAction) => {
    const player = players.find((player) => player.connection === connection);

    if (action.action === GAME_ACTION.CHOOSE_HOKM) {
      Game.TheGame.setHokm(action.hokm);
      Game.TheGame.emitGameState();
    } else if (action.action === GAME_ACTION.DROP_TWO) {
      Game.TheGame.dropTwo(action.cardsToDrop, connection);
      if (players.every((player) => player.cards.length === 3)) {
        Game.TheGame.setAction(GAME_ACTION.PICK_CARDS);
        Game.TheGame.emitGameState();
      }
    } else if (action.action === GAME_ACTION.PICK_CARDS) {
      if (action.picks) {
        Game.TheGame.acceptCard(player);
      } else {
        Game.TheGame.refuseCard(player);
      }
      Game.TheGame.emitGameState();
      // TODO
    } else if (action.action === GAME_ACTION.PLAY) {
      // TODO
    }
  });
});

http.listen(GAME_PORT);
