import { CARD_FORMAT, ICard } from "../common.typings";

export default function CardDrawer(props: { card: ICard }) {
  let height = -10;
  if (props.card.format === CARD_FORMAT.HEARTS) height = -234;
  if (props.card.format === CARD_FORMAT.DIAMONDS) height = -458;
  if (props.card.format === CARD_FORMAT.CLUBS) height = -681;

  return (
    <div
      className="card-drawer"
      style={{
        backgroundPositionX: -7 + (props.card.number - 1) * -153,
        backgroundPositionY: height,
      }}
    />
  );
}
