import { getRealTimeKlineStream } from "../realTimeStream/kline-candlestick.js";
import { create_param_combinations } from "./simple-param-combination.js";
import { exchangeSimulation } from "./simulation.js";
import { TradeWorkflowEngine } from "./trade-workflow-engine.js";

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

const executionProfile = {
    position: {
        positionHistory: [],
        openPositions: [],
    },
    config: {
        leverage: 5,
        positionSizeUSDT: 15,
    },
    strategy: {
        window: [],
        runningTimeSec: ""
    },
    variation: {
        slRate: 0.1,
        tpRate: 0.05,
        windowSize: 30
    },
    performance: {},
}



export function liveMarketTest({ symbols, interval }) {
    const stream = getRealTimeKlineStream({ symbols, interval });

    const tradeWorkFlowEngines = {};

    const variations = create_param_combinations(executionProfile.variation);

    for (let i = 0; i < variations.length; i++) {

        const variation = variations[i];

        const profile = { ...executionProfile, variation };

        for (let j = 0; j < symbols.length; j++) {
            const deepClonedProfile = structuredClone(profile);
            const engine = new TradeWorkflowEngine(deepClonedProfile);

            const symblLow = symbols[i].toLowerCase();

            if (!tradeWorkFlowEngines[symblLow]) tradeWorkFlowEngines[symblLow] = [engine];
            else tradeWorkFlowEngines[symblLow].push(engine);
        }
    }

    stream.on("ohlc", (ohlc) => {
        const enginesSymbl = tradeWorkFlowEngines[ohlc.symbol.toLowerCase()]
        for (let i = 0; i < enginesSymbl; i++) {
            const engine = enginesSymbl[i];
            engine.nextTick({ ohlc });
        }
    })

    stream.on("end", () => {
        console.log('process end');
    })
}

liveMarketTest({ symbols, interval });