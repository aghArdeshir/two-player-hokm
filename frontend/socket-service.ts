import { io, Socket } from "socket.io-client";
import {
  CARD_FORMAT,
  GAME_EVENTS,
  GAME_PORT,
  IGameStateForUi,
} from "../common.typings";

class SocketService {
  private connected = false;
  private socketConnection: Socket;

  constructor() {
    this.socketConnection = io(`localhost:${GAME_PORT}`);

    this.socketConnection.on(GAME_EVENTS.CONNECT, () => {
      this.connected = true;
      this.setupListeners();
      document.body.dispatchEvent(
        new CustomEvent(GAME_EVENTS.SOCKET_CONNECTED)
      );
    });
  }

  onConnected(callback: () => void) {
    if (this.connected) callback();
    else this.once(GAME_EVENTS.SOCKET_CONNECTED, callback);
  }

  once(eventName: GAME_EVENTS, listener: () => void) {
    function _listener() {
      listener();
      document.body.removeEventListener(eventName, _listener);
    }

    document.body.addEventListener(eventName, _listener);
  }

  registerUser(username: string) {
    this.socketConnection.emit(GAME_EVENTS.REGISTER, { register: username });
  }

  setupListeners() {
    this.socketConnection.on(GAME_EVENTS.ERROR, console.error);
    this.socketConnection.on(GAME_EVENTS.GAME_STARTED, () =>
      document.body.dispatchEvent(new CustomEvent(GAME_EVENTS.GAME_STARTED))
    );
  }

  on(eventName: GAME_EVENTS, listener: (data: IGameStateForUi) => void) {
    this.socketConnection.on(eventName, listener);
  }

  selectHokm(format: CARD_FORMAT) {
    this.socketConnection.emit(GAME_EVENTS.HOKM, format);
  }
}

export const socketService = new SocketService();
