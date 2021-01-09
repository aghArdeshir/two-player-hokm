import { EventEmitter } from "events";
import {
  CARD_FORMAT,
  GAME_EVENTS,
  ICard,
  GAME_ACTION,
  IGameState,
  IGameStateForPickingStep,
} from "../common.typings";
import { isEqual } from "lodash";
import { Deck } from "./Deck";
import { Player } from "./Player";

export class Game {
  private player1: Player;
  private player2: Player;
  private lastWinner: Player;

  private deck = new Deck();
  private hokm: CARD_FORMAT;

  private cardToChoose: ICard;
  private cardsToChoose: [ICard, ICard];
  private cardOnGround: ICard | null;
  private cardsOnGround: [ICard, ICard] | null;

  private nextAction: GAME_ACTION = GAME_ACTION.CHOOSE_HOKM;

  private EventEmitter = new EventEmitter();

  constructor(player1: Player, player2: Player) {
    this.player1 = player1;
    this.player2 = player2;

    this.giveEachPlayerFive();
    this.setHaakem();

    // this.emitGameState();
  }

  private get players() {
    return [this.player1, this.player2];
  }

  private giveEachPlayerFive() {
    this.players.forEach((player) => {
      for (let i = 0; i < 5; i++) {
        player.addCard(this.deck.shift());
      }
    });
  }

  private setHaakem() {
    this.players[Math.random() > 0.5 ? 0 : 1].setAsHaakem();
  }

  public setHokm(format: CARD_FORMAT) {
    this.hokm = format;
    this.nextAction = GAME_ACTION.DROP_TWO;

    this.emitGameState();
  }

  public dropTwo(cards: [ICard, ICard], player: Player) {
    cards.forEach((card) => player.removeCard(card));
    if (this.players.every((player) => player.cards.length === 3)) {
      this.nextAction = GAME_ACTION.PICK_CARDS;
    }

    this.emitGameState();
  }

  public play(player: Player, card: ICard) {
    if (player.isTurn && player.hasCard(card)) {
      if (this.cardOnGround) {
        if (
          card.format !== this.cardOnGround.format &&
          player.cards.find((c) => c.format === this.cardOnGround.format)
        ) {
          return; // the card format is not as the `cardOnGround` format
        }
        if (Deck.compareCards(this.cardOnGround, card, this.hokm)) {
          player.incrementScore();
          this.lastWinner = player;
        } else {
          this.lastWinner = this.players.find((p) => p !== player);
          this.lastWinner.incrementScore();
        }
        this.cardsOnGround = [this.cardOnGround, card];
        this.cardOnGround = null;
        player.removeCard(card);
      } else {
        this.cardOnGround = card;
        player.removeCard(card);
      }
    }

    this.emitGameState();
  }

  public acceptCard(player: Player, card?: ICard) {
    if (player.isTurn) {
      // TODO: check if it is valid to accept card (e.g. do not accept both cards, count them)
      if (
        player.cards.length === 12 &&
        card &&
        this.cardsToChoose.findIndex((ctd) => isEqual(ctd, card)) > -1
      ) {
        player.addCard(card);
      } else {
        player.addCard(this.cardToChoose);
      }

      this.emitGameState();
    }
  }

  public refuseCard() {
    this.emitGameState();
  }

  private emitGameState() {
    if (this.cardsOnGround) {
      // stall 2 seconds so both users see what cards are played
      setTimeout(() => {
        this.cardsOnGround = null;
        this.emitGameState();
      }, 2000);
    }

    const result = this.reportGameState();

    this.EventEmitter.emit(GAME_EVENTS.GAME_STATE, result);
  }

  onStateChange(
    listener: (state: { player1: IGameState; player2: IGameState }) => void
  ) {
    this.EventEmitter.addListener(GAME_EVENTS.GAME_STATE, listener);
    this.emitGameState();
  }

  private setTurn() {
    if (this.nextAction === GAME_ACTION.DROP_TWO) {
      this.player1.isTurn = true;
      this.player2.isTurn = true;
    } else if (this.nextAction === GAME_ACTION.PICK_CARDS) {
      if (Math.floor((this.deck.length - 1) / 2) % 2 === 1) {
        // haakem's turn
        if (this.player1.isHaakem) {
          this.player1.isTurn = true;
          this.player2.isTurn = false;
        } else {
          this.player2.isTurn = true;
          this.player1.isTurn = false;
        }
      } else {
        // not haakem's turn
        if (this.player2.isHaakem) {
          this.player1.isTurn = true;
          this.player2.isTurn = false;
        } else {
          this.player2.isTurn = true;
          this.player1.isTurn = false;
        }
      }
    } else if (this.nextAction === GAME_ACTION.PLAY) {
      if (this.cardsOnGround) {
        this.player1.isTurn = false;
        this.player2.isTurn = false;
      } else if (this.player1.score === 0 && this.player2.score === 0) {
        if (!this.cardOnGround) {
          if (this.player1.isHaakem) {
            this.player1.isTurn = true;
            this.player2.isTurn = false;
          } else {
            this.player2.isTurn = true;
            this.player1.isTurn = false;
          }
        } else {
          if (this.player1.isHaakem) {
            this.player2.isTurn = true;
            this.player1.isTurn = false;
          } else {
            this.player1.isTurn = true;
            this.player2.isTurn = false;
          }
        }
      } else {
        if (
          (this.lastWinner === this.player1 && !this.cardOnGround) ||
          (this.lastWinner === this.player2 && this.cardOnGround)
        ) {
          this.player1.isTurn = true;
          this.player2.isTurn = false;
        } else {
          this.player2.isTurn = true;
          this.player1.isTurn = false;
        }
      }
    }
  }

  private reportGameState(): { player1: IGameState; player2: IGameState } {
    if (this.nextAction === GAME_ACTION.PICK_CARDS && this.deck.length === 0) {
      this.nextAction = GAME_ACTION.PLAY;
    }

    this.setTurn();

    const commonGameStateForPlayer1 = {
      player: {
        cardsLength: this.player1.cards.length,
        isHaakem: this.player1.isHaakem,
        isTurn: this.player1.isTurn,
        name: this.player1.username,
        score: this.player1.score,
        cards: this.player1.cards,
        isWinner: false,
      },
      otherPlayer: {
        cardsLength: this.player2.cards.length,
        isHaakem: this.player2.isHaakem,
        isTurn: this.player2.isTurn,
        name: this.player2.username,
        score: this.player2.score,
        isWinner: false,
      },
    };

    const commonGameStateForPlayer2 = {
      player: {
        cardsLength: this.player2.cards.length,
        isHaakem: this.player2.isHaakem,
        isTurn: this.player2.isTurn,
        name: this.player2.username,
        score: this.player2.score,
        cards: this.player2.cards,
        isWinner: false,
      },
      otherPlayer: {
        cardsLength: this.player1.cards.length,
        isHaakem: this.player1.isHaakem,
        isTurn: this.player1.isTurn,
        name: this.player1.username,
        score: this.player1.score,
        isWinner: false,
      },
    };

    if (this.nextAction === GAME_ACTION.CHOOSE_HOKM) {
      return {
        player1: {
          ...commonGameStateForPlayer1,
          nextAction: this.nextAction,
          hokm: null,
        },
        player2: {
          ...commonGameStateForPlayer2,
          nextAction: this.nextAction,
          hokm: null,
        },
      };
    } else if (this.nextAction === GAME_ACTION.DROP_TWO) {
      return {
        player1: {
          ...commonGameStateForPlayer1,
          nextAction: this.nextAction,
          hokm: this.hokm,
        },
        player2: {
          ...commonGameStateForPlayer2,
          nextAction: this.nextAction,
          hokm: this.hokm,
        },
      };
    } else if (this.nextAction === GAME_ACTION.PICK_CARDS) {
      let mustPickCard = false;
      let mustRefuseCard = false;
      if (Math.floor((this.deck.length - 1) / 2) % 2 === 1) {
        if (commonGameStateForPlayer1.player.isHaakem) {
          if (
            this.deck.length % 2 === 1 &&
            this.player1.cards.length > this.player2.cards.length
          )
            mustRefuseCard = true;
          if (
            this.deck.length % 2 === 1 &&
            this.player1.cards.length === this.player2.cards.length
          )
            mustPickCard = true;
        } else {
          if (
            this.deck.length % 2 === 1 &&
            this.player2.cards.length > this.player1.cards.length
          )
            mustRefuseCard = true;
          if (
            this.deck.length % 2 === 1 &&
            this.player2.cards.length === this.player1.cards.length
          )
            mustPickCard = true;
        }
      } else {
        if (commonGameStateForPlayer2.player.isHaakem) {
          if (
            this.deck.length % 2 === 1 &&
            this.player1.cards.length === this.player2.cards.length
          )
            mustRefuseCard = true;
          if (
            this.deck.length % 2 === 1 &&
            this.player1.cards.length < this.player2.cards.length
          )
            mustPickCard = true;
        } else {
          if (
            this.deck.length % 2 === 1 &&
            this.player2.cards.length === this.player1.cards.length
          )
            mustRefuseCard = true;
          if (
            this.deck.length % 2 === 1 &&
            this.player2.cards.length < this.player1.cards.length
          )
            mustPickCard = true;
        }
      }

      const result: {
        player1: IGameStateForPickingStep;
        player2: IGameStateForPickingStep;
      } = {
        player1: {
          ...commonGameStateForPlayer1,
          nextAction: this.nextAction,
          hokm: this.hokm,
        },
        player2: {
          ...commonGameStateForPlayer2,
          nextAction: this.nextAction,
          hokm: this.hokm,
        },
      };

      if (mustPickCard) result.player1.mustPickCard = mustPickCard;
      if (mustRefuseCard) result.player1.mustRefuseCard = mustRefuseCard;
      if (mustPickCard) result.player2.mustPickCard = mustPickCard;
      if (mustRefuseCard) result.player2.mustRefuseCard = mustRefuseCard;

      if (this.deck.length === 2) {
        this.cardsToChoose = [this.deck.shift(), this.deck.shift()];
        if (this.player1.isTurn) {
          result.player1.cardsToChoose = this.cardsToChoose;
        } else {
          result.player2.cardsToChoose = this.cardsToChoose;
        }
      } else {
        this.cardToChoose = this.deck.shift();
        if (this.player1.isTurn) {
          result.player1.cardToChoose = this.cardToChoose;
        } else {
          result.player2.cardToChoose = this.cardToChoose;
        }
      }

      return result;
    } else if (this.nextAction === GAME_ACTION.PLAY) {
      return {
        player1: {
          ...commonGameStateForPlayer1,
          nextAction: this.nextAction,
          hokm: this.hokm,
          cardOnGround: this.cardOnGround,
          cardsOnGround: this.cardsOnGround,
          winner: this.lastWinner?.username,
        },
        player2: {
          ...commonGameStateForPlayer2,
          nextAction: this.nextAction,
          hokm: this.hokm,
          cardOnGround: this.cardOnGround,
          cardsOnGround: this.cardsOnGround,
          winner: this.lastWinner?.username,
        },
      };
    }
  }
}
