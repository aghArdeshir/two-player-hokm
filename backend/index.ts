import { readFile } from "fs";
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

// TODO retry non-https version  as https version was for trial
const http = createHttpServer((req, res) => {
  const fileName =
    __dirname + "/../dist" + (req.url === "/" ? "/index.html" : req.url);

  if (fileName.endsWith(".html")) {
    res.setHeader("Content-Type", "text/html");
  } else if (fileName.endsWith(".js")) {
    res.setHeader("Content-Type", "text/javascript");
  } else if (fileName.endsWith(".png")) {
    res.setHeader("Content-Type", "image/png");
  }

  readFile(fileName, (error, data) => {
    if (error) console.log({ error });
    if (error) res.end();
    else res.end(data);
  });
});
http.on("listening", () => {
  console.log(`server listening on port ${GAME_PORT}`);
});

const players: Player[] = [];
let game: Game;

// TODO: try removing cors as it may not be needed any more
const socketServer = new SocketServer(http, { cors: {} });

socketServer.on(GAME_EVENTS.CONNECT, (connection: Socket) => {
  console.log("a user connected");

  connection.on(GAME_EVENTS.REGISTER, ({ username }: { username: string }) => {
    if (players.length === 2) {
      players.splice(0, 2); // only for easier development testing
      // connection.emit(GAME_EVENTS.ERROR, {
      //   error: "room is full (2 players are joined",
      // });
      // connection.disconnect(true);
    }

    players.push(new Player(username, connection));

    if (players.length === 2) {
      game = new Game(players[0], players[1]);
    }
  });

  connection.on(GAME_EVENTS.ACTION, (action: IPlayerAction) => {
    const player = players.find((player) => player.connection === connection);
    if (action.action === GAME_ACTION.CHOOSE_HOKM) {
      // TODO: check if hokm is valid CARD_FORMAT
      game.setHokm(action.hokm);
    } else if (action.action === GAME_ACTION.DROP_TWO) {
      // check if user has the cards
      game.dropTwo(action.cardsToDrop, player);
    } else if (action.action === GAME_ACTION.PICK_CARDS) {
      if (action.picks) {
        // TODO: in the game class/instance, check if the card is actually provided
        game.acceptCard(player, action.card);
      } else {
        game.refuseCard();
      }
    } else if (action.action === GAME_ACTION.PLAY) {
      game.play(player, action.card);
    }
  });
});

http.listen(GAME_PORT);

// TODO: Players only see the cardOnGround, they don't see the other played card
//       Maybe a little delay would be fine
