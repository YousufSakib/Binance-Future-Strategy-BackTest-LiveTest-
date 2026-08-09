function checkLiquidationAndExits(data) {

  const markPrice = window[windowSec - 1];

  //_________________________Liquidation_____________________________

  for (let i = 0; i < openPositions.length; i++) {
    const pos = openPositions[i];
    const { entryPrice, quantity, allocatedMargin, side } = pos;
    const liqudationPrice = calculateLiquidationPrice({ side, entryPrice, quantity, allocatedMargin });
    const isLiquidated = check_liquidated({ liqudationPrice, markPrice, side });
    if (isLiquidated) {
      console.log(`A ${side.toUpperCase()} position liquidated. Exit price: $${markPrice}`);
      const { grossPnL, totalFee, netPnL, netRoePercentage } = calculateRealizedPnL({ side, entryPrice, markPrice, quantity, allocatedMargin });
      const closedPosition = { ...pos, exitPrice: markPrice, exitTime: data.eventTime = 600, totalFee, netPnL, netRoePercentage, tpHit: false, slHit: false, liqudated: true };
      positionHistory.push(closedPosition);
      openPositions.splice(i, 1);
    }
  }


  //_________________________Take Profit______________________________

  for (let i = 0; i < openPositions.length; i++) {
    const pos = openPositions[i];
    const { entryPrice, side, quantity, allocatedMargin } = pos;
    const isTpHit = check_tpHit({ entryPrice, markPrice, tpRate, side });

    if (isTpHit) {
      console.log(`A ${side.toUpperCase()} position TP hit. Exit price: $${markPrice}`);
      const { grossPnL, totalFee, netPnL, netRoePercentage } = calculateRealizedPnL({ side, entryPrice, markPrice, quantity, allocatedMargin })
      const closedPosition = { ...pos, exitPrice: markPrice, exitTime: data.eventTime + 600, totalFee, netPnL, netRoePercentage, tpHit: true, slHit: false, liqudated: false };
      positionHistory.push(closedPosition);
      openPositions.splice(i, 1);
    }
  }

  //_________________________Stop Loss____________________________

  for (let i = 0; i < openPositions.length; i++) {
    const pos = openPositions[i];
    const { entryPrice, side, quantity, allocatedMargin } = pos;
    const isSlHit = check_slHit({ entryPrice, markPrice, slRate, side });

    if (isSlHit) {
      console.log(`A ${side.toUpperCase()} position hit SL, Entry ($${entryPrice}), Close ($${markPrice})`);
      const { grossPnL, totalFee, netPnL, netRoePercentage } = calculateRealizedPnL({ side, entryPrice, markPrice, quantity, allocatedMargin })
      const closedPosition = { ...pos, exitPrice: markPrice, exitTime: data.eventTime + 600, totalFee, netPnL, netRoePercentage, tpHit: false, slHit: true, liqudated: false };
      positionHistory.push(closedPosition);
      openPositions.splice(i, 1);
    }
  }

}


// { entryPrice, side, entryTime, quantity, allocatedMargin, exitPrice, exitTime, totalFee, netPnL, netRoePercentage, tpHit, slHit, liqudated };

