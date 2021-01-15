import { useContext } from "react";
import { GAME_ACTION } from "../common.typings";
import Card from "./Card";
import { cardWidth } from "./CardDrawer";
import { GameStateContext } from "./GameStateContext";

export default function PlayingPage() {
  const gameState = useContext(GameStateContext);

  if (gameState.nextAction !== GAME_ACTION.PLAY) return <></>;

  return (
    <>
      <div style={{ position: "fixed", bottom: 225 }}>
        {gameState.player.isTurn
          ? "Click on one of your cards below to play"
          : ""}
      </div>
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        {gameState.cardOnGround && <Card card={gameState.cardOnGround} />}
        {gameState.cardsOnGround && (
          <>
            <div>
              <strong>Winner</strong> is <h4>{gameState.winner}</h4>
            </div>
            <div style={{ display: "flex" }}>
              <Card
                style={{ transform: "scale(0.72)" }}
                card={gameState.cardsOnGround[0]}
              />
              <Card
                style={{ transform: "scale(0.72)" }}
                card={gameState.cardsOnGround[1]}
              />
            </div>
          </>
        )}
      </div>
      <div
        style={{ border: "1px solid", right: 0, top: 200, position: "fixed" }}
      >
        Wins: {gameState.otherPlayer.score}
      </div>
      <div
        style={{
          border: "1px solid",
          right: 0,
          bottom: 225,
          position: "fixed",
        }}
      >
        Wins: {gameState.player.score}
      </div>
    </>
  );
}
