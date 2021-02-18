import { staticFileServerRouter } from "./fileServerRouter";
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

const http = createHttpServer(staticFileServerRouter);
http.on("listening", () => {
  console.log(`server listening on port ${GAME_PORT}`);
});

const socketServer = new SocketServer(http, { path: SERVER_PATH });

const players = new Map<__uuid__, ConnectedPlayer>();
const readyPlayersUuids: __uuid__[] = [];

socketServer.on(GAME_EVENTS.CONNECT, (connection: Socket) => {
  connection.on(GAME_EVENTS.REQUEST_UUID, () => {
    connection.emit(GAME_EVENTS.UUID, uuid4());
  });

  connection.on(GAME_EVENTS.UUID, (_uuid: __uuid__) => {
    const uuid = _uuid;

    let connectedPlayer: ConnectedPlayer;

    const existingPlayer = players.get(uuid);
    if (existingPlayer) {
      connectedPlayer = existingPlayer;
      connectedPlayer.setConnection(connection);

      if (connectedPlayer.getGame()) {
        connectedPlayer.getGame().emitGameState();
      }
    } else {
      connection.on(
        GAME_EVENTS.REGISTER,
        ({ username }: { username: string }) => {
          const player = new Player(username);
          connectedPlayer = new ConnectedPlayer(player);
          connectedPlayer.setConnection(connection);
          players.set(uuid, connectedPlayer);
          connectedPlayer.setActive();

          readyPlayersUuids.push(uuid);

          if (readyPlayersUuids.length === 2) {
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
              player1
                .getConnection()
                .emit(GAME_EVENTS.GAME_STATE, state.player1);
              player2
                .getConnection()
                .emit(GAME_EVENTS.GAME_STATE, state.player2);
            });

            game.onEnd(() => {
              player1.getConnection().emit(GAME_EVENTS.END_GAME);
              player1.unsetGame();

              player2.getConnection().emit(GAME_EVENTS.END_GAME);
              player2.unsetGame();
            });
          }
        }
      );
    }

    function terminatePlayer(player: ConnectedPlayer) {
      const game = player.getGame();
      if (game) game.terminate();
      player.unsetGame();
      connection.emit(GAME_EVENTS.END_GAME);
      setTimeout(() => {
        connection.disconnect();
      }, 2000);
    }

    if (connectedPlayer) {
      connectedPlayer.onDead((player: ConnectedPlayer) => {
        terminatePlayer(player);
      });
    }

    connection.on(GAME_EVENTS.MANUAL_HEARTBEAT, () => {
      if (connectedPlayer) connectedPlayer.setActive();
      connection.emit(GAME_EVENTS.MANUAL_HEARTBEAT);
    });

    connection.on(GAME_EVENTS.ACTION, (action: IPlayerAction) => {
      const player = players.get(uuid);
      player.setActive();
      const game = player.getGame();
      if (action.action === GAME_ACTION.CHOOSE_HOKM) {
        game.setHokm(action.hokm);
      } else if (action.action === GAME_ACTION.DROP_TWO) {
        game.dropTwo(action.cardsToDrop, player.getPlayer());
      } else if (action.action === GAME_ACTION.PICK_CARDS) {
        if (action.picks) {
          game.acceptCard(player.getPlayer(), action.card);
        } else {
          game.refuseCard();
        }
      } else if (action.action === GAME_ACTION.PLAY) {
        game.play(player.getPlayer(), action.card);
      }
    });

    connection.on(GAME_EVENTS.END_GAME, () => {
      const player = players.get(uuid);
      player.setActive();
      terminatePlayer(player);
    });
  });
});

http.listen(GAME_PORT);
