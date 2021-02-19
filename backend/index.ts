import { staticFileServer } from "./fileServerRouter";
import { createServer as createHttpServer } from "http";
import { Server as SocketServer, Socket } from "socket.io";
import {
  GAME_ACTION,
  GAME_EVENTS,
  GAME_PORT,
  IPlayerAction,
  SERVER_PATH,
  __uuid__,
} from "../common.typings";
import { Game } from "./Game";
import { Player } from "./Player";
import { v4 as uuid4 } from "uuid";
import { ConnectedPlayer } from "./ConnectedPlayer";

function devLog(...args) {
  console.log(
    " --- ",
    new Date().toLocaleTimeString(),
    " --- ",
    args.join(" ")
  );
}

const http = createHttpServer(staticFileServer);
http.on("listening", () => {
  devLog("server listening on port", GAME_PORT);
});

const socketServer = new SocketServer(http, { path: SERVER_PATH });

const players = new Map<__uuid__, ConnectedPlayer>();
const readyPlayersUuids: __uuid__[] = [];

socketServer.on(GAME_EVENTS.CONNECT, (connection: Socket) => {
  devLog("someone joined");

  connection.on(GAME_EVENTS.REQUEST_UUID, () => {
    devLog("a new uuid is assigned");

    connection.emit(GAME_EVENTS.UUID, uuid4());
  });

  connection.on(GAME_EVENTS.UUID, (_uuid: __uuid__) => {
    devLog("a player with uuid joined");

    const uuid = _uuid;
    let connectedPlayer: ConnectedPlayer;

    function terminatePlayer(player: ConnectedPlayer) {
      devLog("terminating game and player");

      const game = player.getGame();
      if (game) game.terminate();
      player.unsetGame();

      const playerConnection = player.getConnection();
      if (playerConnection !== connection) {
        devLog("WARNING: playerConnection differs from connection");

        playerConnection.emit(GAME_EVENTS.END_GAME);
        setTimeout(() => {
          devLog("disconnecting a connection");

          playerConnection.disconnect();
        }, 2000);
      }

      connection.emit(GAME_EVENTS.END_GAME);
      setTimeout(() => {
        devLog("disconnecting a connection");

        connection.disconnect();
      }, 2000);
      players.delete(uuid);
    }

    const existingPlayer = players.get(uuid);
    if (existingPlayer) {
      devLog("existing player joined");

      connectedPlayer = existingPlayer;
      connectedPlayer.setConnection(connection);

      if (connectedPlayer.getGame()) {
        devLog("emitting game state for existing player");

        connectedPlayer.getGame().emitGameState();
      } else {
        readyPlayersUuids.push(uuid);
      }
    } else {
      connection.on(
        GAME_EVENTS.REGISTER,
        ({ username }: { username: string }) => {
          devLog("a new player registered:", username);

          const player = new Player(username);
          connectedPlayer = new ConnectedPlayer(player);
          connectedPlayer.setConnection(connection);
          players.set(uuid, connectedPlayer);
          connectedPlayer.setIsAlive();

          connectedPlayer.onDead((player: ConnectedPlayer) => {
            devLog("a player is dead");

            terminatePlayer(player);
          });

          readyPlayersUuids.push(uuid);

          if (readyPlayersUuids.length === 2) {
            devLog("readyPlayers reached 2, startinga new game");

            const currentGamePlayersUuids = [
              readyPlayersUuids[0],
              readyPlayersUuids[1],
            ];
            readyPlayersUuids.splice(0, 2); // make room for next players to join

            const player1 = players.get(currentGamePlayersUuids[0]);
            const player2 = players.get(currentGamePlayersUuids[1]);

            const game = new Game(player1.getPlayer(), player2.getPlayer());
            player1.setGame(game);
            player2.setGame(game);

            game.onStateChange((state) => {
              devLog("emitting game state");

              player1
                .getConnection()
                .emit(GAME_EVENTS.GAME_STATE, state.player1);
              player2
                .getConnection()
                .emit(GAME_EVENTS.GAME_STATE, state.player2);
            });

            game.onEnd(() => {
              devLog("a game ended");

              player1.getConnection().emit(GAME_EVENTS.END_GAME);
              player1.unsetGame();

              player2.getConnection().emit(GAME_EVENTS.END_GAME);
              player2.unsetGame();
            });
          }
        }
      );
    }

    connection.on(GAME_EVENTS.MANUAL_HEARTBEAT, (uuid: __uuid__) => {
      if (connectedPlayer) connectedPlayer.setIsAlive();
      if (players.get(uuid)) {
        connection.emit(GAME_EVENTS.MANUAL_HEARTBEAT);
      } else {
        connection.emit(GAME_EVENTS.END_GAME);
        connection.disconnect();
      }
    });

    connection.on(GAME_EVENTS.ACTION, (action: IPlayerAction) => {
      devLog("a player action received:", action.action);

      const player = players.get(uuid);
      if (!player) {
        devLog("disconnecting an obsolete connection");

        connection.emit(GAME_EVENTS.END_GAME);
        connection.disconnect();
        return;
      }

      player.setIsAlive();
      const game = player.getGame();
      if (action.action === GAME_ACTION.CHOOSE_HOKM) {
        game.setHokm(player.getPlayer(), action.hokm);
      } else if (action.action === GAME_ACTION.DROP_TWO) {
        game.dropTwo(player.getPlayer(), action.cardsToDrop);
      } else if (action.action === GAME_ACTION.PICK_CARDS) {
        if (action.picks) {
          game.acceptCard(player.getPlayer(), action.card);
        } else {
          game.refuseCard(player.getPlayer());
        }
      } else if (action.action === GAME_ACTION.PLAY) {
        game.play(player.getPlayer(), action.card);
      }
    });

    connection.on(GAME_EVENTS.END_GAME, () => {
      devLog("end game requested");

      const player = players.get(uuid);
      player.setIsAlive();
      terminatePlayer(player);
    });
  });
});

http.listen(GAME_PORT);
