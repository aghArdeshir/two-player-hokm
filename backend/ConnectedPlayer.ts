import { Socket } from "socket.io";
import { Game } from "./Game";
import { Player } from "./Player";

export class ConnectedPlayer {
  private player: Player;
  private connection: Socket;
  private game: Game;

  constructor(player: Player) {
    this.player = player;
  }

  setConnection(connection: Socket) {
    this.connection = connection;
  }

  getPlayer() {
    return this.player;
  }

  getConnection() {
    return this.connection;
  }

  setGame(game: Game) {
    this.game = game;
  }

  getGame() {
    return this.game;
  }
}
