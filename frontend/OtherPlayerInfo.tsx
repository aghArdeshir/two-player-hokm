import { useContext } from "react";
import { GameStateContext } from "./GameStateContext";

export default function OtherPlayerInfo() {
  const gameState = useContext(GameStateContext);

  return (
    <div className="other-player-info">
      {gameState.otherPlayer.isHaakem ? (
        <h1 className="crown-mark">♔</h1>
      ) : (
        <></>
      )}
      {gameState.otherPlayer.name}: {gameState.otherPlayer.wins}
    </div>
  );
}
