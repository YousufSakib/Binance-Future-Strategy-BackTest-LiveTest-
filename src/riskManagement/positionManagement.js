import { calculateLiquidationPrice, check_liquidated, check_slHit, check_tpHit } from "./calculator.js";

export function checkLiquidationAndExits({ closeAPosition }) {

  //_____________Liquidation______________

  for (let i = 0; i < this.openPositions.length; i++) {
    const pos = this.openPositions[i];
    const liqudationPrice = calculateLiquidationPrice(pos);
    const isLiquidated = check_liquidated({ ...pos, liqudationPrice, markPrice: this.markPrice });
    if (isLiquidated) {
      closeAPosition({ pos, reason: { liquidated: true }, index: i });
    }
  }


  //____________Take Profit______________

  for (let i = 0; i < this.openPositions.length; i++) {
    const pos = this.openPositions[i];
    const isTpHit = check_tpHit({ ...pos, markPrice: this.markPrice, tpRate: this.tpRate });
    if (isTpHit) {
      closeAPosition({ pos, reason: { tpHit: true }, index: i });
    }
  }

  //_____________Stop Loss______________

  for (let i = 0; i < this.openPositions.length; i++) {
    const pos = this.openPositions[i];
    const isSlHit = check_slHit({ ...pos, markPrice: this.markPrice, slRate: this.slRate });

    if (isSlHit) {
      closeAPosition({ pos, reason: { slHit: true }, index: i });
    }
  }

}

