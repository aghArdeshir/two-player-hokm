import { useContext, useState } from "react";
import { GameStateContext } from "./GameStateContext";
import { CARD_FORMAT, GAME_ACTION, ICard } from "../common.typings";
import Card from "./Card";
import { isEqual } from "lodash";
import { socketService } from "./socket-service";
import { useBooleanState } from "./LoginPage";

function isValidToDrop(cards: ICard[]): cards is [ICard, ICard] {
  if (cards.length === 2) return true;
  return false;
}

const CARD_FORMAT_SUIT_ORDER = [
  CARD_FORMAT.SPADES,
  CARD_FORMAT.HEARTS,
  CARD_FORMAT.CLUBS,
  CARD_FORMAT.DIAMONDS,
];

export default function PlayerCards() {
  const gameState = useContext(GameStateContext);
  const [cardsToDrop, setCardsToDrop] = useState([]);
  const [dropped, setDropped] = useBooleanState();

  function isChosen(card: ICard) {
    return cardsToDrop.indexOf(card) > -1;
  }

  let cardsToList = gameState.player.cards;
  if (gameState.nextAction === GAME_ACTION.DROP_TWO && dropped) {
    cardsToList = gameState.player.cards.filter(
      (card) => cardsToDrop.indexOf(card) === -1
    );
  }

  return (
    <>
      These are your cards:
      <br />
      {cardsToList
        .sort((cardA, cardB) => {
          if (cardA.format === cardB.format) {
            if(cardA.number === 1) return -1;
            if(cardB.number === 1) return 1;
            return cardA.number > cardB.number ? -1 : 1;
          } else if (cardA.format === gameState.hokm) {
            return -1;
          } else if (cardB.format === gameState.hokm) {
            return 1;
          } else {
            if (
              CARD_FORMAT_SUIT_ORDER.indexOf(cardA.format) <
              CARD_FORMAT_SUIT_ORDER.indexOf(cardB.format)
            ) {
              return -1;
            }
            if (
              CARD_FORMAT_SUIT_ORDER.indexOf(cardB.format) <
              CARD_FORMAT_SUIT_ORDER.indexOf(cardA.format)
            ) {
              return 1;
            }
          }
        })
        .map((card: ICard, index: number) => (
          <Card
            key={card.format + card.number}
            card={card}
            style={{
              transform: isChosen(card) ? "translateY(60px)" : "unset",
              transition: "all 0.4s",
              zIndex: index + 1,
              position: "relative",
            }}
            onClick={(card) => {
              if (gameState.nextAction === GAME_ACTION.DROP_TWO && !dropped) {
                if (isChosen(card)) {
                  setCardsToDrop((ctd) => ctd.filter((c) => !isEqual(c, card)));
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
                (card.format === gameState.cardOnGround?.format ||
                  !gameState.player.cards.find(
                    (c) => c.format === gameState.cardOnGround?.format
                  ) ||
                  !gameState.cardOnGround)
              ) {
                socketService.play(card);
              }
            }}
          />
        ))}
      <br />
      {gameState.nextAction === GAME_ACTION.DROP_TWO ? (
        <>
          {dropped ? (
            <>Waiting for other player to drop cards</>
          ) : (
            <>
              <h4>Please choose two cards to drop out</h4>
              <button
                disabled={cardsToDrop.length !== 2}
                onClick={() => {
                  if (isValidToDrop(cardsToDrop)) {
                    socketService.dropTwo(cardsToDrop);
                  }
                  setDropped();
                }}
              >
                DROP
              </button>
            </>
          )}
        </>
      ) : (
        <></>
      )}
    </>
  );
}
