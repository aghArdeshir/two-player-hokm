import { CARD_FORMAT, ICardNumber } from "../common.typings";

export default function Card(props: {
  number: ICardNumber;
  format: CARD_FORMAT;
}) {
  return (
    <div
      style={{
        display: "inline-block",
        margin: 10,
        width: 100,
        height: 100,
        color: "white",
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
