import { Socket } from "socket.io";
import {
  CARD_FORMAT,
  GAME_EVENTS,
  ICard,
  ICardNumber,
  GAME_ACTION,
  IGameState,
  IGameStateForPickingStep,
} from "../common.typings";
import { isEqual } from "lodash";

class Deck {
  private cards: ICard[] = [];

  constructor() {
    this.fillDeck();
  }

  private fillDeck() {
    for (let i: ICardNumber = 1; i !== 14; i++) {
      [
        CARD_FORMAT.PIKES,
        CARD_FORMAT.HEARTS,
        CARD_FORMAT.CLOVERS,
        CARD_FORMAT.TILES,
      ].forEach((format) => {
        this.cards.push({ number: i, format });
      });
    }

    this.shift();
    this.shift();
  }

  shift() {
    return this.cards.shift();
  }

  get length() {
    return this.cards.length;
  }
}

export class Player {
  username: string;
  cards: ICard[] = [];
  index: 1 | 2; // player1 or player2
  connection: Socket;
  isHaakem: boolean = false;
  score: 0;

  constructor(username: string, index: 1 | 2, connection: Socket) {
    this.username = username;
    this.connection = connection;
    this.index = index;

    // this.setupListeners();
  }

  addCard(card: ICard) {
    this.cards.push(card);
  }

  removeCard(card: ICard) {
    this.cards = this.cards.filter((c) => !isEqual(c, card));
  }

  setAsHaakem() {
    this.isHaakem = true;
    Game.TheGame.setHaakem(this);
  }
}

export class Game {
  static TheGame: Game;
  static cardToChoose: ICard;
  static lastTurn: Player;

  private player1: Player;
  private player2: Player;
  private haakem: Player;
  private deck = new Deck();
  private hokm: CARD_FORMAT;
  // private card?: Card;

  constructor(player1: Player, player2: Player) {
    this.player1 = player1;
    this.player2 = player2;

    this.giveEachPlayerFive();
  }

  private giveEachPlayerFive() {
    [this.player1, this.player2].forEach((player) => {
      for (let i = 0; i < 5; i++) {
        player.addCard(this.deck.shift());
      }
    });
  }

  setHokm(format: CARD_FORMAT) {
    this.hokm = format;
    this.nextAction = GAME_ACTION.DROP_TWO;
  }

  dropTwo(cards: [ICard, ICard], connection: Socket) {
    const player = [this.player1, this.player2].find(
      (player) => player.connection === connection
    );

    cards.forEach((card) => player.removeCard(card));
  }

  setAction(action: GAME_ACTION) {
    this.nextAction = action;
  }

  setHaakem(player: Player) {
    this.haakem = player;
  }

  acceptCard(player: Player) {
    player.addCard(Game.cardToChoose);
  }

  refuseCard(player: Player) {}

  // later, on choose hokm, nextAction will be drop, on both players drop,
  //   next action will be pick, on both players reach 13 cards, next action
  //   will be play
  nextAction: GAME_ACTION = GAME_ACTION.CHOOSE_HOKM;

  emitGameState() {
    const result = this.reportGameState();
    this.player1.connection.emit(GAME_EVENTS.GAME_STATE, result.player1);
    this.player2.connection.emit(GAME_EVENTS.GAME_STATE, result.player2);
  }

  private reportGameState(): { player1: IGameState; player2: IGameState } {
    const commonGameStateForPlayer1 = {
      player: {
        cardsLength: this.player1.cards.length,
        isHaakem: this.player1.isHaakem,
        isTurn: false,
        name: this.player1.username,
        score: this.player1.score,
        cards: this.player1.cards,
        isWinner: false,
      },
      otherPlayer: {
        cardsLength: this.player2.cards.length,
        isHaakem: this.player2.isHaakem,
        isTurn: false,
        name: this.player2.username,
        score: this.player2.score,
        isWinner: false,
      },
    };

    const commonGameStateForPlayer2 = {
      player: {
        cardsLength: this.player2.cards.length,
        isHaakem: this.player2.isHaakem,
        isTurn: false,
        name: this.player2.username,
        score: this.player2.score,
        cards: this.player2.cards,
        isWinner: false,
      },
      otherPlayer: {
        cardsLength: this.player1.cards.length,
        isHaakem: this.player1.isHaakem,
        isTurn: false,
        name: this.player1.username,
        score: this.player1.score,
        isWinner: false,
      },
    };

    if (this.nextAction === GAME_ACTION.CHOOSE_HOKM) {
      return {
        player1: {
          ...commonGameStateForPlayer1,
          nextAction: this.nextAction,
        },
        player2: {
          ...commonGameStateForPlayer2,
          nextAction: this.nextAction,
        },
      };
    } else if (this.nextAction === GAME_ACTION.DROP_TWO) {
      return {
        player1: {
          ...commonGameStateForPlayer1,
          nextAction: this.nextAction,
          hokm: this.hokm,
        },
        player2: {
          ...commonGameStateForPlayer2,
          nextAction: this.nextAction,
          hokm: this.hokm,
        },
      };
    } else if (this.nextAction === GAME_ACTION.PICK_CARDS) {
      let mustPickCard = false;
      let mustRefuseCard = false;
      if (Math.floor((this.deck.length - 1) / 2) % 2 === 1) {
        // haakem's turn
        // only assuming if player 1 is haakem
        if (commonGameStateForPlayer1.player.isHaakem) {
          commonGameStateForPlayer1.player.isTurn = true;
          if (
            this.deck.length % 2 === 1 &&
            this.player1.cards.length > this.player2.cards.length
          )
            mustRefuseCard = true;
          if (
            this.deck.length % 2 === 1 &&
            this.player1.cards.length === this.player2.cards.length
          )
            mustPickCard = true;
        } else {
          commonGameStateForPlayer1.otherPlayer.isTurn = true;
          if (
            this.deck.length % 2 === 1 &&
            this.player2.cards.length > this.player1.cards.length
          )
            mustRefuseCard = true;
          if (
            this.deck.length % 2 === 1 &&
            this.player2.cards.length === this.player1.cards.length
          )
            mustPickCard = true;
        }
      } else {
        // not haakem's turn
        // only assuming if player 1 is haakem
        if (commonGameStateForPlayer2.player.isHaakem) {
          commonGameStateForPlayer2.otherPlayer.isTurn = true;
          if (
            this.deck.length % 2 === 1 &&
            this.player1.cards.length === this.player2.cards.length
          )
            mustRefuseCard = true;
          if (
            this.deck.length % 2 === 1 &&
            this.player1.cards.length < this.player2.cards.length
          )
            mustPickCard = true;
        } else {
          commonGameStateForPlayer2.player.isTurn = true;
          if (
            this.deck.length % 2 === 1 &&
            this.player2.cards.length === this.player1.cards.length
          )
            mustRefuseCard = true;
          if (
            this.deck.length % 2 === 1 &&
            this.player2.cards.length < this.player1.cards.length
          )
            mustPickCard = true;
        }
      }

      Game.cardToChoose = this.deck.shift();

      const result: {
        player1: IGameStateForPickingStep;
        player2: IGameStateForPickingStep;
      } = {
        player1: {
          ...commonGameStateForPlayer1,
          nextAction: this.nextAction,
          hokm: this.hokm,
        },
        player2: {
          ...commonGameStateForPlayer2,
          nextAction: this.nextAction,
          hokm: this.hokm,
        },
      };

      if (mustPickCard) result.player1.mustPickCard = mustPickCard;
      if (mustRefuseCard) result.player1.mustRefuseCard = mustRefuseCard;
      if (mustPickCard) result.player2.mustPickCard = mustPickCard;
      if (mustRefuseCard) result.player2.mustRefuseCard = mustRefuseCard;

      if (result.player1.player.isTurn) {
        result.player1.cardToChoose = Game.cardToChoose;
      } else {
        result.player2.cardToChoose = Game.cardToChoose;
      }

      return result;
    } else if (this.nextAction === GAME_ACTION.PLAY) {
      return {
        player1: {
          ...commonGameStateForPlayer1,
          nextAction: this.nextAction,
          hokm: this.hokm,
        },
        player2: {
          ...commonGameStateForPlayer2,
          nextAction: this.nextAction,
          hokm: this.hokm,
        },
      };
    }
  }
}
