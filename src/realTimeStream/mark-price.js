import WebSocket from "ws";

// যে সিম্বলের মার্ক প্রাইস দেখতে চান (যেমন: btcusdt)
const symbol = 'btcusdt';

// ১. প্রতি ৩ সেকেন্ড পর পর আপডেটের জন্য:
const url = `wss://fstream.binance.com/market/ws/${symbol}@markPrice@1s`;

// ২. অথবা প্রতি ১ সেকেন্ড পর পর আপডেটের জন্য নিচের URL-টি ব্যবহার করতে পারেন:
// const url = `wss://fstream.binance.com/market/ws/${symbol}@markPrice@1s`;

const ws = new WebSocket(url);

ws.on('open', () => {
  console.log(`Connected to Binance Mark Price Stream for ${symbol.toUpperCase()}...\n`);
});

ws.on('message', (data) => {
  try {
    const raw = JSON.parse(data);

    // মার্ক প্রাইস স্ট্রিমের সকল ফিল্ড এক্সট্র্যাক্ট করা হলো
    const markPriceData = {
      eventType: raw.e,                                  // Event Type (markPriceUpdate)
      eventTime: new Date(raw.E).toLocaleTimeString(),   // Event Time
      symbol: raw.s,                                     // Symbol
      markPrice: parseFloat(raw.p),                      // Mark Price
      indexPrice: parseFloat(raw.i),                     // Index Price
      estimatedSettlePrice: parseFloat(raw.P),           // Estimated Settle Price (Only for delivery contracts)
      fundingRate: parseFloat(raw.r),                    // Funding Rate
      fundingRatePercent: (parseFloat(raw.r) * 100).toFixed(4) + '%', // Funding Rate (%)
      movingAverage: parseFloat(raw.ap),                 // Market price moving average
      nextFundingTime: new Date(raw.T).toLocaleTimeString(), // Next Funding Time
      symbolType: raw.st === 1 ? 'UM (USDⓈ-M)' : 'CM (COIN-M)' // Symbol Type (1 = UM, 2 = CM)
    };

    // কনসোলে আউটপুট দেখানো
    console.clear();
    console.log(`================ MARK PRICE DATA: ${markPriceData.symbol} ================`);
    console.log(`Event Time            : ${markPriceData.eventTime}`);
    console.log(`Market Type           : ${markPriceData.symbolType} (Pair: ${markPriceData.symbol})`);
    console.log(`------------------------------------------------------------------`);
    console.log(`Mark Price            : $${markPriceData.markPrice}`);
    console.log(`Index Price           : $${markPriceData.indexPrice}`);
    console.log(`Mark Pri Moving Avg:  : $${markPriceData.movingAverage}`);
    if (markPriceData.estimatedSettlePrice > 0) {
      console.log(`Estimated Settle Price: $${markPriceData.estimatedSettlePrice}`);
    }
    console.log(`------------------------------------------------------------------`);
    console.log(`Current Funding Rate  : ${markPriceData.fundingRate} (${markPriceData.fundingRatePercent})`);
    console.log(`Next Funding Time     : ${markPriceData.nextFundingTime}`);
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