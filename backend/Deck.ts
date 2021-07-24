import { CARD_FORMAT, ICard, ICardNumber } from "../common.typings";

export class Deck {
  public cards: ICard[] = [];

  constructor() {
    this.fillDeck();
  }

  private fillDeck() {
    for (let i: ICardNumber = 1; i !== 14; i++) {
      [
        CARD_FORMAT.SPADES,
        CARD_FORMAT.HEARTS,
        CARD_FORMAT.CLUBS,
        CARD_FORMAT.DIAMONDS,
      ].forEach((format) => {
        if (
          i === 2 &&
          (format === CARD_FORMAT.DIAMONDS || format === CARD_FORMAT.CLUBS)
        ) {
          // do nothing, we don't want these 2 cards in our deck
        } else {
          this.cards.push({ number: i, format });
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
