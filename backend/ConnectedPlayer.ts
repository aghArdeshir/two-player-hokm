import { EventEmitter } from "events";
import { Socket } from "socket.io";
import { Game } from "./Game";
import { Player } from "./Player";

export class ConnectedPlayer {
  private player: Player;
  private connection: Socket;
  private game: Game;
  private lastActiveTime: Date;
  private EventEmitter = new EventEmitter();

  constructor(player: Player) {
    this.player = player;
    this.setActive();

    this.init();
  }

  init() {
    setInterval(() => {
      if (new Date().getTime() - this.lastActiveTime.getTime() > 10000) {
        this.EventEmitter.emit("dead");
      }
    }, 1000);
  }

  onDead(callback: () => void) {
    this.EventEmitter.on("dead", () => callback());
  }

  setConnection(connection: Socket) {
    this.connection = connection;
    this.setActive();
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

  unsetGame() {
    this.game = undefined;
  }

  setActive() {
    this.lastActiveTime = new Date();
  }
}
