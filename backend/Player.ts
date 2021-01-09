import { isEqual } from "lodash";
import { Socket } from "socket.io";
import { ICard } from "../common.typings";

export class Player {
  username: string;
  cards: ICard[] = [];
  connection: Socket; // better to be kept somewhere else
  isHaakem: boolean = false;
  score = 0;
  isTurn = false;

  constructor(username: string, connection: Socket) {
    this.username = username;
    this.connection = connection;
  }

  public addCard(card: ICard) {
    this.cards.push(card);
  }

  public removeCard(card: ICard) {
    this.cards = this.cards.filter((c) => !isEqual(c, card));
  }

  public setAsHaakem() {
    this.isHaakem = true;
  }

  public incrementScore() {
    this.score++;
  }

  public hasCard(card: ICard) {
    return this.cards.findIndex((c) => isEqual(c, card)) > -1;
  }
}
