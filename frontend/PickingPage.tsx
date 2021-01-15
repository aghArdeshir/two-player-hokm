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
    return (
      <p
        style={{
          top: "calc(50% - 75px)",
          position: "fixed",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        other player is picking cards
      </p>
    );
  }

  if (gameState.cardsToChoose)
    return (
      <>
        Click on one card to pick it. The other card will be dropped!
        <br />
        {gameState.cardsToChoose.map((card) => (
          <Card
            card={card}
            onClick={() => socketService.pickCard(card)}
            key={card.format + card.number}
          />
        ))}
      </>
    );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        top: "calc(50% - 75px)",
        position: "fixed",
        left: "50%",
        transform: "translate(-50%, -50%)",
      }}
    >
      <Card
        card={gameState.cardToChoose}
        style={{ transform: "scale(0.72)", transformOrigin: "bottom" }}
      />
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
