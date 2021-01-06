import { CARD_FORMAT, ICardNumber } from "../common.typings";

export default function Card(props: {
  number: ICardNumber;
  format: CARD_FORMAT;
  onClick?: () => void;
  isChosen?: boolean;
}) {
  return (
    <div
      onClick={props.onClick}
      style={{
        display: "inline-block",
        margin: 10,
        width: 100,
        height: 100,
        color: "white",
        boxShadow: props.isChosen ? "0 0 10px blue" : "unset",
        backgroundColor:
          props.format === CARD_FORMAT.PIKES ||
          props.format === CARD_FORMAT.CLOVERS
            ? "black"
            : "red",
      }}
    >
      {props.number} of {props.format}
    </div>
  );
}
