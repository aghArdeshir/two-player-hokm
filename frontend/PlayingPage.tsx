import { useContext } from "react";
import { GAME_ACTION } from "../common.typings";
import Card from "./Card";
import { GameStateContext } from "./GameStateContext";

export default function PlayingPage() {
  const gameState = useContext(GameStateContext);

  if (gameState.nextAction !== GAME_ACTION.PLAY) return <></>;

  return (
    <>
      {gameState.player.isTurn
        ? "Click on one of your cards above to play"
        : "Waiting for other player to play"}
      <br />
      {gameState.cardOnGround && <Card card={gameState.cardOnGround} />}
      {gameState.cardsOnGround && (
        <>
          <Card card={gameState.cardsOnGround[0]} />
          <Card card={gameState.cardsOnGround[1]} />
        </>
      )}
      <br />
      Your score is {gameState.player.score}
      <br />
      other player's score is {gameState.otherPlayer.score}
    </>
  );
}
