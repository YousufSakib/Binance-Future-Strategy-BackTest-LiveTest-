import { EventEmitter } from "node:events";
import logger from "../helpers/logger.js";
import { connectWebSocket } from "../helpers/websocket.js";


function connectWSCandleStreams({ url }) {

  const streamEmitter = new EventEmitter();

  connectWebSocket({
    url, onMessage: (data) => {
      try {
        const raw = JSON.parse(data);
        const k = raw?.data?.k;
        if(raw?.data?.e !== "kline") return;

        const candleData = {
          eventType: raw.data.e,                                 // Event Type (kline)
          eventTime: new Date(raw.data.E).toLocaleString(),  // Event Time
          symbol: raw.data.s,                                    // Symbol
          startTime: new Date(k.t).toLocaleString(),    // Kline Start Time
          closeTime: new Date(k.T).toLocaleString(),    // Kline Close Time
          interval: k.i,                                    // Interval (e.g. 1m)
          firstTradeId: k.f,                                // First Trade ID
          lastTradeId: k.L,                                 // Last Trade ID
          openPrice: parseFloat(k.o),                       // Open Price
          closePrice: parseFloat(k.c),                      // Close Price (Current Live Price)
          highPrice: parseFloat(k.h),                       // High Price
          lowPrice: parseFloat(k.l),                        // Low Price
          volumeBase: parseFloat(k.v),                      // Base Asset Volume (BTC)
          tradesCount: k.n,                                 // Total Number of Trades
          isClosed: k.x,                                    // Is Candle Closed? (true/false)
          volumeQuote: parseFloat(k.q),                     // Quote Asset Volume (USDT)
          takerBuyBaseVolume: parseFloat(k.V),              // Taker Buy Base Asset Volume
          takerBuyQuoteVolume: parseFloat(k.Q)              // Taker Buy Quote Asset Volume
        };

        streamEmitter.emit('olhc', candleData);

      } catch (error) {
        logger.error(error.message);
      }
    }
  });

  return streamEmitter;
}


export function getRealTimeKlineStream({ symbols, interval }) {

    if (!Array.isArray(symbols)) throw new Error(`The parameter "symbols", must be an array!`);
    if (!interval) throw new Error(`The parameter "interval", must be an array!`);

    const streams = symbols.map((s) => `${s.toLowerCase()}@kline_${interval}`).join("/");
    const url = `wss://fstream.binance.com/market/stream?streams=${streams}`;

    return connectWSCandleStreams({ url });
}


function printCandleData(candleData) {
  console.clear();
  console.log(`================ ${candleData.symbol} (${candleData.interval}) KLINE DATA ================`);
  console.log(`Event Time          : ${candleData.eventTime}`);
  console.log(`Candle Time Window  : ${candleData.startTime} ---> ${candleData.closeTime}`);
  console.log(`Candle Status       : ${candleData.isClosed ? 'CLOSED (New Candle Next)' : 'BUILDING (Live)'}`);
  console.log(`------------------------------------------------------------------`);
  console.log(`Open Price          : $${candleData.openPrice}`);
  console.log(`High Price          : $${candleData.highPrice}`);
  console.log(`Low Price           : $${candleData.lowPrice}`);
  console.log(`Current / Close     : $${candleData.closePrice}`);
  console.log(`------------------------------------------------------------------`);
  console.log(`Total Volume (Base) : ${candleData.volumeBase.toLocaleString()}`);
  console.log(`Total Volume (USDT) : $${candleData.volumeQuote.toLocaleString()}`);
  console.log(`Taker Buy Volume    : ${candleData.takerBuyBaseVolume} BTC ($${candleData.takerBuyQuoteVolume.toLocaleString()})`);
  console.log(`Taker Sell Volume   : ${Number((candleData.volumeBase - candleData.takerBuyBaseVolume)).toFixed(3)} BTC ($${Number((candleData.volumeQuote - candleData.takerBuyQuoteVolume).toFixed(3)).toLocaleString()})`);
  console.log(`Total Trades Count  : ${candleData.tradesCount}`);
  console.log(`Trade ID Range      : ${candleData.firstTradeId} ---> ${candleData.lastTradeId}`);
  console.log(`==================================================================`);

}
