
let runningTimeSec = "";

export function decidePosition(data) {

  if (runningTimeSec === "") runningTimeSec = data.eventTime;
  else if (data.eventTime === runningTimeSec) return;
  else runningTimeSec = data.eventTime;

  if (window.length < windowSec) {
    window.push(data.closePrice);
    return;
  }
  else {
    for (let i = 1; i < windowSec; i++) {
      window[i - 1] = window[i];
    }
    window[windowSec - 1] = data.closePrice;
  }

  let shouldOpenShort = true;
  let shouldOpenLong = true;
  const markPrice = window[windowSec - 1];

  //_________________________Open Position___________________________

  for (let i = 0; i < windowSec - 1; i++) {
    if (markPrice >= window[i]) {
      shouldOpenLong = false;
    }
    if (markPrice <= window[i]) {
      shouldOpenShort = false;
    }
  }

  if (shouldOpenLong) {
    console.log(`New Position, Entry: ${markPrice} ( Long )`);
    const allocatedMargin = (quantity * markPrice) / leverage;
    const position = { entryPrice: markPrice, side: "long", entryTime: data.eventTime + 600, quantity, allocatedMargin };
    openPositions.push(position);
  }

  if (shouldOpenShort) {
    console.log(`New Position, Entry: ${markPrice} ( Short )`);
    const allocatedMargin = (quantity * markPrice) / leverage;
    const position = { entryPrice: markPrice, side: "short", entryTime: data.eventTime + 600, quantity, allocatedMargin }
    openPositions.push(position);
  }
}
