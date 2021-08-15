import { CARD_SYMBOL, ICard, ICardNumber } from "../common.typings";

export class Deck {
  public cards: ICard[] = [];

  constructor() {
    this.fillDeck();
  }

  private fillDeck() {
    for (let i: ICardNumber = 1; i !== 14; i++) {
      [
        CARD_SYMBOL.SPADES,
        CARD_SYMBOL.HEARTS,
        CARD_SYMBOL.CLUBS,
        CARD_SYMBOL.DIAMONDS,
      ].forEach((symbol) => {
        if (
          i === 2 &&
          (symbol === CARD_SYMBOL.DIAMONDS || symbol === CARD_SYMBOL.CLUBS)
        ) {
          // do nothing, we don't want these 2 cards in our deck for 2 player hokm
        } else {
          this.cards.push({ number: i, symbol });
        }
      });
    }

    this.shuffle();
  }

  private shuffle() {
    Array(100)
      .fill(1)
      .forEach(() => {
        this.cards.sort(() => (Math.random() > 0.5 ? -1 : 1));
      });
  }

  shift() {
    return this.cards.shift();
  }

  get length() {
    return this.cards.length;
  }
}
