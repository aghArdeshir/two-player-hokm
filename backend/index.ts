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

const http = createHttpServer(staticFileServer);
http.on("listening", () => {
  console.log(" --- ", new Date(), " --- server listening on port", GAME_PORT);
});

const socketServer = new SocketServer(http, { path: SERVER_PATH });

const players = new Map<__uuid__, ConnectedPlayer>();
const readyPlayersUuids: __uuid__[] = [];

socketServer.on(GAME_EVENTS.CONNECT, (connection: Socket) => {
  console.log(" --- ", new Date(), " --- someone joined");
  connection.on(GAME_EVENTS.REQUEST_UUID, () => {
    console.log(" --- ", new Date(), " --- a new uuid is assigned");
    connection.emit(GAME_EVENTS.UUID, uuid4());
  });

  connection.on(GAME_EVENTS.UUID, (_uuid: __uuid__) => {
    console.log(" --- ", new Date(), " --- a player with uuid joined");
    const uuid = _uuid;
    let connectedPlayer: ConnectedPlayer;

    function terminatePlayer(player: ConnectedPlayer) {
      console.log(" --- ", new Date(), " --- terminating game and player");
      const game = player.getGame();
      if (game) game.terminate();
      player.unsetGame();
      connection.emit(GAME_EVENTS.END_GAME);
      setTimeout(() => {
        console.log(" --- ", new Date(), " --- disconnecting a connection");
        connection.disconnect();
      }, 2000);
      players.delete(uuid);
    }

    const existingPlayer = players.get(uuid);
    if (existingPlayer) {
      console.log(" --- ", new Date(), " --- existing player joined");
      connectedPlayer = existingPlayer;
      connectedPlayer.setConnection(connection);

      if (connectedPlayer.getGame()) {
        console.log(
          " --- ",
          new Date(),
          " --- emitting game state for existing player"
        );
        connectedPlayer.getGame().emitGameState();
      }
    } else {
      connection.on(
        GAME_EVENTS.REGISTER,
        ({ username }: { username: string }) => {
          console.log(
            " --- ",
            new Date(),
            " --- a new player registered:",
            username
          );
          const player = new Player(username);
          connectedPlayer = new ConnectedPlayer(player);
          connectedPlayer.setConnection(connection);
          players.set(uuid, connectedPlayer);
          connectedPlayer.setActive();

          connectedPlayer.onDead((player: ConnectedPlayer) => {
            console.log(" --- ", new Date(), " --- a player is dead");
            terminatePlayer(player);
          });

          readyPlayersUuids.push(uuid);

          if (readyPlayersUuids.length === 2) {
            console.log(
              " --- ",
              new Date(),
              " --- readyPlayers reached 2, startinga new game"
            );
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
              console.log(" --- ", new Date(), " --- emitting game state");
              player1
                .getConnection()
                .emit(GAME_EVENTS.GAME_STATE, state.player1);
              player2
                .getConnection()
                .emit(GAME_EVENTS.GAME_STATE, state.player2);
            });

            game.onEnd(() => {
              console.log(" --- ", new Date(), " --- a game ended");
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
      if (connectedPlayer) connectedPlayer.setActive();
      if (players.get(uuid)) {
        connection.emit(GAME_EVENTS.MANUAL_HEARTBEAT);
      } else {
        connection.emit(GAME_EVENTS.END_GAME);
        connection.disconnect();
      }
    });

    connection.on(GAME_EVENTS.ACTION, (action: IPlayerAction) => {
      console.log(
        " --- ",
        new Date(),
        " --- a player action received:",
        action.action
      );
      const player = players.get(uuid);
      if (!player) {
        console.log(
          " --- ",
          new Date(),
          " --- disconnecting an obsolete connection"
        );
        connection.emit(GAME_EVENTS.END_GAME);
        connection.disconnect();
        return;
      }

      player.setActive();
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
      console.log(" --- ", new Date(), " --- end game requested");
      const player = players.get(uuid);
      player.setActive();
      terminatePlayer(player);
    });
  });
});

http.listen(GAME_PORT);
