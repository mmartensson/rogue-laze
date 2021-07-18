import { AleaPRNG, mkAlea } from '@spissvinkel/alea';

export class PRNG {
  alea: AleaPRNG;

  constructor(seed: string) {
    this.alea = mkAlea(seed);
  }

  pick<T>(alternatives: T[]): T {
    return alternatives[this.alea.uint32() % alternatives.length];
  }

  fraction() {
    return this.alea.random();
  }
}
