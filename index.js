import { randomBuySell } from "./calculation.js";
import { getKlineData } from "./klineData.js";

const pair = "btcusdt";

const candles = await getKlineData({ pair, duration: "1y" })

randomBuySell(candles);