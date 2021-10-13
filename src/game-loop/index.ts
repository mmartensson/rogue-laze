import { Game } from "../types/game";

console.log('I am a worker');

const session = 'sLxzloi';
const game = new Game(session);
console.log('Worker has a character at level', game.character.level);

setTimeout(() => console.log('I am still a worker'), 5000);

self.onmessage = (ev: MessageEvent) => {
  console.log('Worker got data', ev.data);
  self.postMessage({
      character: game.character
  });
}