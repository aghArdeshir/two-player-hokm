import { useContext } from "react";
import { GameStateContext } from "./GameStateContext";
import { ICard } from "../common.typings";
import Card from "./Card";

export default function PlayerCards() {
  const gameState = useContext(GameStateContext);

  return (
    <>
      These are your cards:
      <br />
      {gameState.player.cards.map((card: ICard) => (
        <Card
          key={card.number + card.format}
          format={card.format}
          number={card.number}
        />
      ))}
      <br />
    </> 
  );
}
