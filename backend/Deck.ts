import { CARD_FORMAT, ICard, ICardNumber } from "../common.typings";

export class Deck {
  private cards: ICard[] = [];

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
        if (
          i === 2 &&
          (format === CARD_FORMAT.TILES || format === CARD_FORMAT.CLOVERS)
        ) {
          //do nothing
        } else {
          this.cards.push({ number: i, format });
        }
      });
    }

    Array(100)
      .fill(1)
      .forEach(() => this.shuffle());
  }

  private shuffle() {
    this.cards.sort(() => (Math.random() > 0.5 ? -1 : 1));
  }

  shift() {
    return this.cards.shift();
  }

  get length() {
    return this.cards.length;
  }

  static is(card: ICard) {
    return {
      // always assuming otherCard is played first
      betterThan(otherCard: ICard) {
        return {
          whenHokmIs(hokm: CARD_FORMAT) {
            if (card.format === otherCard.format) {
              if (card.number === 1) return true;
              if (otherCard.number === 1) return false;
              return card.number > otherCard.number;
            } else if (card.format === hokm || otherCard.format === hokm) {
              return card.format === hokm;
            } else {
              // the new played card has other (non-hokm) format
              return false;
            }
          },
        };
      },
    };
  }
}
