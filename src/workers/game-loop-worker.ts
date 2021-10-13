import { Game } from "../types/game";

console.log('I am a worker');

const session = 'sLxzloi';
const game = new Game(session);
console.log('Worker has a character at level', game.character.level);
