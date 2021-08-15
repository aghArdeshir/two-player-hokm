import { useContext, useEffect, useRef, useState } from "react";
import { GAME_ACTION } from "../common.typings";
import Card from "./Card";
import { GameStateContext } from "./GameStateContext";
import { socketService } from "./socket-service";

const AUTO_SELECT_TIEMOUT = 1;

export default function PickingPage() {
  const gameState = useContext(GameStateContext);
  const [countdown, setCountdown] = useState(AUTO_SELECT_TIEMOUT);
  const intervalRef = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    if (
      gameState.nextAction === GAME_ACTION.PICK_CARDS &&
      gameState.player.isTurn
    ) {
      if (gameState.mustPickCard || gameState.mustRefuseCard) {
        intervalRef.current = setInterval(() => {
          console.log("OH SHIT");
          setCountdown((c) => {
            if (c > 0) {
              return c - 0.1;
            } else {
              clearInterval(intervalRef.current);
              setCountdown(AUTO_SELECT_TIEMOUT);
            }
          });
        }, 100);
      }
    } else {
      clearInterval(intervalRef.current);
      setCountdown(AUTO_SELECT_TIEMOUT);
    }
  }, [gameState]);

  useEffect(() => {
    if (countdown <= 0) {
      if (
        gameState.nextAction === GAME_ACTION.PICK_CARDS &&
        gameState.player.isTurn
      ) {
        clearInterval(intervalRef.current);
        setCountdown(AUTO_SELECT_TIEMOUT);
        if (gameState.mustPickCard) {
          socketService.pickCard();
        } else if (gameState.mustRefuseCard) {
          socketService.refuseCard();
        }
      }
    }
  }, [gameState, countdown]);

  if (
    gameState.nextAction !== GAME_ACTION.PICK_CARDS ||
    (gameState.nextAction === GAME_ACTION.PICK_CARDS &&
      !gameState.player.isTurn)
  )
    return <></>;

  if (gameState.cardsToChoose)
    return (
      <>
        <div className="card-to-accept-refuse">
          <div style={{ display: "flex" }}>
            {gameState.cardsToChoose.map((card) => (
              <Card
                card={card}
                onClick={() => socketService.pickCard(card)}
                key={card.symbol + card.number}
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
        className="accept-card action-button"
        onClick={() => socketService.pickCard()}
      >
        👍 Pick{" "}
        {countdown && gameState.mustPickCard ? countdown.toFixed(1) : ""}
      </button>
      <button
        disabled={gameState.mustPickCard}
        className="refuse-card action-button"
        onClick={() => socketService.refuseCard()}
      >
        👎 Pass{" "}
        {countdown && gameState.mustRefuseCard ? countdown.toFixed(1) : ""}
      </button>
    </>
  );
}
