import { useContext } from "react";
import { GameStateContext } from "./GameStateContext";
//@ts-ignore
import cardBackAsPng from "./card-back.png";

export default function OtherPlayerCards() {
  const gameState = useContext(GameStateContext);

  return (
    <div className="other-player-cards">
      {Array(gameState.otherPlayer.cardsLength)
        .fill(1)
        .map((_, index: number) => (
          <div
            key={index}
            style={{
              width: 20,
            }}
          >
            <div
              className="opponent-card"
              style={{
                width: 60,
                height: 90,
                backgroundSize: 60,
                backgroundImage: `url(${cardBackAsPng})`,
              }}
            />
          </div>
        ))}
    </div>
  );
}
