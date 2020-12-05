import { useContext } from "react";
import { GameStateContext } from "./GameStateContext";

export default function ShowHokm() {
  const gameContext = useContext(GameStateContext);

  if (!gameContext.hokm) return <></>;

  return <span>hokm is {gameContext.hokm}</span>;
}
