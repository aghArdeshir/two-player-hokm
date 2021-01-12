import { io, Socket } from "socket.io-client";
import {
  CARD_FORMAT,
  GAME_ACTION,
  GAME_EVENTS,
  ICard,
  IGameState,
  IPlayerAction,
} from "../common.typings";

const SOCKET_CONNECTED_EVENT = "SOCKET_CONNECTED";

class SocketService {
  private connected = false;
  private socketConnection: Socket;

  constructor() {
    this.socketConnection = io({ port: "3000" });

    this.socketConnection.on(GAME_EVENTS.CONNECTION, (connectionsCount) => {
      document.querySelector(
        ".connections-count"
      ).textContent = connectionsCount;
    });

    this.socketConnection.on(GAME_EVENTS.CONNECT, () => {
      this.connected = true;
      this.setupListeners();
      document.body.dispatchEvent(new CustomEvent(SOCKET_CONNECTED_EVENT));
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
}

export const socketService = new SocketService();
