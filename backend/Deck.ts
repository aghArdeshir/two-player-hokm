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

  /**
   * returns `true` if `firstPlayedCard` (first input) is more valuable card
   *   than `secondPlayedCard` (second input) regarding game's `hokm` (third)
   *   input
   * @param firstPlayedCard the card that is played first
   * @param secondPlayedCard the card that is played second
   * @param hokm
   */
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
