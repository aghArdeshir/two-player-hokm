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
        this.cards.push({ number: i, format });
      });
    }

    this.shift();
    this.shift();
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
