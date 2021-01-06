import { Socket } from "socket.io";
import {
  CARD_FORMAT,
  GAME_EVENTS,
  ICard,
  ICardNumber,
  GAME_ACTION,
  IGameState,
  ICommonGameState,
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

  // reportGameState() {
  //   return { cards: this.cards, player: this.index, isHaakem: this.isHaakem };
  // }

  // setupListeners() {
  //   this.connection.on(GAME_EVENTS.PICK, (card: ICard) => {
  //     this.cards.push(card);
  //     Game.TheGame.emitGameState(this);
  //   });
  // }
}

export class Game {
  private player1: Player;
  private player2: Player;
  private haakem: Player;
  private deck = new Deck();
  private hokm: CARD_FORMAT;
  static TheGame: Game;
  private turn?: Player;
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

  emitGameState() {
    // [this.player1, this.player2].forEach((player) => {
    // const gameState = {
    //   ...Game.TheGame.reportGameState(player, otherPlayer),
    //   // ...player.reportGameState(),
    // };

    // if (this.turn?.index !== gameState.player) delete gameState.card;

    this.player1.connection.emit(
      GAME_EVENTS.GAME_STATE,
      Game.TheGame.reportGameState(this.player1, this.player2)
    );
    this.player2.connection.emit(
      GAME_EVENTS.GAME_STATE,
      Game.TheGame.reportGameState(this.player2, this.player1)
    );

    // });
  }

  setHaakem(player: Player) {
    this.haakem = player;
  }

  // later, on choose hokm, nextAction will be drop, on both players drop,
  //   next action will be pick, on both players reach 13 cards, next action
  //   will be play
  nextAction: GAME_ACTION = GAME_ACTION.CHOOSE_HOKM;

  reportGameState(player: Player, otherPlayer: Player): IGameState {
    const commonGameState: ICommonGameState = {
      player: {
        cardsLength: player.cards.length,
        isHaakem: player.isHaakem,
        isTurn:
          this.turn === player || this.nextAction === GAME_ACTION.DROP_TWO,
        name: player.username,
        score: player.score,
        cards: player.cards,
        isWinner: false,
      },
      otherPlayer: {
        cardsLength: otherPlayer.cards.length,
        isHaakem: otherPlayer.isHaakem,
        isTurn:
          this.turn === otherPlayer || this.nextAction === GAME_ACTION.DROP_TWO,
        name: otherPlayer.username,
        score: otherPlayer.score,
        isWinner: false,
      },
    };

    if (this.nextAction === GAME_ACTION.CHOOSE_HOKM) {
      return {
        ...commonGameState,
        nextAction: this.nextAction,
      };
    } else if (this.nextAction === GAME_ACTION.DROP_TWO) {
      return {
        ...commonGameState,
        nextAction: this.nextAction,
        hokm: this.hokm,
      };
    } else if (this.nextAction === GAME_ACTION.PICK_CARDS) {
      return {
        ...commonGameState,
        nextAction: this.nextAction,
        hokm: this.hokm,
        cardToChoose: this.deck.shift(),
        // isLastPickStep: true,
        // mustPickCard: true,
        // mustRefuseCard: true,
      };
    } else if (this.nextAction === GAME_ACTION.PLAY) {
      return {
        ...commonGameState,
        nextAction: this.nextAction,
        hokm: this.hokm,
        // cardOnGround: // ...
      };
    }
    // let NEXT_STEP = GAME_EVENTS.CHOOSE_HOKM;
    // if (this.hokm) NEXT_STEP = GAME_EVENTS.PICK;
    // let force: GAME_EVENTS.PICK | GAME_EVENTS.REFUSE;
    // if (NEXT_STEP === GAME_EVENTS.PICK) {
    //   if (this.deck.length % 2) {
    //     if (!this.turn) this.turn = this.haakem;
    //     else
    //       force =
    //         52 - this.deck.length > this.turn.cards.length * 2
    //           ? GAME_EVENTS.PICK
    //           : GAME_EVENTS.REFUSE;
    //   } else if (this.player1.cards.length === this.player2.cards.length) {
    //     this.turn = this.haakem;
    //   } else {
    //     this.turn =
    //       this.player1.cards.length < this.player2.cards.length
    //         ? this.player1
    //         : this.player2;
    //   }
    // }
    // if (player === this.turn) {
    //   this.card = this.deck.shift();
    // }
    // return {
    //   NEXT_STEP,
    //   hokm: this.hokm,
    //   turn: this.turn?.index,
    //   card: this.card,
    //   length: this.deck.length,
    // };
  }
}
