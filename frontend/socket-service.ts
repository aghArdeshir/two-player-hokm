import { io, Socket } from "socket.io-client";
import {
  CARD_FORMAT,
  GAME_ACTION,
  GAME_EVENTS,
  ICard,
  IGameState,
  IPlayerAction,
  SERVER_PATH,
  __uuid__,
} from "../common.typings";

const SOCKET_CONNECTED_EVENT = "SOCKET_CONNECTED";
const FIVE_SECONDS = 5 * 1000;
const TEN_SECONDS = 10 * 1000;
const TWO_SECONDS = 2000;

class SocketService {
  private connected = false;
  private socketConnection: Socket;

  constructor() {
    this.socketConnection = this.createConnection();

    this.socketConnection.on(GAME_EVENTS.CONNECT, () => {
      setTimeout(() => {
        this.connected = true;
        this.setupListeners();

        const storedUuid = localStorage.getItem("uuid");
        if (storedUuid) {
          this.socketConnection.emit(GAME_EVENTS.UUID, storedUuid);
        } else {
          this.socketConnection.emit(GAME_EVENTS.REQUEST_UUID);
        }

        document.body.dispatchEvent(new CustomEvent(SOCKET_CONNECTED_EVENT));
      }, TWO_SECONDS); //TODO: this is a bug, find out why this happens
    });
  }

  private createConnection() {
    if (process.env.NODE_ENV === "development") {
      return io("http://localhost:3000", {
        path: SERVER_PATH,
      });
    } else {
      return io({
        path: SERVER_PATH,
      });
    }
  }

  static lastHeartBeatTimestamp = null;
  initiateManualHeartBeat(config: {
    onNormal: () => void;
    onDelay: () => void;
    onDisconnect: () => void;
  }) {
    if (!SocketService.lastHeartBeatTimestamp) {
      SocketService.lastHeartBeatTimestamp = new Date().getTime();
    }

    setInterval(() => {
      if (this.socketConnection.connected) {
        this.socketConnection.emit(
          GAME_EVENTS.MANUAL_HEARTBEAT,
          localStorage.getItem("uuid")
        );
        if (
          new Date().getTime() - SocketService.lastHeartBeatTimestamp >
          TEN_SECONDS
        ) {
          config.onDelay();
        } else {
          config.onNormal();
        }
      } else {
        config.onDisconnect();
      }
    }, FIVE_SECONDS);

    this.socketConnection.on(GAME_EVENTS.MANUAL_HEARTBEAT, () => {
      SocketService.lastHeartBeatTimestamp = new Date().getTime();
    });

    this.socketConnection.on("close", () => {
      config.onDisconnect();
    });
  }

  onConnected(callback: () => void) {
    if (this.connected) callback();
    else this.once(callback);
  }

  once(listener: () => void) {
    function _listener() {
      listener();
      document.body.removeEventListener(SOCKET_CONNECTED_EVENT, _listener);
    }

    document.body.addEventListener(SOCKET_CONNECTED_EVENT, _listener);
  }

  registerUser(username: string) {
    this.socketConnection.emit(GAME_EVENTS.REGISTER, { username });
  }

  setupListeners() {
    this.socketConnection.on(GAME_EVENTS.ERROR, console.error);
    this.socketConnection.on(GAME_EVENTS.END_GAME, () => {
      window.location.reload();
    });
    this.socketConnection.on(GAME_EVENTS.UUID, (uuid: __uuid__) => {
      localStorage.setItem("uuid", uuid);
      this.socketConnection.emit(GAME_EVENTS.UUID, uuid);
    });
  }

  on(eventName: GAME_EVENTS, listener: (data: IGameState) => void) {
    this.socketConnection.on(eventName, listener);
  }

  selectHokm(format: CARD_FORMAT) {
    const action: IPlayerAction = {
      action: GAME_ACTION.CHOOSE_HOKM,
      hokm: format,
    };
    this.socketConnection.emit(GAME_EVENTS.ACTION, action);
  }

  pickCard(card?: ICard) {
    const action: IPlayerAction = {
      action: GAME_ACTION.PICK_CARDS,
      picks: true,
      card,
    };
    this.socketConnection.emit(GAME_EVENTS.ACTION, action);
  }

  refuseCard() {
    const action: IPlayerAction = {
      action: GAME_ACTION.PICK_CARDS,
      picks: false,
    };
    this.socketConnection.emit(GAME_EVENTS.ACTION, action);
  }

  dropTwo(cards: [ICard, ICard]) {
    if (cards.length !== 2) {
      throw new Error("Exacly 2 cards must be chosen");
    }

    const action: IPlayerAction = {
      action: GAME_ACTION.DROP_TWO,
      cardsToDrop: cards,
    };

    this.socketConnection.emit(GAME_EVENTS.ACTION, action);
  }

  play(card: ICard) {
    const action: IPlayerAction = {
      action: GAME_ACTION.PLAY,
      card,
    };

    this.socketConnection.emit(GAME_EVENTS.ACTION, action);
  }

  endGame() {
    this.socketConnection.emit(GAME_EVENTS.END_GAME);
  }
}

export const socketService = new SocketService();
