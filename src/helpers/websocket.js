import WebSocket from "ws";
import logger from "./logger.js";

export function connectWebSocket({ url, onMessage }) {
    if (!url) {
        throw new Error(`A valid WS "url" parameter required. Found url: (${url})`)
    }

    if (typeof onMessage !== 'function') {
        throw new Error(`A valid "onMessage" function required in parameter.`)
    }

    logger.info("Connecting to Websocket....");

    const ws = new WebSocket(url);

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

    ws.on("close", () => {
        logger.warn("Connection closed. Reconnecting in 3 seconds...");
        clearInterval(pingInterval);
        setTimeout(connectWebSocket, 3000, { url, onMessage });
    });

    ws.on("error", (error) => {
        logger.error(error.message);
    })
}