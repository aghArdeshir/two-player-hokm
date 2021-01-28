import { isEqual } from "lodash";
import { Socket } from "socket.io";
import { CARD_FORMAT, ICard } from "../common.typings";

export class Player {
  username: string;
  uuid: string;
  cards: ICard[] = [];
  isHaakem: boolean = false;
  score = 0;
  isTurn = false;
  isWinner = false;

  constructor(username: string, uuid: string) {
    this.username = username;
    this.uuid = uuid;
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

  public hasCardOf(format: CARD_FORMAT) {
    return !!this.cards.find((c) => c.format === format);
  }

  public setWinner(state: boolean) {
    this.isWinner = state;
  }
}
