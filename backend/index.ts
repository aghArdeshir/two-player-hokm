import { readFile, readFileSync } from "fs";
import { createServer as createHttpsServer } from "https";
import { Server as SocketServer, Socket } from "socket.io";
import {
  GAME_ACTION,
  GAME_EVENTS,
  GAME_PORT,
  IPlayerAction,
} from "../common.typings";
import { Game } from "./Game";
import { Player } from "./Player";

const options = {
  key: readFileSync(__dirname + "/key.pem"),
  cert: readFileSync(__dirname + "/cert.pem"),
};

// TODO retry non-https version  as https version was for trial
const https = createHttpsServer(options, (req, res) => {
  const fileName =
    __dirname + "/../dist" + (req.url === "/" ? "/index.html" : req.url);

  if (fileName.endsWith(".html")) {
    res.setHeader("Content-Type", "text/html");
  } else if (fileName.endsWith(".js")) {
    res.setHeader("Content-Type", "text/javascript");
  } else if (fileName.endsWith(".png")) {
    res.setHeader("Content-Type", "image/png");
  }

  console.log({ fileName });
  readFile(fileName, (error, data) => {
    console.log({ error });
    if (error) res.end();
    else res.end(data);
  });
});
https.on("listening", () => {
  console.log(`server listening on port ${GAME_PORT}`);
});

const players: Player[] = [];
let game: Game;

// TODO: try removing cors as it may not be needed any more
const socketServer = new SocketServer(https, { cors: {} });

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
      game.emitGameState();
    }
  });

  connection.on(GAME_EVENTS.ACTION, (action: IPlayerAction) => {
    const player = players.find((player) => player.connection === connection);
    if (action.action === GAME_ACTION.CHOOSE_HOKM) {
      // TODO: check if hokm is valid CARD_FORMAT
      game.setHokm(action.hokm);
      game.emitGameState();
    } else if (action.action === GAME_ACTION.DROP_TWO) {
      // check if user has the cards
      game.dropTwo(action.cardsToDrop, connection);
      // TODO: on every card rop by each player, game state should be emitted
      //    so the other player knows that the other player has 3 cards and have dropped 2
      if (players.every((player) => player.cards.length === 3)) {
        game.setAction(GAME_ACTION.PICK_CARDS); // TODO: this should be setby the game itself, logic is not related to here
        game.emitGameState();
      }
    } else if (action.action === GAME_ACTION.PICK_CARDS) {
      if (action.picks) {
        // TODO: in the game class/instance, check if the card is actually provided
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

https.listen(GAME_PORT);

// TODO: Players only see the cardOnGround, they don't see the other played card
//       Maybe a little delay would be fine
