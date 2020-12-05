export enum GAME_EVENTS {
  CONNECT = "connect",
  SOCKET_CONNECTED = "socket-connected",
  GAME_STARTED = "game-started",
  REGISTER = "register",
  ERROR = "error",
  CHOOSE_HOKM = "choose-hokm",
  GAME_STATE = "game-state",
  HOKM = "hokm",
  PICK = "pick",
}

export const GAME_PORT = 3000;

export type ICardNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;

export enum CARD_FORMAT {
  PIKES = "Pikes",
  HEARTS = "Hearts",
  CLOVERS = "Clovers",
  TILES = "Tiles",
}

export interface ICard {
  number: ICardNumber;
  format: CARD_FORMAT;
}

export interface IGameState {
  NEXT_STEP: GAME_EVENTS;
  hokm?: CARD_FORMAT;
}

export interface IGameStateForUi extends IGameState {
  cards: ICard[];
  player: 1 | 2;
  isHaakem: boolean;
}

export const formats = [
  CARD_FORMAT.PIKES,
  CARD_FORMAT.HEARTS,
  CARD_FORMAT.CLOVERS,
  CARD_FORMAT.TILES,
];
