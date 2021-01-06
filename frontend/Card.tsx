import { CARD_FORMAT, ICard } from "../common.typings";

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
        margin: 10,
        width: 100,
        height: 100,
        color: "white",
        boxShadow: props.isChosen ? "0 0 10px blue" : "unset",
        backgroundColor:
          props.card.format === CARD_FORMAT.PIKES ||
          props.card.format === CARD_FORMAT.CLOVERS
            ? "black"
            : "red",
      }}
    >
      {props.card.number} of {props.card.format}
    </div>
  );
}
