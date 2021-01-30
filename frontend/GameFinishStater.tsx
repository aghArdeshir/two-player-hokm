import { useContext } from "react";
import { GAME_ACTION } from "../common.typings";
import { GameStateContext } from "./GameStateContext";

export default function GameFinishStater() {
  const gameState = useContext(GameStateContext);

  if (gameState.nextAction === GAME_ACTION.WAITING_FOR_NEXT_ROUND) {
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

  if (gameState.nextAction === GAME_ACTION.FINISHED) {
    return (
      <>
        <h3 className="game-finish-stater">
          🎉🎉🎉Game is finished.{" "}
          <h2>
            {
              [gameState.player, gameState.otherPlayer].find(
                (player) => player.isWinner
              ).name
            }
          </h2>{" "}
          is the ultimate winner 🎉🎉🎉
        </h3>
      </>
    );
  }

  return <></>;
}
