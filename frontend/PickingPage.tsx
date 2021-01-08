import { useContext } from "react";
import { GAME_ACTION } from "../common.typings";
import Card from "./Card";
import { GameStateContext } from "./GameStateContext";
import { socketService } from "./socket-service";

export default function PickingPage() {
  const gameState = useContext(GameStateContext);

  if (gameState.nextAction !== GAME_ACTION.PICK_CARDS) return <></>;

  if (
    gameState.nextAction === GAME_ACTION.PICK_CARDS &&
    !gameState.player.isTurn
  ) {
    return <p>other player is picking cards</p>;
  }

  return (
    <div>
      <Card card={gameState.cardToChoose} />
      {!gameState.mustRefuseCard && (
        <button onClick={() => socketService.pickCard()}>I want it</button>
      )}
      {!gameState.mustPickCard && (
        <button onClick={() => socketService.refuseCard()}>
          I DON'T want it
        </button>
      )}
    </div>
  );
}
