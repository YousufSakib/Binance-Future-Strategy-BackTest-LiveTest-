import logger from "../helpers/logger.js";
import { StrategyMetric } from "../performanceMeasure/metric.js";
import { getRealTimeKlineStream } from "../realTimeStream/kline-candlestick.js";
import { create_param_combinations } from "./simple-param-combination.js";
import { TradeWorkflowEngine } from "./trade-workflow-engine.js";
import { monitorEventLoopDelay } from 'perf_hooks';

const h = monitorEventLoopDelay();
h.enable();

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
    symbol: null,
}



export function liveMarketTest({ symbols, interval }) {
    const stream = getRealTimeKlineStream({ symbols, interval });

    const tradeWorkFlowEngines = {};
    const metric = new StrategyMetric(tradeWorkFlowEngines);

    const variations = create_param_combinations(executionProfile.variation);

    for (let i = 0; i < variations.length; i++) {

        const variation = variations[i];

        const profile = { ...executionProfile, variation };

        const key = variations[i].key;

        tradeWorkFlowEngines[key] = {};

        for (let j = 0; j < symbols.length; j++) {

            const deepClonedProfile = structuredClone({ ...profile, symbol: symbols[j] });
            const engine = new TradeWorkflowEngine(deepClonedProfile);

            const symblHigh = symbols[j].toUpperCase();

            tradeWorkFlowEngines[key][symblHigh] = engine;
        }
    }

    stream.on("ohlc", (ohlc) => {
        for (let i = 0; i < variations.length; i++) {
            const engine = tradeWorkFlowEngines[variations[i].key][ohlc.symbol.toUpperCase()];
            engine.nextTick({ ohlc });
        }
        // metric.showReport()
        
        console.log(`Event Loop D : ${(h.mean / 1e6).toFixed(2)} ms`);
    })

    stream.on("end", () => {

        for (let i = 0; i < variations.length; i++) {
            for (let j = 0; j < symbols.length; j++) {
                const engine = tradeWorkFlowEngines[variations[i].key][symbols[j].toUpperCase()];
                engine.closeAllPositions();
            }
        }

        metric.showReport()
    })
}


liveMarketTest({ symbols, interval });