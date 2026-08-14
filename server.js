import WebSocket, { WebSocketServer } from "ws";

const PORT = 8080;

const BATCH_SIZE = 5000;
const BATCHES_PER_SEC = 20;
const INTERVAL_MS = 20 || 1000 / BATCHES_PER_SEC;
const MAX_BUFFERED_BYTES = 50 * 1024 * 1024;

// --------------------------------------------------
// Generate one reusable batch
// --------------------------------------------------

const samplePayload = JSON.stringify({
    id: 101,
    t: Date.now(),
    v: 99.85,
});

const batchData = "[" + Array.from({ length: BATCH_SIZE }, () => samplePayload).join(",") + "]";

const batchBytes = Buffer.byteLength(batchData);

console.log("==========================================");
console.log(" WebSocket High-Throughput Server");
console.log("==========================================");
console.log(`URL:          ws://localhost:${PORT}`);
console.log(`Batch size:   ${BATCH_SIZE.toLocaleString()} items`);
console.log(`Batches/sec:  ${BATCHES_PER_SEC}`);
console.log(`Items/sec:    ${(BATCH_SIZE * BATCHES_PER_SEC).toLocaleString()}`);
console.log(`Payload/sec:  ${((batchBytes * BATCHES_PER_SEC) / 1024 / 1024).toFixed(2)} MB/s`);
console.log(`Batch size:   ${(batchBytes / 1024 / 1024).toFixed(2)} MB`);
console.log("==========================================");

let lastReportAt = 0;
let messagesLastSecond = 0;
let bytesLastSeconds = 0;

let sentItems = 0;
let sentBatches = 0;

// --------------------------------------------------
// WebSocket server
// --------------------------------------------------

const wss = new WebSocketServer({ port: PORT });

wss.on("connection", (ws) => {
    console.log("Client connected");


    const interval = setInterval(() => {
        if (ws.readyState !== WebSocket.OPEN) {
            clearInterval(interval);
            return;
        }

        // Don't allow an extremely slow client to consume
        // unlimited server memory.

        let shouldSend = true;
        if (ws.bufferedAmount >= MAX_BUFFERED_BYTES) {
            console.warn(`Client is behind: ${(ws.bufferedAmount / 1024 / 1024).toFixed(2)} MB buffered`);
            shouldSend = false;
        }

        if (shouldSend) {
            ws.send(batchData, (error) => {
                if (error) console.error("Send error:", error.message);
            });

            messagesLastSecond++;
            bytesLastSeconds += batchBytes;

            sentItems += BATCH_SIZE;
            sentBatches++;
        }


        const now = Date.now();
        if (now - lastReportAt > 1000) {

            const elapsed = (now - lastReportAt) / 1000;

            const msgRate = (messagesLastSecond / elapsed);
            const mbRate = (bytesLastSeconds / elapsed) / 1024 / 1024

            console.clear();

            console.log("======================================");
            console.log(" WebSocket Server Monitor");
            console.log("======================================");

            console.log(`Messages/sec : ${msgRate.toFixed(2)}`);
            console.log(`Sending rate : ${mbRate.toFixed(2)} Mb/s`);
            console.log(`Buffered Amount: ${ws.bufferedAmount}`);

            lastReportAt = now;
            bytesLastSeconds = 0;
            messagesLastSecond = 0;
        }
    }, INTERVAL_MS);

    ws.on("close", () => {
        clearInterval(interval);

        console.log(
            `Client disconnected | ` +
            `batches=${sentBatches.toLocaleString()} | ` +
            `items=${sentItems.toLocaleString()}`
        );
    });

    ws.on("error", (error) => {
        console.error("Client WebSocket error:", error.message);
        clearInterval(interval);
    });
});

wss.on("error", (error) => {
    console.error("Server error:", error);
});