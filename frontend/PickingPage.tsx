import { useContext } from "react";
import { GAME_EVENTS } from "../common.typings";
import { GameStateContext } from "./GameStateContext";

export default function PickingPage() {
  const gameState = useContext(GameStateContext);

  if (gameState.NEXT_STEP !== GAME_EVENTS.PICK) return <></>;

  return <p>Pick</p>;
}
