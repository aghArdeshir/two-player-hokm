import { isEqual } from "lodash";
import { CARD_FORMAT, ICard } from "../common.typings";

export class Player {
  username: string;
  uuid: string;
  cards: ICard[] = [];
  isHaakem = false;
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

  public setHaakem(isHaakem: boolean) {
    this.isHaakem = isHaakem;
  }

  public incrementScore() {
    this.score++;
  }

  public resetScore() {
    this.score = 0;
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
