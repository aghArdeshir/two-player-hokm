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
import { parse as parseCookies } from "cookie";
import { ConnectedPlayer } from "./ConnectedPlayer";

type __uuid__ = string;

function getUuidOfCookie(cookieAsString = ""): __uuid__ {
  return parseCookies(cookieAsString).uuid;
}

const http = createHttpServer((req, res) => {
  const uuid = getUuidOfCookie(req.headers.cookie);
  if (!uuid) {
    res.setHeader("Set-Cookie", "uuid=" + uuid4());
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
    if (error) {
      console.log({ error });
      res.end();
    } else {
      res.end(data);
    }
  });
});

http.on("listening", () => {
  console.log(`server listening on port ${GAME_PORT}`);
});

const socketServer = new SocketServer(http);

const players = new Map<__uuid__, ConnectedPlayer>();
const readyPlayerUuids: __uuid__[] = [];

socketServer.on(GAME_EVENTS.CONNECT, (connection: Socket) => {
  const uuid = getUuidOfCookie(connection.request.headers.cookie);

  let connectedPlayer: ConnectedPlayer;

  const existingPlayer = players.get(uuid);
  if (existingPlayer) {
    connectedPlayer = existingPlayer;
    connectedPlayer.setConnection(connection);
  } else {
    // do nothing, later create a new ConnectedPlayer upon register
  }

  connection.on(GAME_EVENTS.MANUAL_HEARTBEAT, () => {
    connection.emit(GAME_EVENTS.MANUAL_HEARTBEAT);
  });

  connection.on(GAME_EVENTS.REGISTER, ({ username }: { username: string }) => {
    const player = new Player(username);
    connectedPlayer = new ConnectedPlayer(player);
    connectedPlayer.setConnection(connection);
    players.set(uuid, connectedPlayer);

    readyPlayerUuids.push(uuid);

    if (readyPlayerUuids.length === 2) {
      const currentGamePlayersUuids = [
        readyPlayerUuids[0],
        readyPlayerUuids[1],
      ];
      readyPlayerUuids.splice(0, 2); // make room for next players to join
      const game = new Game(
        players.get(currentGamePlayersUuids[0]).getPlayer(),
        players.get(currentGamePlayersUuids[1]).getPlayer()
      );
      players.get(currentGamePlayersUuids[0]).setGame(game);
      players.get(currentGamePlayersUuids[1]).setGame(game);

      game.onStateChange((state) => {
        players
          .get(currentGamePlayersUuids[0])
          .getConnection()
          .emit(GAME_EVENTS.GAME_STATE, state.player1);
        players
          .get(currentGamePlayersUuids[1])
          .getConnection()
          .emit(GAME_EVENTS.GAME_STATE, state.player2);
      });
    }
  });

  connection.on(GAME_EVENTS.ACTION, (action: IPlayerAction) => {
    const game = players.get(uuid).getGame();
    if (action.action === GAME_ACTION.CHOOSE_HOKM) {
      game.setHokm(action.hokm);
    } else if (action.action === GAME_ACTION.DROP_TWO) {
      game.dropTwo(action.cardsToDrop, players.get(uuid).getPlayer());
    } else if (action.action === GAME_ACTION.PICK_CARDS) {
      if (action.picks) {
        game.acceptCard(players.get(uuid).getPlayer(), action.card);
      } else {
        game.refuseCard();
      }
    } else if (action.action === GAME_ACTION.PLAY) {
      game.play(players.get(uuid).getPlayer(), action.card);
    }
  });
});

http.listen(GAME_PORT);
