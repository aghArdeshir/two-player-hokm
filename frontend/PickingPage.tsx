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
    return <p className="player-action">other player is picking cards</p>;
  }

  if (gameState.cardsToChoose)
    return (
      <>
        <div className="player-action">
          Click on one card to pick it. The other card will be dropped!
        </div>
        <div className="card-to-accept-refuse">
          <div style={{ display: "flex" }}>
            {gameState.cardsToChoose.map((card) => (
              <Card
                card={card}
                onClick={() => socketService.pickCard(card)}
                key={card.format + card.number}
              />
            ))}
          </div>
        </div>
      </>
    );

  return (
    <>
      <div className="card-to-accept-refuse">
        <Card card={gameState.cardToChoose} />
      </div>
      <button
        disabled={gameState.mustRefuseCard}
        className="accept-card"
        onClick={() => socketService.pickCard()}
      >
        I want it
      </button>
      <button
        disabled={gameState.mustPickCard}
        className="refuse-card"
        onClick={() => socketService.refuseCard()}
      >
        I DON'T want it
      </button>
    </>
  );
}
