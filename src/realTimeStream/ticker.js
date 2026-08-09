import WebSocket from "ws";

const symbol = 'btcusdt';

const url = `wss://fstream.binance.com/market/ws/${symbol}@ticker`;

const ws = new WebSocket(url);

ws.on('open', () => {
  console.log(`Connected to Binance Futures Ticker Stream for ${symbol.toUpperCase()}...\n`);
});

ws.on('message', (data) => {
  try {
    const raw = JSON.parse(data);

    const ticker = {
      eventType: raw.e,                           // Event Type (24hrTicker)
      eventTime: new Date(raw.E).toLocaleTimeString(), // Event Time (Formatted)
      symbol: raw.s,                              // Symbol
      priceChange: parseFloat(raw.p),             // Price Change
      priceChangePercent: parseFloat(raw.P),      // Price Change Percent (%)
      weightedAvgPrice: parseFloat(raw.w),        // Weighted Average Price (VWAP)
      lastPrice: parseFloat(raw.c),               // Last Price / Close Price
      lastQuantity: parseFloat(raw.Q),            // Last Trade Quantity
      openPrice: parseFloat(raw.o),               // Open Price
      highPrice: parseFloat(raw.h),               // High Price
      lowPrice: parseFloat(raw.l),                // Low Price
      volumeBase: parseFloat(raw.v),              // Total Base Asset Volume (BTC)
      volumeQuote: parseFloat(raw.q),             // Total Quote Asset Volume (USDT)
      openTime: new Date(raw.O).toLocaleTimeString(),  // Statistics Open Time
      closeTime: new Date(raw.C).toLocaleTimeString(), // Statistics Close Time
      firstTradeId: raw.F,                        // First Trade ID
      lastTradeId: raw.L,                         // Last Trade ID
      totalTrades: raw.n,                         // Total Number of Trades
      pairSymbol: raw.ps,                         // Pair Symbol (After CM migration)
      symbolType: raw.st === 1 ? 'UM (USDⓈ-M)' : 'CM (COIN-M)' // Symbol Type (1 = UM, 2 = CM)
    };

    console.clear();
    console.log(`================= 24H TICKER DATA FOR ${ticker.symbol} =================`);
    console.log(`Event Type            : ${ticker.eventType}`);
    console.log(`Event Time            : ${ticker.eventTime}`);
    console.log(`Market Type           : ${ticker.symbolType} (Pair: ${ticker.pairSymbol})`);
    console.log(`------------------------------------------------------------------`);
    console.log(`Last Price            : $${ticker.lastPrice}`);
    console.log(`24h Open Price        : $${ticker.openPrice}`);
    console.log(`24h High / Low        : $${ticker.highPrice} / $${ticker.lowPrice}`);
    console.log(`24h Price Change      : $${ticker.priceChange} (${ticker.priceChangePercent}%)`);
    console.log(`Weighted Avg Price    : $${ticker.weightedAvgPrice}`);
    console.log(`------------------------------------------------------------------`);
    console.log(`Last Trade Quantity   : ${ticker.lastQuantity}`);
    console.log(`Total Volume (Base)   : ${ticker.volumeBase.toLocaleString()} ${ticker.symbol.replace('USDT','')}`);
    console.log(`Total Volume (Quote)  : $${ticker.volumeQuote.toLocaleString()}`);
    console.log(`Total Trades Count    : ${ticker.totalTrades.toLocaleString()} trades`);
    console.log(`Trade ID Range        : ${ticker.firstTradeId} ---> ${ticker.lastTradeId}`);
    console.log(`------------------------------------------------------------------`);
    console.log(`Window Open - Close   : ${ticker.openTime} - ${ticker.closeTime}`);
    console.log(`==================================================================`);

  } catch (error) {
    console.error('Error parsing JSON:', error);
  }
});

ws.on('error', (error) => {
  console.error('WebSocket Error:', error);
});

ws.on('close', () => {
  console.log('Connection closed.');
});