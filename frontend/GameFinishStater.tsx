import { useContext } from "react";
import { GAME_ACTION } from "../common.typings";
import { GameStateContext } from "./GameStateContext";

export default function GameFinishStater() {
  const gameState = useContext(GameStateContext);

  if (gameState.nextAction !== GAME_ACTION.WAITING_FOR_NEXT_ROUND) return <></>;

  return (
    <>
      <h4 className="game-finish-stater">
        🎉🎉🎉Winner is{" "}
        {
          [gameState.player, gameState.otherPlayer].find(
            (player) => player.isWinner
          ).name
        }
        🎉🎉🎉
      </h4>
    </>
  );
}
