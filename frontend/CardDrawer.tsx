import { CARD_FORMAT, ICard } from "../common.typings";

export default function CardDrawer(props: { card: ICard }) {
  let height = -5;
  if (props.card.format === CARD_FORMAT.HEARTS) height = -156;
  if (props.card.format === CARD_FORMAT.DIAMONDS) height = -306;
  if (props.card.format === CARD_FORMAT.CLUBS) height = -456;

  return (
    <div
      className="card-drawer"
      data-number={props.card.number}
      data-format={props.card.format}
      style={{
        backgroundPositionX: -7 + (props.card.number - 1) * -103,
        backgroundPositionY: height,
      }}
    />
  );
}
