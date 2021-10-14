import { FAST_FORWARD_PROGRESS_INTERVAL } from "../shared/constants";
import type { FastForwardProgressMessage, TickProgressMessage, UiOriginMessage } from "../shared/messages";
import { Game } from "./game";

console.log('Game loop worker started and awaiting session.');

let running = false;

self.onmessage = (ev: MessageEvent<UiOriginMessage>) => {
  if (ev.data.type === 'init') {
    loop(ev.data.session);
  } else if (ev.data.type === 'shutdown') {
    running = false;
    console.log('Game loop worker shutting down');
  }
}

async function loop(session: string) {
  console.log('Game loop worker assigned session', session);

  const game = new Game(session);
  running = true;

  let fastForward = false;
  let lastProgress = 0;

  const createSnapshot = () => {
    return {
      character: game.character,
      mapSize: game.dungeon?.mapSize,
      location: game.dungeon?.location,
      rooms: game.dungeon?.rooms,
    }
  };

  const initalProgress: TickProgressMessage = {
    type: 'tick-progress',
    currentTick: 0,
    snapshot: createSnapshot()
  };
  self.postMessage(initalProgress);

  while (running) {
    const tickEvent = await game.scheduledTick();
    const { max, current } = tickEvent;

    if (max !== undefined && current !== undefined) {
      const diff = max - current;
      if (diff > 100 && !fastForward) {
        fastForward = true;
        console.log(`Fast forwarding started. Currenly at tick ${current} of ${max}`);
        lastProgress = 0;
      }
      if (diff < 5 && fastForward) {
        fastForward = false;
        console.log(`Fast forwarding ended. Currenly at tick ${current}`);
      }

      if (fastForward) {
        const now = +new Date();
        if (now - lastProgress > FAST_FORWARD_PROGRESS_INTERVAL) {
          const progress: FastForwardProgressMessage = {
            type: 'fast-forward-progress',
            currentTick: current,
            maximumTick: max,
            snapshot: createSnapshot()
          };
          self.postMessage(progress);
          lastProgress = now;
        }        
      } else {
        const progress: TickProgressMessage = {
          type: 'tick-progress',
          currentTick: current,
          snapshot: createSnapshot()
        };
        self.postMessage(progress);
      }  
    }
  }
}