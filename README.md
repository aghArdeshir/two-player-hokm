# Two-Player Hokm

I recently wrote a two-player **Hokm** game! Because it is such a fun piece of code to write, it is fun to play and it helps me in my career by making me face new challenges that I've never had; plus building up my resume.

# Idea

The idea comes from my wife Tannaz. From the first moment I thought about it I loved it. The original idea behind it was to have a game of our own that we could play in spare time when we are not next to each other.

# Challenges

I faced different challenges, easy & hard. I list the ones that I personally found exciting and what steps I took to solve them.

## Stabilizing & Managing WebSocket Connection

- As I mentioned above, the main idea comes from \`having a game of our own that we could play in spare time\` and that \`spare time\` was mostly in metro/subway heading home; where there is weak/unstable internet connection. We faced this issue at the very beginning of development and testing phase and we found out that if a connection is lost, there is no way to continue the game, and we faced it almost every time we played.
- Later I put a **Live-Indicator** circle in the corner of screen which turned **orange** on heartbeat delay and **red** on lost connection and **green** when everything is normal. The heartbeats were sent, received & managed manually although I was using **Socket.io** (which has built-in heartbeat support). Sending and receiving heartbeats manually, first of all, was an enjoyable piece of code to write, and also it gave me more control over inspecting connections and deciding based on different behaviors I perceived from heartbeats. (I'm lying, I was just lazy to read the documentation)
- The current state of the game is that each player has a unique uuid which maps to an object containing a player, a connection, and a game. The `uuid` was first stored in cookies, making the server all responsible for handling/storing it; but later moved to `localStorage` which comes to action only on co-operation of front-end and back-end. I have a **Bad** feeling for cookies, I just don't like them. So I don't use them.
- Having this map of `uuid` to `{ player, game, connection }`, made connections stable; so stable that even on browser refresh, on browser close/reopen and on closing and re-opening connection, I can update the corresponding `uuid`'s `connection` and start talking to it. This way front-end can, on recognizing bad connection, try to re-connect; and user can, on detecting bad internet connection or bad state of the game, try to refresh browser which gives a better feeling about the stability of the new connection and continue the game. Have you ever felt like when you write a code **right**, everything suddenly starts working, you get ideas for solving other problems, and you get to remove lots of ugly code? Well, this was one of that moments.

## Preventing Cheating/Hacking

- I wrote game logic twice. In both cases, back-end was the single source of truth, but in my first try, I was relying heavily on front-end sending the correct data over the WebSocket connection. This led to two major problems:
  - It was driving the code to an absolute mess. having logic control codes everywhere.
  - It was prone to cheating. Although the game was meant to be played just by me & friends, it still was a bad practice, it ruined future-proofity of the game (if one day it became the #1 top-selling game in the world), and come on! The whole point of writing this code was the fun of new challenges that emerge. This was the most enjoyable.
- In my second re-write of the game (which is the foundation of current state of the code) I depended heavily on `TypeScript`. Before writing any logic, I wrote a file common to front-end and back-end code, that defined all types in the game. By types, I mean states of the game at any given moment, actions player could do, card entity, player entity, `otherPlayer` entity (from prespective of each player, there is one `player` and one `otherPlayer`; more below ↓ ) and events that the game, itself, could fire (related to connections between front-end and back-end). I think this is super-awesome that we can share code/typings in back-end and front-end code nowadays. The most thing I loved about it is the **end-to-end type-safety** you get.
- In current state of the game strict logical checks (and even sometimes double-checks) of every player action is done in the back-end (there is a `Game` class which has most logic in it). Like:
  - If the player has the card s/he intends to play
  - If it is valid to pick or refuse the suggested card
  - If it is actually player's turn to play
  - etc...
- As mentioned above, I have two terms: `Player` and `OtherPlayer`. From prespective of each player, there is a self, and an other. Suppose a real physical game with actual deck of cards on actual floor/table. You know everything about other player, his/her name, how many cards s/he holds, how many rounds s/he has won, if s/he is **Haakem** or not, etc... . The only difference between the knowledge about yourself in the game and the other player, is the actual cards you have. You do not know what cards the other player holds. This kind of game information privacy is exactly reflected in state management from back-end code.

## Drawing Cards on Screen

- Haha! This one is a cool one. In the early days of development I just wrote everything inside a box with a border, and it was either black or red. e.g.: `1 of Hearts`, `J of Spades`, `4 of Clubs`, etc... .
- Later I found a single [large-sized `png` image of a deck of cards](https://github.com/Ardeshir81/two-player-hokm/blob/master/frontend/deck.png) and I served it to the user. The image was like `a-few-thousands x a-few-thousands` pixels. I used it as background image of every card user had, and calculated `backgorund-position` css property based on the value of the card. I really loved this challenge. The mathematics was confusing for me at first.
- Later I found out the standard unicode characters of cards was available and introduced in Unicode 7.0+. Making each card just a few bytes in size. I found good support for those unicode characters almost everywhere. (except my own old LG phone)
- But where is the fun in using unicode characters? I later started designing game cards myself using HTML5 Canvas and will publish them as Web-Component someday.

## Clean Code

- Backend code is written in `NodeJS`, uses `Socket.io` as socket server and consists of five well-named files:
  - `Deck.ts`: running `new Deck()` gives you a shuffled set of 50 cards (in two-player hokm, two cards (in this case, 2 of diamonds & 2 of clubs) are dropped out in the bginning) with `shift` functionality.
  - `Player.ts`: Player class is just used as a data holder, with some minor cute methods like `hsaCard(2ofClubs/...)`, `hasCardOf(Clubs/Diamond/...)`, `incrementScore()`, etc...
  - `index.ts`: which bootstraps the server, serves static files, launches socket server, handles connections, players & games objects and listens to WebSocket events to invoke the right function of the right instance of the right class!
  - `Game.ts`: most of game logic is handled in this Game class. When two players are ready to play, they are passed to `new Game(player1, player2)` and any subsequent action from players is also sent down to this instance of the class. The instance keeps firing events of `GAME_STATE` and events are sent up to players in front-end.
  - `ConnectedPlayer.ts`: is a class whose instances hold a `Player`, a `Game` and a `Connection` (of Socket.io) object which are related together. (do you remember the `uuid` to player, connection and game object I told you about earlier?)
- Frontend code is mostly in `React`, has a single `socketService` and a single `GameStateContext`. The `socketService` updates the context and all components in app has access to the game state context. This architecture suits very well to a small codebase like this and leaves zero coupling in the minor modules.
- Also frontend code uses `CSS Grids` without considering any lack of support in not-up-to-date browsers. Bad practice? **NO**! I did not have the use-case/requirement.
- Choosing `CSS Grids` gave me the ability to render my components in the order that made sense to me and not worry about layout. It was amazing how much using a particular CSS Layout System could make my React code cleaner and simpler to reason about.

## UI/UX

- Definitely my Silver Bullet weak-point :)

# Deployment

- First, the project heavily depended on hard-coded config, like it must have been server from `/hokm/` prefix to work (as I deployed it on my personal domain, in `/hokm` url), or it has embedded script for restarting project using `pm2`. Also it heavily depended on being served from a specified nginx config (to redirect all from `/hokm` to `/hokm/`). Yep! This game did not work without that last `/` specified after `/hokm`

<br />
<br />
<br />
<br />
<br />

to test this:

```
git clone https://github.com/Ardeshir81/two-player-hokm.git ; cd two-player-hokm ; npm install ; npm start
```

Then open two browsers, both at `localhost:3000/hokm/`.

# TODO

- play some card games to gather ideas about how the ui should look like
- two-level card play. Click on a card prepare it, on clicking again, play it.
- set max-width to 560 or so... . emulating a mobile ???
- draw cards in canvas by yourself and publish as web-components
- pwa
- decide: making componenets know themselves if they should be rendered and then rendering all of them ??? VERSUS ::: decide if to render components or not ? and render them with cleaner code inside. and write about it in `Clean Code` section.
- remoe game deployment stuff from project. things like obligating serve from `/hokm/` prefix and usage of `pm2`
- sanitize `staticFileServer` to serve only valid files. no security hole!
- show other player's cards on finish on each round
- show if otherplayer is offline or has a weak connection
