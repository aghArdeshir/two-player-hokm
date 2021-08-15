import { useContext, useState } from "react";
import { GameStateContext } from "./GameStateContext";
import { CARD_SYMBOL_SUIT_ORDER, GAME_ACTION, ICard } from "../common.typings";
import Card from "./Card";
import { isEqual } from "lodash";
import { socketService } from "./socket-service";

function isValidToDrop(cards: ICard[]): cards is [ICard, ICard] {
  if (cards.length === 2) return true;
  return false;
}

export default function PlayerCards() {
  const gameState = useContext(GameStateContext);
  const [cardsToDrop, setCardsToDrop] = useState([]);

  function isChosen(card: ICard) {
    return cardsToDrop.findIndex((c) => isEqual(c, card)) > -1;
  }

  return (
    <>
      <div className="player-cards">
        {gameState.player.cards
          .sort((cardA, cardB) => {
            if (cardA.symbol === cardB.symbol) {
              if (cardA.number === 1) return -1;
              if (cardB.number === 1) return 1;
              return cardA.number > cardB.number ? -1 : 1;
            } else {
              if (
                CARD_SYMBOL_SUIT_ORDER.indexOf(cardA.symbol) <
                CARD_SYMBOL_SUIT_ORDER.indexOf(cardB.symbol)
              ) {
                return -1;
              }
              if (
                CARD_SYMBOL_SUIT_ORDER.indexOf(cardB.symbol) <
                CARD_SYMBOL_SUIT_ORDER.indexOf(cardA.symbol)
              ) {
                return 1;
              }
            }
          })
          .map((card: ICard, index: number) => (
            <Card
              key={card.symbol + card.number}
              card={card}
              style={{
                transform: isChosen(card) ? "translateY(-10px)" : "unset",
                transition: "all 0.4s",
                zIndex: index + 1,
                position: "relative",
              }}
              onClick={(card) => {
                if (
                  gameState.nextAction === GAME_ACTION.DROP_TWO &&
                  gameState.player.cardsLength > 3
                ) {
                  if (isChosen(card)) {
                    setCardsToDrop((ctd) =>
                      ctd.filter((c) => !isEqual(c, card))
                    );
                  } else {
                    if (cardsToDrop.length === 2) {
                      setCardsToDrop((ctd) => ctd.slice(1));
                    }
                    setCardsToDrop((ctd) => ctd.concat(card));
                  }
                }

                if (
                  gameState.nextAction === GAME_ACTION.PLAY &&
                  gameState.player.isTurn &&
                  (card.symbol === gameState.cardOnGround?.symbol ||
                    !gameState.player.cards.find(
                      (c) => c.symbol === gameState.cardOnGround?.symbol
                    ) ||
                    !gameState.cardOnGround)
                ) {
                  socketService.play(card);
                }
              }}
            />
          ))}
      </div>
      {cardsToDrop.length === 2 ? (
        <button
          className="drop-cards-button action-button"
          onClick={() => {
            if (isValidToDrop(cardsToDrop)) {
              socketService.dropTwo(cardsToDrop);
              setCardsToDrop([]);
            }
          }}
        >
          ✓ Drop
        </button>
      ) : (
        <></>
      )}
    </>
  );
}
