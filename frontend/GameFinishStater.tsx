import { useContext } from "react";
import { GAME_ACTION } from "../common.typings";
import { GameStateContext } from "./GameStateContext";

export default function GameFinishStater() {
  const gameState = useContext(GameStateContext);

  if (gameState.nextAction !== GAME_ACTION.FINISHED) return <></>;

  return (
    <>
      <h1>Game is FINISHED</h1>
      <button>click here to refresh game</button>
    </>
  );
}

