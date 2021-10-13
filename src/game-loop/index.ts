import { FAST_FORWARD_PROGRESS_INTERVAL } from "../shared/constants";
import { FastForwardProgressMessage, TickProgressMessage, UiOriginMessage } from "../shared/messages";
import { Game } from "./game";

console.log('Game loop worker started and awaiting session.');

let running = false;

self.onmessage = (ev: MessageEvent<UiOriginMessage>) => {
  if (ev.data.type === 'init') {
    loop(ev.data.session);
  }
}

async function loop(session: string) {
  const game = new Game(session);
  running = true;

  let fastForward = false;
  let lastProgress = 0;

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
          };
          self.postMessage(progress);
          lastProgress = now;
        }        
      } else {
        const progress: TickProgressMessage = {
          type: 'tick-progress',
          currentTick: current,
          character: game.character
        };
        self.postMessage(progress);
      }  
    }
  }
}