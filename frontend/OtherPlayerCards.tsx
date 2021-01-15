import { useContext } from "react";
import { GameStateContext } from "./GameStateContext";
//@ts-ignore
import cardBackAsPng from "./card-back.png";

export default function OtherPlayerCards() {
  const gameState = useContext(GameStateContext);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        display: "flex",
        left: "50%",
        transform: "translateX(-50%)",
      }}
    >
      {Array(gameState.otherPlayer.cardsLength)
        .fill(1)
        .map((_, index: number) => (
          <div
            key={index}
            style={{
              width: 20,
              boxShadow: "0 0 10px black",
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
