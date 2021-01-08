import { isEqual } from "lodash";
import { Socket } from "socket.io";
import { ICard } from "../common.typings";

export class Player {
  username: string;
  cards: ICard[] = [];
  index: 1 | 2; // player1 or player2
  connection: Socket;
  isHaakem: boolean = false;
  score = 0;

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
  }

  incrementScore() {
    this.score++;
  }
}
