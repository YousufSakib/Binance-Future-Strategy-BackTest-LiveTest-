import { decidePosition } from "../strategy/decidePosition.js";
import { checkLiquidationAndExits } from "../riskManagement/positionManagement.js";
import logger from "../helpers/logger.js";
import { calculateRealizedPnL } from "../riskManagement/calculator.js";

export function TradeWorkflowEngine(executionProfile) {

    const {
        position: {
            positionHistory,
            openPositions
        },
        config: {
            leverage,
            positionSizeUSDT
        },
        strategy: {
            window,
            runningTimeSec
        },
        variation: {
            slRate,
            tpRate,
            windowSize
        },
        performance
    } = executionProfile;

    this.positionHistory = positionHistory;
    this.openPositions = openPositions;

    this.performance = performance;
    
    this.strategy = {};
    this.strategy.window = window;
    this.strategy.windowSize = windowSize;
    this.strategy.runningTimeSec = runningTimeSec;
    
    this.positionSizeUSDT = positionSizeUSDT;
    this.leverage = leverage;
    this.slRate = slRate;
    this.tpRate = tpRate;
}

TradeWorkflowEngine.prototype.nextTick = function ({ ohlc }) {

    this.markPrice = ohlc.closePrice;
    this.ohlc = ohlc;

    decidePosition.bind(this)({
        openNewPosition: ({ side, symbol }) => {
            
            const quantity = this.positionSizeUSDT / this.markPrice;
            const allocatedMargin = this.positionSizeUSDT / this.leverage;
            
            const position = { symbol, entryPrice: this.markPrice, side, entryTime: this.ohlc.eventTime, quantity, allocatedMargin };
            this.openPositions.push(position);
            
            logger.info(`New Position of ${symbol.toUpperCase()}. Entryprice: $${this.markPrice}, Quantity: ${quantity} ( ${side} )`);
        }
    });

    checkLiquidationAndExits.bind(this)({

        closeAPosition: ({ reason, pos, index }) => {
            
            const { grossPnL, totalFee, netPnL, netRoePercentage } = calculateRealizedPnL({ ...pos, markPrice: this.markPrice });
            const closedPosition = { ...pos, exitPrice: this.markPrice, exitTime: this.ohlc.eventTime, totalFee, netPnL, netRoePercentage, tpHit: false, slHit: false, liquidated: false, ...reason };
            this.positionHistory.push(closedPosition);
            this.openPositions.splice(index, 1);
            logger.info(`Closed a position of ${pos.symbol.toUpperCase()}. Exitprice: $${this.markPrice}, netPnL: ${netPnL}, netRoePercentage: ${netRoePercentage} (${pos.side})`);
        }
    })
}


// openPositions Schema:   { symbol, entryPrice, side, entryTime, quantity, allocatedMargin }
// positionHistory Schema: { symbol, entryPrice, side, entryTime, quantity, allocatedMargin, exitPrice, exitTime, totalFee, netPnL, netRoePercentage, tpHit, slHit, liquidated }