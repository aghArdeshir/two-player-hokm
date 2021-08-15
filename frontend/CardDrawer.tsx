import { CARD_SYMBOL, ICard } from "../common.typings";

export default function CardDrawer(props: { card: ICard }) {
  let height = -5;
  if (props.card.symbol === CARD_SYMBOL.HEARTS) height = -156;
  if (props.card.symbol === CARD_SYMBOL.DIAMONDS) height = -306;
  if (props.card.symbol === CARD_SYMBOL.CLUBS) height = -456;

  return (
    <div
      className="card-drawer"
      data-number={props.card.number}
      data-symbol={props.card.symbol}
      style={{
        backgroundPositionX: -7 + (props.card.number - 1) * -103,
        backgroundPositionY: height,
      }}
    />
  );
}
