import { useContext } from "react";
import { GAME_EVENTS } from "../common.typings";
import Card from "./Card";
import { GameStateContext } from "./GameStateContext";

export default function PickingPage() {
  const gameState = useContext(GameStateContext);

  if (gameState.NEXT_STEP !== GAME_EVENTS.PICK) return <></>;
  if (
    gameState.NEXT_STEP === GAME_EVENTS.PICK &&
    gameState.turn !== gameState.player
  )
    return <p>other player is picking cards</p>;

  return (
    <div>
      <Card format={gameState.card.format} number={gameState.card.number} />
    </div>
  );
}
