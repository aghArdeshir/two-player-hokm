import { useContext } from "react";
import { GAME_ACTION } from "../common.typings";
import { GameStateContext } from "./GameStateContext";

export default function () {
  const gameState = useContext(GameStateContext);
  let message = "";

  if (gameState.nextAction === GAME_ACTION.CHOOSE_HOKM) {
    if (gameState.player.isHaakem) {
      message = "Please choose Hokm by clicking on one of buttons above.";
    } else {
      message = "Waiting for Haakem to select Hokm.";
    }
  } else if (gameState.nextAction === GAME_ACTION.DROP_TWO) {
    if (gameState.player.cardsLength === 3) {
      message = "Waiting for other player to drop cards.";
    } else {
      message = "Please choose two cards to drop out.";
    }
  } else if (gameState.nextAction === GAME_ACTION.PICK_CARDS) {
    if (gameState.cardsToChoose) {
      message =
        "Click on one of the cards to pick it. Other card will be dropped.";
    } else if (!gameState.player.isTurn) {
      message = "Other player is picking cards.";
    }
  } else if (gameState.nextAction === GAME_ACTION.PLAY) {
    if (gameState.player.isTurn) {
      message = "Click on one of your cards to play.";
    } else if (gameState.otherPlayer.isTurn) {
      message = "Waiting for other player to play.";
    }
  }

  return <p className="player-action">{message}</p>;
}
