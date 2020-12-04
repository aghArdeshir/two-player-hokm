export enum GAME_EVENTS {
  CONNECT = "connect",
  SOCKET_CONNECTED = "socket-connected",
  GAME_STARTED = "game-started",
  REGISTER = "register",
  ERROR = "error",
  CHOOSE_HOKM = "choose-hokm",
  GAME_STATE = "game-state",
}

export const GAME_PORT = 3000;

export type ICardNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;

export enum CARD_FORMAT {
  PIKES = "Pikes",
  HEARTS = "Hearts",
  CLOVERS = "Clovers",
  TILES = "Tiles",
}
