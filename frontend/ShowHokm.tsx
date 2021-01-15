import { useContext } from "react";
import { isChooseHokm } from "./ChooseHokm";
import FormatDrawer from "./FormatDrawer";
import { GameStateContext } from "./GameStateContext";

export default function ShowHokm() {
  const gameContext = useContext(GameStateContext);

  if (isChooseHokm(gameContext)) return <></>;

  return (
    <div
      style={{
        position: "fixed",
        top: "calc(50% - 50px)",
        border: "1px solid",
        right: 0,
      }}
    >
      Hokm:
      <br />
      <FormatDrawer format={gameContext.hokm} />
    </div>
  );
}
