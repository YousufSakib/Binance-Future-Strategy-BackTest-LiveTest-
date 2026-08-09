function printPositions() {

  const markPrice = window[windowSec - 1];

  let closedLongPositionCnt = 0;
  let closedShortPositionCnt = 0;
  let openShortPositionsCnt = 0;
  let openLongPositionsCnt = 0;
  let totalAllocatedMargin = 0;

  let totalNetPnL = 0;
  let shortNetPnL = 0;
  let longNetPnL = 0;

  let totalUnrealizedPnl = 0;
  let totalNetUnrealizedPnl = 0;
  let shortNetUnrealizedPnl = 0;
  let longNetUnrealizedPnl = 0;

  let tpHitCnt = 0;
  let slHitCnt = 0;
  let liquidatedCnt = 0;



  for (let i = 0; i < openPositions.length; i++) {
    const pos = openPositions[i];
    const { side, entryPrice, quantity, allocatedMargin } = pos;

    const { unrealizedPnl, netUnrealizedPnl, netRoePercentage } = calculateUnrealizedPnl({ side, entryPrice, markPrice, quantity, allocatedMargin })

    totalUnrealizedPnl += unrealizedPnl;
    totalNetUnrealizedPnl += netUnrealizedPnl;
    totalAllocatedMargin += allocatedMargin;

    if (side.toUpperCase() === "SHORT") {
      openShortPositionsCnt++;
      shortNetUnrealizedPnl += unrealizedPnl;
    }
    if (side.toUpperCase() === "LONG") {
      openLongPositionsCnt++;
      longNetUnrealizedPnl += unrealizedPnl;
    }
  }

  for (let i = 0; i < positionHistory.length; i++) {
    const posHist = positionHistory[i];
    const { side, allocatedMargin, netPnL, tpHit, slHit, liqudated } = posHist;

    totalAllocatedMargin += allocatedMargin;
    totalNetPnL += netPnL;

    if (side.toUpperCase() === "SHORT") {
      shortNetPnL += netPnL;
      closedShortPositionCnt++;
    }
    if (side.toUpperCase() === "LONG") {
      longNetPnL += netPnL;
      closedLongPositionCnt++;
    }
    if (tpHit) tpHitCnt++;
    if (slHit) slHitCnt++;
    if (liqudated) liquidatedCnt++;
  }

  console.clear();
  console.log(`Short Open Position          : ${openShortPositionsCnt}`);
  console.log(`Long Open Position           : ${openLongPositionsCnt}`);
  console.log(`Closed short position        : ${closedShortPositionCnt}`);
  console.log(`Closed long position         : ${closedLongPositionCnt}`);
  console.log(`Total Allocated Margin       : ${totalAllocatedMargin}`);

  console.log();
  console.log(`Total net PnL                : ${totalNetPnL}`);
  console.log(`Long net PnL                 : ${longNetPnL}`);
  console.log(`Short net PnL                : ${shortNetPnL}`);
  console.log();

  console.log();
  console.log(`Total unrealized PnL         : ${totalUnrealizedPnl}`);
  console.log(`Total net unrealized PnL     : ${totalNetUnrealizedPnl}`);
  console.log(`Short net unrealized PnL     : ${shortNetUnrealizedPnl}`);
  console.log(`Long net unrealized PnL      : ${longNetUnrealizedPnl}`);
  console.log();

  console.log(`TP hit count                 : ${tpHitCnt}`);
  console.log(`SL hit count                 : ${slHitCnt}`);
  console.log(`liquidated count             : ${liquidatedCnt}`);
}
