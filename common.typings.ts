export enum GAME_EVENTS {
  CONNECT = "connect",
  REGISTER = "register",
  ERROR = "error",
  GAME_STATE = "game-state", // Backend tells UI that I'm emitting a game state
  ACTION = "action", // UI tells Backend that I am emitting a game/plyer action
  CONNECTION = "connection",
  MANUAL_HEARTBEAT = "manual-heartbeat",
  END_GAME = "end-game",
  UUID = "uuid",
  REQUEST_UUID = "request-uuid",
}

export const GAME_PORT = 3000;

export type ICardNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;

export enum CARD_FORMAT {
  SPADES = "Spades",
  HEARTS = "Hearts",
  CLUBS = "Clubs",
  DIAMONDS = "Diamonds",
}

export const CARD_FORMAT_SUIT_ORDER = [
  CARD_FORMAT.SPADES,
  CARD_FORMAT.HEARTS,
  CARD_FORMAT.CLUBS,
  CARD_FORMAT.DIAMONDS,
];

export type ICard = {
  number: ICardNumber;
  format: CARD_FORMAT;
};

// ============================================================================

export enum GAME_ACTION {
  CHOOSE_HOKM = "CHOOSE_HOKM", // the player who `isHaakem` should choose one format as hokm
  DROP_TWO = "DROP_TWO", // each player must drop two cards out at the beginning
  PICK_CARDS = "PICK_CARDS", // `cardToChoose` is shown to user with (optionally) two options to pick or refuse
  PLAY = "PLAY", // if player `isTurn`, then should play (optionally there is a `cardOnGround` which is the card that other player has played)
  WAITING_FOR_NEXT_ROUND = "WAITING_FOR_NEXT_ROUND",
  FINISHED = "FINISHED",
}

// ============================================================================

type IOtherPlayer = {
  name: string;
  cardsLength: number;
  isHaakem: boolean; // chose randomly when game begins
  isTurn: boolean; // if it is player's turn to do action (one of below) or not
  score: number; // or maybe just 0 to 13!
  wins: number; // or maybe just 0 to 7!
  isWinner?: boolean; // only is set when one of players have reached seven in score
};

type IPlayer = IOtherPlayer & {
  cards?: ICard[]; // player's cards, optional, because players can't see each other's cards
};

// ============================================================================

export type ICommonGameState = {
  player: IPlayer;
  otherPlayer: IOtherPlayer;
  hokm: CARD_FORMAT | null;
  nextAction: GAME_ACTION;
};

export type IGameStateForHokmChoosing = ICommonGameState & {
  nextAction: GAME_ACTION.CHOOSE_HOKM;
};

type IGameStateForDroppingTwo = ICommonGameState & {
  nextAction: GAME_ACTION.DROP_TWO;
};

export type IGameStateForPickingStep = ICommonGameState & {
  nextAction: GAME_ACTION.PICK_CARDS;
  cardToChoose?: ICard;
  cardsToChoose?: [ICard, ICard];
  mustPickCard?: true; // because has refused the earlier card
  mustRefuseCard?: true; // because has picked the earlier card
};

type IGameStateForPlayStep = ICommonGameState & {
  nextAction: GAME_ACTION.PLAY;
  cardOnGround?: ICard; // the card that is currently played
  cardsOnGround?: [ICard, ICard]; // for a second, so both players can see what is played
  winner?: string; // last round winner
};

type IGameStateForWaitingForNextRoundState = ICommonGameState & {
  nextAction: GAME_ACTION.WAITING_FOR_NEXT_ROUND;
};

type IGameStateForFinishedState = ICommonGameState & {
  nextAction: GAME_ACTION.FINISHED;
};

export type IGameState =
  | IGameStateForHokmChoosing
  | IGameStateForDroppingTwo
  | IGameStateForPickingStep
  | IGameStateForPlayStep
  | IGameStateForWaitingForNextRoundState
  | IGameStateForFinishedState;

// ============================================================================

export type IPlayerAction =
  | {
      action: GAME_ACTION.CHOOSE_HOKM;
      hokm: CARD_FORMAT;
    }
  | {
      action: GAME_ACTION.DROP_TWO;
      cardsToDrop: [ICard, ICard];
    }
  | {
      action: GAME_ACTION.PICK_CARDS;
      picks: boolean;
      card?: ICard;
    }
  | {
      action: GAME_ACTION.PLAY;
      card: ICard;
    };
