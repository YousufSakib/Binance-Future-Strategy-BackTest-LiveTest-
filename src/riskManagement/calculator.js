import { assertRequiredParams } from "../helpers/validator.js";

export function calculateLiquidationPrice({
    side,
    entryPrice,
    quantity,
    allocatedMargin,
    mmr = 0.005,
    cumMaintenanceAmount = 0
}) {

    assertRequiredParams({ side, entryPrice, quantity, allocatedMargin }, "calculateLiquidationPrice");

    const positionValue = entryPrice * quantity;
    const normalizedSide = side.toUpperCase();

    let liqPrice = 0;

    if (normalizedSide === 'LONG') {
        // LONG Liquidation Formula
        liqPrice = (positionValue - allocatedMargin - cumMaintenanceAmount) / (quantity * (1 - mmr));
    } else if (normalizedSide === 'SHORT') {
        // SHORT Liquidation Formula
        liqPrice = (positionValue + allocatedMargin + cumMaintenanceAmount) / (quantity * (1 + mmr));
    } else {
        throw new Error("Side must be either 'LONG' or 'SHORT'");
    }

    return Math.max(0, Number(liqPrice.toFixed(4)));
}

export function calculateRealizedPnL({
    side,
    entryPrice,
    markPrice,
    quantity,
    allocatedMargin,
    entryFeeRate = 0.0005,
    exitFeeRate = 0.0005
}) {

    assertRequiredParams({ side, entryPrice, markPrice, quantity, allocatedMargin }, "calculateRealizedPnL");
    
    const normalizedSide = side.toUpperCase();

    let grossPnL = 0;
    if (normalizedSide === 'LONG') {
        grossPnL = (markPrice - entryPrice) * quantity;
    } else if (normalizedSide === 'SHORT') {
        grossPnL = (entryPrice - markPrice) * quantity;
    } else {
        throw new Error("Side must be either 'Long' or 'Short'!");
    }

    const entryFee = (entryPrice * quantity) * entryFeeRate;

    const exitFee = (markPrice * quantity) * exitFeeRate;

    const totalFee = entryFee + exitFee;

    const netPnL = grossPnL - totalFee;

    let netRoePercentage = 0;
    if (allocatedMargin > 0) {
        netRoePercentage = (netPnL / allocatedMargin) * 100;
    }

    return {
        grossPnL: Number(grossPnL.toFixed(4)),
        totalFee: Number(totalFee.toFixed(4)),
        netPnL: Number(netPnL.toFixed(4)),
        netRoePercentage: Number(netRoePercentage.toFixed(2))
    };
}



export function calculateUnrealizedPnl({
    side,
    entryPrice,
    markPrice,
    quantity,
    allocatedMargin,
    entryFeeRate = 0.0005
}) {

    assertRequiredParams({ side, entryPrice, markPrice, quantity, allocatedMargin}, "calculateUnrealizedPnl");

    const normalizedSide = side.toUpperCase();
    let unrealizedPnl = 0;

    if (normalizedSide === 'LONG') {
        unrealizedPnl = (markPrice - entryPrice) * quantity;
    }
    else if (normalizedSide === 'SHORT') {
        unrealizedPnl = (entryPrice - markPrice) * quantity;
    } else {
        throw new Error(`Side must be either "Long" OR "Short"!`);
    }

    const entryFee = (entryPrice * quantity) * entryFeeRate;

    const netUnrealizedPnl = unrealizedPnl - entryFee;

    let netRoePercentage = 0;
    if (allocatedMargin > 0) {
        netRoePercentage = (netUnrealizedPnl / allocatedMargin) * 100;
    }

    return {
        unrealizedPnl: Number(unrealizedPnl.toFixed(4)),
        netUnrealizedPnl: Number(netUnrealizedPnl.toFixed(4)),
        netRoePercentage: Number(netRoePercentage.toFixed(4))
    }
}


export function check_tpHit({ entryPrice, markPrice, tpRate, side }) {
    
    assertRequiredParams({ entryPrice, markPrice, tpRate, side }, "check_tpHit");
    const normalizedSide = side.toUpperCase();

    if (normalizedSide === "SHORT") {
        const tpPrice = entryPrice - (entryPrice * tpRate);
        return tpPrice >= markPrice;
    } else if (normalizedSide === "LONG") {
        const tpPrice = entryPrice + (entryPrice * tpRate);
        return tpPrice <= markPrice;
    } else {
        throw new Error(`Side must be either "Short" or "Long"!`)
    }
}

export function check_slHit({ entryPrice, markPrice, slRate, side }) {
    assertRequiredParams({ entryPrice, markPrice, slRate, side }, "check_slHit");

    const normalizedSide = side.toUpperCase();

    if (normalizedSide === "SHORT") {
        const slPrice = entryPrice + (entryPrice * slRate);
        return slPrice <= markPrice;
    } else if (normalizedSide === "LONG") {
        const slPrice = entryPrice - (entryPrice * slRate);
        return slPrice >= markPrice;
    } else {
        throw new Error(`Side must be either "Short" or "Long"!`);
    }
}

export function check_liquidated({ liqudationPrice, markPrice, side }) {
    assertRequiredParams({ liqudationPrice, markPrice, side }, "check_liquidation");

    const normalizedSide = side.toUpperCase();

    if (normalizedSide === "SHORT") {
        return liqudationPrice <= markPrice;
    } else if (normalizedSide === "LONG") {
        return liqudationPrice >= markPrice;
    } else {
        throw new Error(`Side must be either "Short" or "Long"!`);
    }
}