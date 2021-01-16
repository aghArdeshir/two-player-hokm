import { CSSProperties, useContext } from "react";
import { ICard } from "../common.typings";
import CardDrawer from "./CardDrawer";
import { GameStateContext } from "./GameStateContext";

export default function Card(props: {
  card: ICard;
  onClick?: (card: ICard) => void;
  style?: CSSProperties;
}) {
  const gameState = useContext(GameStateContext);

  return (
    <div
      onClick={() => {
        if (props.onClick) props.onClick(props.card);
      }}
      className="card"
      style={{
        ...(props.style || {}),
      }}
    >
      <CardDrawer card={props.card} />
    </div>
  );
}
