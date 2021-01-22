import { useContext } from "react";
import { GAME_ACTION } from "../common.typings";
import Card from "./Card";
import { GameStateContext } from "./GameStateContext";

export default function PlayingPage() {
  const gameState = useContext(GameStateContext);

  if (gameState.nextAction !== GAME_ACTION.PLAY) return <></>;

  return (
    <>
      <div className="played-cards">
        {gameState.cardOnGround && <Card card={gameState.cardOnGround} />}
        {gameState.cardsOnGround && (
          <>
            <div className="winner-announcer">
              <strong>Winner</strong> is <h4>🎉 {gameState.winner}</h4>
            </div>
            <div className="played-cards">
              <Card card={gameState.cardsOnGround[0]} />
              <Card card={gameState.cardsOnGround[1]} />
            </div>
          </>
        )}
      </div>
      <div className="other-player-wins">
        Wins: {gameState.otherPlayer.score}
      </div>
      <div className="player-wins">Wins: {gameState.player.score}</div>
    </>
  );
}
