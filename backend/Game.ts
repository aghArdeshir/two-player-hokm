import { Socket } from "socket.io";
import {
  CARD_FORMAT,
  GAME_EVENTS,
  ICard,
  ICardNumber,
} from "../common.typings";

class Card implements ICard {
  readonly number: ICardNumber;
  readonly format: CARD_FORMAT;

  constructor(number: ICardNumber, format: CARD_FORMAT) {
    this.number = number;
    this.format = format;
  }
}

class Deck {
  private cards: Card[] = [];

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
        this.cards.push(new Card(i, format));
      });
    }
  }

  shift() {
    return this.cards.shift();
  }
}

export class Player {
  private username: string;
  carads: Card[] = [];
  index: 1 | 2; // player1 or player2
  connection: Socket;
  isHaakem: boolean = false;

  constructor(username: string, index: 1 | 2, connection: Socket) {
    this.username = username;
    this.connection = connection;
    this.index = index;
  }

  addCard(card: Card) {
    this.carads.push(card);
  }

  setAsHaakem() {
    this.isHaakem = true;
  }

  reportGameState() {
    return { cards: this.carads, player: this.index, isHaakem: this.isHaakem };
  }
}

export class Game {
  private player1: Player;
  private player2: Player;
  private deck = new Deck();
  private hokm: CARD_FORMAT;

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
  }

  reportGameState() {
    let NEXT_STEP = GAME_EVENTS.CHOOSE_HOKM;
    if (this.hokm) NEXT_STEP = GAME_EVENTS.PICK;

    let turn: 1 | 2;
    let card: Card;

    if (NEXT_STEP === GAME_EVENTS.PICK) {
      if (this.player1.carads.length === this.player2.carads.length) {
        if (this.player1.isHaakem) turn = this.player1.index;
        else turn = this.player2.index;
      } else {
        turn =
          this.player1.carads.length < this.player2.carads.length
            ? this.player1.index
            : this.player2.index;
      }

      card = this.deck.shift();
    }

    return {
      NEXT_STEP,
      hokm: this.hokm,
      turn,
      card,
    };
  }
}
