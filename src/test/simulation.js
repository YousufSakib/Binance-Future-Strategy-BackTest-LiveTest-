import { decidePosition } from "../strategy/decidePosition.js";

export function exchangeSimulation(data) {

    decidePosition(data);

    checkLiquidationAndExits(data);

    printPositions();
}
