import WebSocket from "ws";
import logger from "./logger.js";
import { runOnTermination } from "./runOnTermination.js";

let currentWS = null;

runOnTermination(() => {
    if (currentWS && (currentWS.readyState === WebSocket.OPEN || currentWS.readyState === WebSocket.CONNECTING)) {
        currentWS.close(1000, Buffer.from("Work Finished"));
    }else {
        console.log("WS undefined");
    }
    
})

export function connectWebSocket({ url, onMessage, onEnd }) {
    if (!url) {
        throw new Error(`A valid WS "url" parameter required. Found url: (${url})`)
    }

    if (typeof onMessage !== 'function') {
        throw new Error(`A valid "onMessage" function required in parameter.`)
    }

    if (typeof onEnd !== 'function') {
        throw new Error(`A valid "onEnd" function required in parameter.`)
    }

    logger.info("Connecting to Websocket....");

    const ws = new WebSocket(url);

    currentWS = ws;

    let pingInterval;

    ws.on("open", () => {
        logger.info(`Connected succesfully.`);

        pingInterval = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.pong();
                // logger.debug(`---> Sent pong frame.`);
            }
            // 3 minutes
        }, 180000);
    });

    ws.on("message", onMessage);

    ws.on("ping", () => {
        // logger.debug("<-- Received ping frame from server, sending pong back.")
        ws.pong();
    });

    ws.on("close", (code, reason) => {

        const reasonText = reason ? reason.toString() : "No reason provided";

        if (ws === currentWS) currentWS = null;

        clearInterval(pingInterval);
        
        logger.warn(`Connection closed. Code: ${code}, Reason: ${reasonText}.`);

        if (code !== 1000) {
            logger.info(`Reconnecting in 3 seconds...`);
            setTimeout(connectWebSocket, 3000, { url, onMessage, onEnd });
        }else {
            onEnd()
        }
    });

    ws.on("error", (error) => {
        logger.error(error.message);
    })
}
