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

  pop() {
    return this.cards.shift();
  }
}

export class Player {
  private username: string;
  carads: Card[] = [];
  connection: Socket;

  constructor(username: string, connection: Socket) {
    this.username = username;
    this.connection = connection;
  }

  addCard(card: Card) {
    this.carads.push(card);
  }
}

export class Game {
  private player1: Player;
  private player2: Player;
  private deck = new Deck();

  constructor(player1: Player, player2: Player) {
    this.player1 = player1;
    this.player2 = player2;

    this.giveEachPlayerFive();
  }

  private giveEachPlayerFive() {
    [this.player1, this.player2].forEach((player) => {
      for (let i = 0; i < 5; i++) {
        player.addCard(this.deck.pop());
      }
    });
  }

  reportGameState() {
    return {
      NEXT_STEP: GAME_EVENTS.CHOOSE_HOKM,
    };
  }
}
