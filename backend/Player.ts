import { isEqual } from "lodash";
import { CARD_SYMBOL, ICard } from "../common.typings";

export class Player {
  username: string;
  cards: ICard[] = [];
  isHaakem = false;
  score = 0;
  wins = 0;
  isTurn = false;
  isWinner = false;

  constructor(username: string) {
    this.username = username;
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

  public incrementWins() {
    this.wins++;
  }

  public resetScore() {
    this.score = 0;
  }

  public hasCard(card: ICard) {
    return this.cards.findIndex((c) => isEqual(c, card)) > -1;
  }

  public hasCardOf(symbol: CARD_SYMBOL) {
    return !!this.cards.find((c) => c.symbol === symbol);
  }

  public setWinner(state: boolean) {
    this.isWinner = state;
  }
}
