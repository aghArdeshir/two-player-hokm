import { ICard } from "../common.typings";
import CardDrawer from "./CardDrawer";

export default function Card(props: {
  card: ICard;
  onClick?: (card: ICard) => void;
  isChosen?: boolean;
}) {
  return (
    <div
      onClick={() => props.onClick(props.card)}
      style={{
        display: "inline-block",
        boxShadow: props.isChosen ? "0 0 10px blue" : "unset",
      }}
    >
      <CardDrawer card={props.card} />
    </div>
  );
}
