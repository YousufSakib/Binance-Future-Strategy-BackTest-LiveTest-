export function decidePosition({ openNewPosition }) {

  const self = this.strategy;

  if (self.runningTimeSec === "") self.runningTimeSec = this.ohlc.eventTime;
  else if (this.ohlc.eventTime === self.runningTimeSec) return;
  else self.runningTimeSec = this.ohlc.eventTime;

  if (self.window.length < self.windowSize) {
    self.window.push(this.markPrice);
    return;
  }
  else {
    for (let i = 1; i < self.windowSize; i++) {
      self.window[i - 1] = self.window[i];
    }
    self.window[self.windowSize - 1] = this.markPrice;
  }

  let shouldOpenShort = true;
  let shouldOpenLong = true;

  //__________Open Position____________

  for (let i = 0; i < self.windowSize - 1; i++) {
    if (this.markPrice >= self.window[i]) {
      shouldOpenLong = false;
    }
    if (this.markPrice <= self.window[i]) {
      shouldOpenShort = false;
    }
  }

  if (shouldOpenLong) {
    openNewPosition({ side: "long", symbol: this.ohlc.symbol })
  }

  if (shouldOpenShort) {
    openNewPosition({ side: "short", symbol: this.ohlc.symbol })
  }
}
