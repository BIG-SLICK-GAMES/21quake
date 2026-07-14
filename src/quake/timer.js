export const TIMER_MAX_SECONDS = 60;
export const TIMER_REFILL_STEP = 5;
export const TIMER_MIN_REFILL_SECONDS = 10;

export function createQuakeTimer() {
  let secondsRemaining = TIMER_MAX_SECONDS;
  let nextRefillSeconds = TIMER_MAX_SECONDS - TIMER_REFILL_STEP;

  function snapshot() {
    return {
      maxSeconds: TIMER_MAX_SECONDS,
      secondsRemaining,
      nextRefillSeconds,
      filledTicks: secondsRemaining
    };
  }

  function tick() {
    secondsRemaining = Math.max(0, secondsRemaining - 1);
    return snapshot();
  }

  function refillAfterQuake() {
    secondsRemaining = nextRefillSeconds;
    nextRefillSeconds = Math.max(TIMER_MIN_REFILL_SECONDS, nextRefillSeconds - TIMER_REFILL_STEP);
    return snapshot();
  }

  function reset() {
    secondsRemaining = TIMER_MAX_SECONDS;
    nextRefillSeconds = TIMER_MAX_SECONDS - TIMER_REFILL_STEP;
    return snapshot();
  }

  function isExpired() {
    return secondsRemaining <= 0;
  }

  return {
    isExpired,
    refillAfterQuake,
    reset,
    snapshot,
    tick
  };
}
