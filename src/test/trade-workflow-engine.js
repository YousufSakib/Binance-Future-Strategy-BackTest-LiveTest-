import { decidePosition } from "../strategy/decidePosition.js";
import { checkLiquidationAndExits } from "../riskManagement/positionManagement.js";

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
        strategy: { window },
        variation: {
            slRate,
            tpRate,
            windowSize
        },
        performance
    } = executionProfile;

    
    let markPrice;

    function nextTick({ ohlc }) {

        markPrice = ohlc.markPrice

        decidePosition({
            ohlc,
            openNewPosition: ({ side }) => {
                console.log(`New Position, Entry: ${markPrice} ( ${side} )`);
                const allocatedMargin = (quantity * markPrice) / leverage;
                const position = { entryPrice: markPrice, side: "long", entryTime: data.eventTime + 600, quantity, allocatedMargin };
                openPositions.push(position);

            }
        }
        )

        checkLiquidationAndExits()
    }
}