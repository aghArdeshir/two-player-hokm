import { EventEmitter } from "events";
import { Socket } from "socket.io";
import { Game } from "./Game";
import { Player } from "./Player";

const ONE_MINUTE = 60000;
const ONE_HOUR = ONE_MINUTE * 60;

export class ConnectedPlayer {
  static DEAD = "dead";

  private player: Player;
  private connection: Socket;
  private game: Game;
  private lastActiveTime: Date;
  private EventEmitter = new EventEmitter();
  private intervalRef: NodeJS.Timeout;

  constructor(player: Player) {
    this.player = player;
    this.setIsAlive();

    this.init();
  }

  init() {
    this.intervalRef = setInterval(() => {
      if (new Date().getTime() - this.lastActiveTime.getTime() > ONE_HOUR) {
        this.EventEmitter.emit(ConnectedPlayer.DEAD);
        clearInterval(this.intervalRef);
      }
    }, ONE_MINUTE);
  }

  onDead(callback: (player: ConnectedPlayer) => void) {
    this.EventEmitter.on(ConnectedPlayer.DEAD, () => callback(this));
  }

  setConnection(connection: Socket) {
    this.connection = connection;
    this.setIsAlive();
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

  setIsAlive() {
    this.lastActiveTime = new Date();
  }
}
