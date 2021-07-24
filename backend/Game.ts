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

// After players play, we stall for an amount of time so both players can see
// what cards are played and who is the winner. This time is shorter in
// development mode
const STALL_DELAY = process.env.NODE_ENV === "development" ? 500 : 2000;

export class Game {
  private player1: Player;
  private player2: Player;
  private lastWinner: Player;

  private deck: Deck;
  private hokm: CARD_FORMAT;

  private cardToChoose: ICard;
  private cardsToChoose: [ICard, ICard];
  private cardOnGround: ICard | null;
  private cardsOnGround: [ICard, ICard] | null;

  private nextAction: GAME_ACTION;

  private EventEmitter = new EventEmitter();

  private gameIsTerminated = false;

  constructor(player1: Player, player2: Player) {
    this.player1 = player1;
    this.player2 = player2;

    this.setHaakem();
    this.initiateNewGame();

    this.emitGameState();
  }

  private initiateNewGame() {
    this.deck = new Deck();
    this.hokm = null;
    this.nextAction = GAME_ACTION.CHOOSE_HOKM;

    this.cardOnGround = undefined;
    this.cardsOnGround = undefined;
    this.cardToChoose = undefined;
    this.cardsToChoose = undefined;

    this.player1.resetScore();
    this.player2.resetScore();

    this.player1.cards = [];
    this.player2.cards = [];

    this.lastWinner = undefined;

    this.giveEachPlayerFive();
  }

  public terminate() {
    this.gameIsTerminated = true;
    this.emitGameState();
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
    this.players[Math.random() > 0.5 ? 0 : 1].setHaakem(true);
  }

  public setHokm(player: Player, format: CARD_FORMAT) {
    if (player.isHaakem) {
      this.hokm = format;
      this.nextAction = GAME_ACTION.DROP_TWO;

      this.emitGameState();
    }
  }

  public dropTwo(player: Player, cards: [ICard, ICard]) {
    if (cards.every((card) => player.hasCard(card))) {
      cards.forEach((card) => {
        player.removeCard(card);
      });

      if (this.players.every((player) => player.cards.length === 3)) {
        this.nextAction = GAME_ACTION.PICK_CARDS;
      }

      this.emitGameState();
    }
  }

  /**
   * returns `true` if `firstPlayedCard` (first input) is more valuable card
   *   than `secondPlayedCard` (second input) regarding game's `hokm`
   * @param firstPlayedCard the card that is played first
   * @param secondPlayedCard the card that is played second
   */
  compareCards(firstPlayedCard: ICard, secondPlayedCard: ICard) {
    if (secondPlayedCard.format === firstPlayedCard.format) {
      if (secondPlayedCard.number === 1) return true;
      if (firstPlayedCard.number === 1) return false;
      return secondPlayedCard.number > firstPlayedCard.number;
    } else if (
      secondPlayedCard.format === this.hokm ||
      firstPlayedCard.format === this.hokm
    ) {
      return secondPlayedCard.format === this.hokm;
    } else {
      // the new played card has other (non-hokm) format
      return false;
    }
  }

  public play(player: Player, card: ICard) {
    if (player.isTurn && player.hasCard(card)) {
      if (this.cardOnGround) {
        if (
          card.format !== this.cardOnGround.format && // is this condition necessary?
          player.hasCardOf(this.cardOnGround.format)
        ) {
          return; // the card format is not as the `cardOnGround` format
        }
        if (this.compareCards(this.cardOnGround, card)) {
          this.lastWinner = player;
        } else {
          this.lastWinner = this.players.find((p) => p !== player);
        }
        this.lastWinner.incrementScore();
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
    if (
      player.cards.length === 12 &&
      !player.isHaakem &&
      !card &&
      this.deck.length === 0
    ) {
      return;
    }

    if (player.isTurn) {
      if (
        card &&
        player.cards.length === 12 &&
        this.cardsToChoose.findIndex((ctd) => isEqual(ctd, card)) > -1
      ) {
        player.addCard(card);
        this.deck.shift();
        this.deck.shift();
        this.emitGameState();
      } else {
        if (!this.mustRefuseCard) {
          player.addCard(this.deck.shift());
          this.emitGameState();
        }
      }
    }
  }

  public refuseCard(player: Player) {
    if (player.isTurn) {
      if (this.cardsToChoose) {
        return;
      }

      if (!this.mustPickCard) {
        this.deck.shift();
        this.emitGameState();
      }
    }
  }

  emitGameState() {
    if (this.gameIsTerminated) {
      this.EventEmitter.emit(GAME_EVENTS.END_GAME);
      return;
    }

    if (this.cardsOnGround) {
      // stall 2 seconds so both players see what cards are played
      setTimeout(() => {
        if (this.player1.score === 7) {
          this.player1.setWinner(true);
          this.player1.wins++;

          if (this.player2.score === 0) {
            this.player1.wins++;

            if (this.player2.isHaakem) {
              this.player1.wins++;
            }
          }

          this.nextAction = GAME_ACTION.WAITING_FOR_NEXT_ROUND;
        } else if (this.player2.score === 7) {
          this.player2.setWinner(true);
          this.player2.wins++;

          if (this.player1.score === 0) {
            this.player2.wins++;

            if (this.player1.isHaakem) {
              this.player2.wins++;
            }
          }

          this.nextAction = GAME_ACTION.WAITING_FOR_NEXT_ROUND;
        }

        this.cardsOnGround = null;

        this.emitGameState();
      }, STALL_DELAY);
    }

    if (this.nextAction === GAME_ACTION.WAITING_FOR_NEXT_ROUND) {
      setTimeout(() => {
        if (this.player1.isWinner) {
          this.player1.setHaakem(true);
          this.player2.setHaakem(false);
        } else {
          this.player1.setHaakem(false);
          this.player2.setHaakem(true);
        }

        if (this.player1.wins === 7 || this.player2.wins === 7) {
          this.nextAction = GAME_ACTION.FINISHED;
        } else {
          this.player1.setWinner(false);
          this.player2.setWinner(false);

          this.initiateNewGame();
        }
        this.emitGameState();
      }, STALL_DELAY);
    }

    const result = this.reportGameState();

    this.EventEmitter.emit(GAME_EVENTS.GAME_STATE, result);
  }

  public onStateChange(
    listener: (state: { player1: IGameState; player2: IGameState }) => void
  ) {
    this.EventEmitter.addListener(GAME_EVENTS.GAME_STATE, listener);
    this.emitGameState();
  }

  public onEnd(listener: () => void) {
    this.EventEmitter.addListener(GAME_EVENTS.END_GAME, listener);
  }

  // TODO: add a game destroyer to add some manual cleanups

  private setHaakemTurn() {
    if (this.player1.isHaakem) {
      this.player1.isTurn = true;
      this.player2.isTurn = false;
    } else {
      this.player1.isTurn = false;
      this.player2.isTurn = true;
    }
  }

  private setNonHaakemTurn() {
    if (this.player1.isHaakem) {
      this.player1.isTurn = false;
      this.player2.isTurn = true;
    } else {
      this.player1.isTurn = true;
      this.player2.isTurn = false;
    }
  }

  private setTurns() {
    if (this.nextAction === GAME_ACTION.DROP_TWO) {
      this.player1.isTurn = true;
      this.player2.isTurn = true;
    } else if (this.nextAction === GAME_ACTION.PICK_CARDS) {
      // card indexes of 40 & 39 are for haakem, 38 & 37 for other player, 36 &
      //   35 for haakem, 34 && 33 for other player, 32 & 31 for haakem, etc...
      if (Math.floor((this.deck.length - 1) / 2) % 2 === 1) {
        this.setHaakemTurn();
      } else {
        this.setNonHaakemTurn();
      }
    } else if (this.nextAction === GAME_ACTION.PLAY) {
      if (this.cardsOnGround) {
        this.player1.isTurn = false;
        this.player2.isTurn = false;
      } else if (this.player1.score === 0 && this.player2.score === 0) {
        if (!this.cardOnGround) {
          this.setHaakemTurn();
        } else {
          this.setNonHaakemTurn();
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

  private mustPickCard: boolean;
  private mustRefuseCard: boolean;
  private determinePickingOptions() {
    this.mustPickCard = false;
    this.mustRefuseCard = false;
    if (Math.floor((this.deck.length - 1) / 2) % 2 === 1) {
      if (this.player1.isHaakem) {
        if (
          this.deck.length % 2 === 1 &&
          this.player1.cards.length > this.player2.cards.length
        )
          this.mustRefuseCard = true;
        if (
          this.deck.length % 2 === 1 &&
          this.player1.cards.length === this.player2.cards.length
        )
          this.mustPickCard = true;
      } else {
        if (
          this.deck.length % 2 === 1 &&
          this.player2.cards.length > this.player1.cards.length
        )
          this.mustRefuseCard = true;
        if (
          this.deck.length % 2 === 1 &&
          this.player2.cards.length === this.player1.cards.length
        )
          this.mustPickCard = true;
      }
    } else {
      if (this.player2.isHaakem) {
        if (
          this.deck.length % 2 === 1 &&
          this.player1.cards.length === this.player2.cards.length
        )
          this.mustRefuseCard = true;
        if (
          this.deck.length % 2 === 1 &&
          this.player1.cards.length < this.player2.cards.length
        )
          this.mustPickCard = true;
      } else {
        if (
          this.deck.length % 2 === 1 &&
          this.player2.cards.length === this.player1.cards.length
        )
          this.mustRefuseCard = true;
        if (
          this.deck.length % 2 === 1 &&
          this.player2.cards.length < this.player1.cards.length
        )
          this.mustPickCard = true;
      }
    }
  }

  private reportGameState(): { player1: IGameState; player2: IGameState } {
    if (
      this.nextAction === GAME_ACTION.PICK_CARDS &&
      this.deck.length === 0 &&
      this.player1.cards.length === 13 &&
      this.player2.cards.length === 13
    ) {
      this.nextAction = GAME_ACTION.PLAY;
    }

    this.setTurns();

    const gameStateForPlayer1 = {
      player: {
        cardsLength: this.player1.cards.length,
        isHaakem: this.player1.isHaakem,
        isTurn: this.player1.isTurn,
        name: this.player1.username,
        score: this.player1.score,
        wins: this.player1.wins,
        cards: this.player1.cards,
        isWinner: this.player1.isWinner,
      },
      otherPlayer: {
        cardsLength: this.player2.cards.length,
        isHaakem: this.player2.isHaakem,
        isTurn: this.player2.isTurn,
        name: this.player2.username,
        score: this.player2.score,
        wins: this.player2.wins,
        isWinner: this.player2.isWinner,
      },
    };

    const gameStateForPlayer2 = {
      player: {
        cardsLength: this.player2.cards.length,
        isHaakem: this.player2.isHaakem,
        isTurn: this.player2.isTurn,
        name: this.player2.username,
        score: this.player2.score,
        cards: this.player2.cards,
        wins: this.player2.wins,
        isWinner: this.player2.isWinner,
      },
      otherPlayer: {
        cardsLength: this.player1.cards.length,
        isHaakem: this.player1.isHaakem,
        isTurn: this.player1.isTurn,
        name: this.player1.username,
        score: this.player1.score,
        wins: this.player1.wins,
        isWinner: this.player1.isWinner,
      },
    };

    if (this.nextAction === GAME_ACTION.CHOOSE_HOKM) {
      return {
        player1: {
          ...gameStateForPlayer1,
          nextAction: this.nextAction,
          hokm: null,
        },
        player2: {
          ...gameStateForPlayer2,
          nextAction: this.nextAction,
          hokm: null,
        },
      };
    } else if (this.nextAction === GAME_ACTION.DROP_TWO) {
      return {
        player1: {
          ...gameStateForPlayer1,
          nextAction: this.nextAction,
          hokm: this.hokm,
        },
        player2: {
          ...gameStateForPlayer2,
          nextAction: this.nextAction,
          hokm: this.hokm,
        },
      };
    } else if (this.nextAction === GAME_ACTION.PICK_CARDS) {
      this.determinePickingOptions();

      const result: {
        player1: IGameStateForPickingStep;
        player2: IGameStateForPickingStep;
      } = {
        player1: {
          ...gameStateForPlayer1,
          nextAction: this.nextAction,
          hokm: this.hokm,
        },
        player2: {
          ...gameStateForPlayer2,
          nextAction: this.nextAction,
          hokm: this.hokm,
        },
      };

      if (this.mustPickCard) result.player1.mustPickCard = this.mustPickCard;
      if (this.mustRefuseCard)
        result.player1.mustRefuseCard = this.mustRefuseCard;
      if (this.mustPickCard) result.player2.mustPickCard = this.mustPickCard;
      if (this.mustRefuseCard)
        result.player2.mustRefuseCard = this.mustRefuseCard;

      if (this.deck.length === 2) {
        this.cardsToChoose = [this.deck.cards[0], this.deck.cards[1]];
        if (this.player1.isTurn) {
          result.player1.cardsToChoose = this.cardsToChoose;
        } else {
          result.player2.cardsToChoose = this.cardsToChoose;
        }
      } else {
        this.cardToChoose = this.deck.cards[0];
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
          ...gameStateForPlayer1,
          nextAction: this.nextAction,
          hokm: this.hokm,
          cardOnGround: this.cardOnGround,
          cardsOnGround: this.cardsOnGround,
          winner: this.lastWinner?.username,
        },
        player2: {
          ...gameStateForPlayer2,
          nextAction: this.nextAction,
          hokm: this.hokm,
          cardOnGround: this.cardOnGround,
          cardsOnGround: this.cardsOnGround,
          winner: this.lastWinner?.username,
        },
      };
    } else if (this.nextAction === GAME_ACTION.WAITING_FOR_NEXT_ROUND) {
      return {
        player1: {
          ...gameStateForPlayer1,
          nextAction: this.nextAction,
          hokm: this.hokm,
        },
        player2: {
          ...gameStateForPlayer2,
          nextAction: this.nextAction,
          hokm: this.hokm,
        },
      };
    } else if (this.nextAction === GAME_ACTION.FINISHED) {
      return {
        player1: {
          ...gameStateForPlayer1,
          nextAction: this.nextAction,
          hokm: null,
        },
        player2: {
          ...gameStateForPlayer2,
          nextAction: this.nextAction,
          hokm: null,
        },
      };
    }
  }
}
