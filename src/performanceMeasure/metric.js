// positionHistory Schema: 
// { symbol, entryPrice, side, entryTime, quantity, allocatedMargin, exitPrice, exitTime, totalFee, netPnL, netRoePercentage, tpHit, slHit, liquidated, forcedClosed }

export function StrategyMetric(tradeWorkFlowEngines) {
    this.tradeWorkFlowEngines = tradeWorkFlowEngines;
    this.showReport = function () {
        const report = {};

        Object.entries(this.tradeWorkFlowEngines).forEach(([variationKey, symbolsEngine]) => {
            report[variationKey] = {};
            Object.entries(symbolsEngine).forEach(([symbol, engine]) => {
                report[variationKey][symbol] = this.makeReport(engine);
            })
        });

        this.displayTerminalReport(report);
    }


    this.makeReport = function (engine) {
        const positionHistory = engine.positionHistory;

        const symbol = engine.symbol;
        let totalTrade = positionHistory.length;
        let totalWinTrade = 0;
        let longTradeCnt = 0;
        let shortTradeCnt = 0;

        let netProfit = 0;
        let totalAllocatedMargin = 0;
        let totalFeeAmnt = 0;
        let netRoe = 0;

        let tpHitCnt = 0;
        let slHitCnt = 0;
        let liquidatedCnt = 0;
        let forcedClosedCnt = 0;

        let longTradeNetPnL = 0;
        let shortTradeNetPnL = 0;

        let winRate, tpRate, slRate;


        for (let i = 0; i < positionHistory.length; i++) {

            const { side, allocatedMargin, totalFee, netPnL, tpHit, slHit, liquidated, forcedClosed } = positionHistory[i];

            const isWin = netPnL > 0;

            if (isWin) totalWinTrade++;

            if (side.toUpperCase() === "SHORT") {
                shortTradeCnt++;
                if (isWin) longTradeNetPnL += netPnL
            }
            else if (side.toUpperCase() === "LONG") {
                longTradeCnt++;
                if (isWin) shortTradeNetPnL += netPnL
            }

            if (tpHit) tpHitCnt++;
            else if (slHit) slHitCnt++;
            else if (liquidated) liquidatedCnt++;
            else if (forcedClosed) forcedClosedCnt++;

            netProfit += netPnL;
            totalFeeAmnt += totalFee;
            totalAllocatedMargin += allocatedMargin
        }

        netRoe = totalAllocatedMargin > 0 ? (netProfit / totalAllocatedMargin) * 100 : 0;

        winRate = totalTrade > 0 ? (totalWinTrade / totalTrade) * 100 : 0;
        tpRate = totalTrade > 0 ? (tpHitCnt / totalTrade) * 100 : 0;
        slRate = totalTrade > 0 ? (slHitCnt / totalTrade) * 100 : 0;


        if (totalTrade !== shortTradeCnt + longTradeCnt) throw new Error("Inconsistant Report");


        return { symbol, totalTrade, totalWinTrade, longTradeCnt, shortTradeCnt, netProfit, totalAllocatedMargin, totalFeeAmnt, netRoe, tpHitCnt, slHitCnt, liquidatedCnt, forcedClosedCnt, shortTradeNetPnL, longTradeNetPnL, winRate, tpRate, slRate }
    }

    this.displayTerminalReport = function (report) {

        console.log("\n==========================================================================");
        console.log("                        PARAM VARIATION BACKTEST REPORT                   ");
        console.log("==========================================================================\n");

        Object.entries(report).forEach(([variationKey, symbolsData], index) => {
            console.log(`\n📌 Variation #${index + 1}: [ ${variationKey} ]`);
            console.log("-".repeat(70));

            // Transform raw metrics into readable calculated view
            const formattedRows = Object.entries(symbolsData).map(([symbolKey, data]) => {

                return {
                    Symbol: data.symbol || symbolKey,
                    'Total Trades': data.totalTrade,
                    'Win Rate': data.winRate,
                    'Net Profit ($)': Number(data.netProfit).toFixed(4),
                    'Net ROE (%)': Number(data.netRoe).toFixed(4) + '%',
                    'Long / Short': `${data.longTradeCnt} / ${data.shortTradeCnt}`,
                    'TP / SL Hits': `${data.tpHitCnt} / ${data.slHitCnt}`,
                    'TP/SL Rate': `${data.tpRate}% / ${data.slRate}%`,
                    'Total Fee ($)': Number(data.totalFeeAmnt).toFixed(4),
                    'Liq / Forced': `${data.liquidatedCnt} / ${data.forcedClosedCnt}`
                };
            });

            console.table(formattedRows);
        });
    }
}