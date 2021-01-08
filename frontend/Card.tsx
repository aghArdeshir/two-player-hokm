import { CSSProperties } from "react";
import { ICard } from "../common.typings";
import CardDrawer from "./CardDrawer";

export default function Card(props: {
  card: ICard;
  onClick?: (card: ICard) => void;
  style?: CSSProperties;
}) {
  return (
    <div
      onClick={() => props.onClick(props.card)}
      style={{
        display: "inline-block",
        maxWidth: 40,
        ...(props.style || {}),
      }}
    >
      <CardDrawer card={props.card} />
    </div>
  );
}
