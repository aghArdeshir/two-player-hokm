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
import { v4 as uuid4 } from "uuid";

function uuidOf(cookie = "") {
  const uuid = (cookie.split("uuid=uuid-start-")[1] || "").split(
    "-uuid-end"
  )[0];
  return uuid;
}

// TODO retry non-https version  as https version was for trial
const http = createHttpServer((req, res) => {
  const uuid = uuidOf(req.headers.cookie);
  if (!uuid) {
    res.setHeader("Set-Cookie", "uuid=uuid-start-" + uuid4() + "-uuid-end");
  }

  const fileName =
    __dirname +
    `/..${process.env.NODE_ENV === "development" ? "/dist" : ""}` +
    (req.url === "/" ? "/index.html" : req.url);

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

const playerUuids: string[] = [];
let game: Game;

const uuidToPlayerMap = new Map<string, Player>();
const playerToConnectionMap = new Map<Player, Socket>();

const socketServer = new SocketServer(http);

socketServer.on(GAME_EVENTS.CONNECT, (connection: Socket) => {
  playerToConnectionMap.set(
    uuidToPlayerMap.get(uuidOf(connection.request.headers.cookie)),
    connection
  );

  connection.on(GAME_EVENTS.REGISTER, ({ username }: { username: string }) => {
    if (playerUuids.length === 2) {
      playerUuids.splice(0, 2); // only for easier development testing
      // connection.emit(GAME_EVENTS.ERROR, {
      //   error: "room is full (2 players are joined",
      // });
      // connection.disconnect(true);
    }

    connection.on(GAME_EVENTS.MANUAL_HEARTBEAT, () => {
      connection.emit(GAME_EVENTS.MANUAL_HEARTBEAT);
    });

    const player = new Player(
      username,
      uuidOf(connection.request.headers.cookie)
    );
    playerUuids.push(player.uuid);
    uuidToPlayerMap.set(player.uuid, player);
    playerToConnectionMap.set(player, connection);

    if (playerUuids.length === 2) {
      game = new Game(
        uuidToPlayerMap.get(playerUuids[0]),
        uuidToPlayerMap.get(playerUuids[1])
      );

      game.onStateChange((state) => {
        playerToConnectionMap
          .get(uuidToPlayerMap.get(playerUuids[0]))
          .emit(GAME_EVENTS.GAME_STATE, state.player1);
        playerToConnectionMap
          .get(uuidToPlayerMap.get(playerUuids[1]))
          .emit(GAME_EVENTS.GAME_STATE, state.player2);
      });
    }
  });

  connection.on(GAME_EVENTS.ACTION, (action: IPlayerAction) => {
    const player = playerUuids.find(
      (player) =>
        playerToConnectionMap.get(uuidToPlayerMap.get(player)) === connection
    );
    if (action.action === GAME_ACTION.CHOOSE_HOKM) {
      // TODO: check if hokm is valid CARD_FORMAT
      game.setHokm(action.hokm);
    } else if (action.action === GAME_ACTION.DROP_TWO) {
      // TODO: check if user has the cards
      game.dropTwo(action.cardsToDrop, uuidToPlayerMap.get(player));
    } else if (action.action === GAME_ACTION.PICK_CARDS) {
      if (action.picks) {
        // TODO: in the game class/instance, check if the card is actually provided
        game.acceptCard(uuidToPlayerMap.get(player), action.card);
      } else {
        game.refuseCard();
      }
    } else if (action.action === GAME_ACTION.PLAY) {
      game.play(uuidToPlayerMap.get(player), action.card);
    }
  });
});

http.listen(GAME_PORT);
