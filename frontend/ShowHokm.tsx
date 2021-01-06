import { useContext } from "react";
import { isChooseHokm } from "./ChooseHokm";
import { GameStateContext } from "./GameStateContext";

export default function ShowHokm() {
  const gameContext = useContext(GameStateContext);

  if (isChooseHokm(gameContext)) return <></>;

  return <span>hokm is {gameContext.hokm}</span>;
}
