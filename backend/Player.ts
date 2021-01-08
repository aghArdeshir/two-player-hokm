import { isEqual } from "lodash";
import { Socket } from "socket.io";
import { ICard } from "../common.typings";

export class Player {
  username: string;
  cards: ICard[] = [];
  connection: Socket; // better to be kept somewhere else
  isHaakem: boolean = false;
  score = 0;

  constructor(username: string, connection: Socket) {
    this.username = username;
    this.connection = connection;
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
