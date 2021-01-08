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

  static compareCards(
    firstPlayedCard: ICard,
    secondPlayedCard: ICard,
    hokm: CARD_FORMAT
  ) {
    if (secondPlayedCard.format === firstPlayedCard.format) {
      if (secondPlayedCard.number === 1) return true;
      if (firstPlayedCard.number === 1) return false;
      return secondPlayedCard.number > firstPlayedCard.number;
    } else if (
      secondPlayedCard.format === hokm ||
      firstPlayedCard.format === hokm
    ) {
      return secondPlayedCard.format === hokm;
    } else {
      // the new played card has other (non-hokm) format
      return false;
    }
  }
}
