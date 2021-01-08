import { Socket } from "socket.io";
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
  private cardToChoose: ICard;
  private cardsToChoose: [ICard, ICard];
  private player1: Player;
  private player2: Player;
  private deck = new Deck();
  private hokm: CARD_FORMAT;
  private lastWinner: Player;
  private cardOnGround: ICard;

  constructor(player1: Player, player2: Player) {
    this.player1 = player1;
    this.player2 = player2;

    this.giveEachPlayerFive();
    this.player1.setAsHaakem();
  }

  private giveEachPlayerFive() {
    [this.player1, this.player2].forEach((player) => {
      for (let i = 0; i < 5; i++) {
        player.addCard(this.deck.shift());
      }
    });
  }

  setHokm(format: CARD_FORMAT) {
    this.hokm = format;
    this.nextAction = GAME_ACTION.DROP_TWO;
  }

  dropTwo(cards: [ICard, ICard], connection: Socket) {
    const player = [this.player1, this.player2].find(
      (player) => player.connection === connection
    );

    cards.forEach((card) => player.removeCard(card));
  }

  play(player: Player, card: ICard) {
    if (this.cardOnGround) {
      if (
        // player.isTurn // TODODODODODODOTODOTODOTODO TODO
        card.format !== this.cardOnGround.format &&
        player.cards.find((c) => c.format === this.cardOnGround.format)
      ) {
        return;
      }
      if (Deck.compareCards(this.cardOnGround, card, this.hokm)) {
        player.incrementScore();
        this.lastWinner = player;
      } else {
        this.lastWinner = [this.player1, this.player2].find(
          (p) => p !== player
        );
        this.lastWinner.incrementScore();
      }
      this.cardOnGround = undefined;
    } else {
      this.cardOnGround = card;
    }
    player.removeCard(card);
  }

  setAction(action: GAME_ACTION) {
    this.nextAction = action;
  }

  acceptCard(player: Player, card?: ICard) {
    // TODO: check if card is actually provided as an a=option
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
  }

  refuseCard(player: Player) {}

  // later, on choose hokm, nextAction will be drop, on both players drop,
  //   next action will be pick, on both players reach 13 cards, next action
  //   will be play
  nextAction: GAME_ACTION = GAME_ACTION.CHOOSE_HOKM;

  emitGameState() {
    const result = this.reportGameState();
    this.player1.connection.emit(GAME_EVENTS.GAME_STATE, result.player1);
    this.player2.connection.emit(GAME_EVENTS.GAME_STATE, result.player2);
  }

  private reportGameState(): { player1: IGameState; player2: IGameState } {
    if (this.nextAction === GAME_ACTION.PICK_CARDS && this.deck.length === 0) {
      this.nextAction = GAME_ACTION.PLAY;
    }

    const commonGameStateForPlayer1 = {
      player: {
        cardsLength: this.player1.cards.length,
        isHaakem: this.player1.isHaakem,
        isTurn: false,
        name: this.player1.username,
        score: this.player1.score,
        cards: this.player1.cards,
        isWinner: false,
      },
      otherPlayer: {
        cardsLength: this.player2.cards.length,
        isHaakem: this.player2.isHaakem,
        isTurn: false,
        name: this.player2.username,
        score: this.player2.score,
        isWinner: false,
      },
    };

    const commonGameStateForPlayer2 = {
      player: {
        cardsLength: this.player2.cards.length,
        isHaakem: this.player2.isHaakem,
        isTurn: false,
        name: this.player2.username,
        score: this.player2.score,
        cards: this.player2.cards,
        isWinner: false,
      },
      otherPlayer: {
        cardsLength: this.player1.cards.length,
        isHaakem: this.player1.isHaakem,
        isTurn: false,
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
        // haakem's turn
        // only assuming if player 1 is haakem
        if (commonGameStateForPlayer1.player.isHaakem) {
          commonGameStateForPlayer1.player.isTurn = true;
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
          commonGameStateForPlayer1.otherPlayer.isTurn = true;
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
        // not haakem's turn
        // only assuming if player 1 is haakem
        if (commonGameStateForPlayer2.player.isHaakem) {
          commonGameStateForPlayer2.otherPlayer.isTurn = true;
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
          commonGameStateForPlayer2.player.isTurn = true;
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
        if (result.player1.player.isTurn) {
          result.player1.cardsToChoose = this.cardsToChoose;
        } else {
          result.player2.cardsToChoose = this.cardsToChoose;
        }
      } else {
        this.cardToChoose = this.deck.shift();
        if (result.player1.player.isTurn) {
          result.player1.cardToChoose = this.cardToChoose;
        } else {
          result.player2.cardToChoose = this.cardToChoose;
        }
      }

      return result;
    } else if (this.nextAction === GAME_ACTION.PLAY) {
      if (this.player1.score === 0 && this.player2.score === 0) {
        if (this.player1.isHaakem && !this.cardOnGround) {
          commonGameStateForPlayer1.player.isTurn = true;
        } else {
          commonGameStateForPlayer2.player.isTurn = true;
        }
      } else {
        if (
          (this.lastWinner === this.player1 && !this.cardOnGround) ||
          (this.lastWinner === this.player2 && this.cardOnGround)
        ) {
          commonGameStateForPlayer1.player.isTurn = true;
        } else {
          commonGameStateForPlayer2.player.isTurn = true;
        }
      }

      return {
        player1: {
          ...commonGameStateForPlayer1,
          nextAction: this.nextAction,
          hokm: this.hokm,
          cardOnGround: this.cardOnGround,
        },
        player2: {
          ...commonGameStateForPlayer2,
          nextAction: this.nextAction,
          hokm: this.hokm,
          cardOnGround: this.cardOnGround,
        },
      };
    }
  }
}
