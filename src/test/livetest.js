import { getRealTimeKlineStream } from "../realTimeStream/kline-candlestick.js";
import { exchangeSimulation } from "./simulation.js";

const symbols = [
    "BTCUSDT",  // # Market Leader / Benchmark
    "ETHUSDT",  // # Large Cap / Smart Contracts
    "SOLUSDT",  // # High-Beta / Volatile Layer 1
    "DOGEUSDT", // # Meme Coin / Retail Sentiment Driven
    "XRPUSDT",  // # News & Macro Event Driven
    "AVAXUSDT", // # Mid-Cap / Technical Pattern Follower
    "LINKUSDT", // # Infrastructure / Low Correlation
    "AAVEUSDT", // # DeFi Sector Representative
    "FETUSDT",  // # AI Narrative Sector
    "BNBUSDT",  // # Exchange Ecosystem Token
];

const interval = "1m";

const config = {
    positionHistory: [],
    openPositions: [],
    performance: {},
    slRate: 0.02,
    tpRate: 0.001,
    leverage: 5,
    positionSizeUSDT: 15,
    strategy: {
        window: [],
        windowSec: 30
    }
}



export function liveTest({ symbols, interval }) {
    const stream = getRealTimeKlineStream({ symbols, interval });

    stream.on("data", (data) => {
        console.log(data);
    })
}

liveTest({ symbols, interval });