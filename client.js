import WebSocket from "ws";

const URL = "ws://localhost:8080";

const ws = new WebSocket(URL, {
    perMessageDeflate: false,
});

let connectedAt = 0;

let totalMessages = 0;
let totalItems = 0;
let totalBytes = 0;

let messagesLastSecond = 0;
let itemsLastSecond = 0;
let bytesLastSecond = 0;

let lastMessageAt = 0;

let minGap = Infinity;
let maxGap = 0;

let totalProcessingTime = 0;
let maxProcessingTime = 0;

let lastReportAt = Date.now();

let consoleClear = true;

ws.on("open", () => {
    connectedAt = Date.now();

    console.log("======================================");
    console.log(" WebSocket Client Connected");
    console.log("======================================");
    console.log(`Server: ${URL}`);
    console.log("Waiting for data...");
    console.log("");
});

ws.on("message", (data) => {
    const receivedAt = Date.now();

    const bytes = Buffer.byteLength(data);

    // ------------------------------------
    // Message arrival gap
    // ------------------------------------

    if (lastMessageAt !== 0) {
        const gap = receivedAt - lastMessageAt;

        if (gap < minGap) {
            minGap = gap;
        }

        if (gap > maxGap) {
            maxGap = gap;
        }

        // If the expected interval is 50ms and
        // we suddenly get a much larger gap,
        // something may be blocking/delaying us.
        if (gap > 100 && consoleClear) {
            console.warn(
                `[WARNING] Message gap: ${gap} ms`
            );
        }
    }

    lastMessageAt = receivedAt;

    // ------------------------------------
    // Parse JSON
    // ------------------------------------

    const processingStart = performance.now();

    let parsed;

    try {
        parsed = JSON.parse(data.toString());
        for (let i = 0; i < 700_000_000; i++);
    } catch (error) {
        console.error("JSON parse error:", error.message);
        return;
    }

    const processingTime =
        performance.now() - processingStart;

    totalProcessingTime += processingTime;

    if (processingTime > maxProcessingTime) {
        maxProcessingTime = processingTime;
    }

    // ------------------------------------
    // Count items
    // ------------------------------------

    const itemCount = Array.isArray(parsed) ? parsed.length : 1;

    totalMessages++;
    totalItems += itemCount;
    totalBytes += bytes;

    messagesLastSecond++;
    itemsLastSecond += itemCount;
    bytesLastSecond += bytes;

    // ------------------------------------
    // 1-second report
    // ------------------------------------

    const now = Date.now();

    if (now - lastReportAt >= 1000) {
        const elapsed = (now - lastReportAt) / 1000;
        const msgRate = messagesLastSecond / elapsed;
        const itemRate = itemsLastSecond / elapsed;
        const mbRate = (bytesLastSecond / elapsed) / 1024 / 1024;
        const avgProcessing = messagesLastSecond > 0 ? totalProcessingTime / totalMessages : 0;

        if (consoleClear) {
            console.clear();

            console.log("======================================");
            console.log(" WebSocket Client Monitor");
            console.log("======================================");

            console.log(`Messages/sec : ${msgRate.toFixed(2)}`);
            console.log(`Items/sec    : ${itemRate.toLocaleString(undefined, { maximumFractionDigits: 0 })}`);
            console.log(`Receive rate : ${mbRate.toFixed(2)} MB/s`);
            console.log(`Buffered     : ${ws.bufferedAmount}`)
            console.log("--------------------------------------");
            console.log(`Total msgs   : ${totalMessages.toLocaleString()}`);
            console.log(`Total items  : ${totalItems.toLocaleString()}`);
            console.log(`Total data   : ${(totalBytes / 1024 / 1024).toFixed(2)} MB`);
            console.log("--------------------------------------");
            console.log(`Min gap      : ${minGap === Infinity ? "-" : minGap + " ms"}`);
            console.log(`Max gap      : ${maxGap} ms`);
            console.log(`Avg parse    : ${avgProcessing.toFixed(3)} ms`);
            console.log(`Max parse    : ${maxProcessingTime.toFixed(3)} ms`);
            console.log("--------------------------------------");

            if (msgRate < 15) {
                console.log("⚠️ Message rate is significantly below target!");
            }

            if (itemRate < 80000) {
                console.log("⚠️ Item throughput is below ~80k/sec!");
            }

            if (maxGap > 200) {
                console.log("⚠️ Large receive gap detected!");
            }

            if (maxProcessingTime > 20) {
                console.log("⚠️ JSON parsing/processing is taking too long!");
            }
            console.log("======================================");
        }
        else { console.log('..') }
        messagesLastSecond = 0;
        itemsLastSecond = 0;
        bytesLastSecond = 0;

        lastReportAt = now;
    }
});

ws.on("close", (code, reason) => {
    console.log("");
    console.log("======================================");
    console.log(" WebSocket disconnected");
    console.log("======================================");

    console.log(`Code: ${code}`);
    console.log(`Reason: ${reason?.toString() || "none"}`);

    console.log(`Total messages: ${totalMessages.toLocaleString()}`);

    console.log(`Total items: ${totalItems.toLocaleString()}`);
});

ws.on("error", (error) => {
    console.error(
        "WebSocket error:",
        error.message
    );
});



const signals = ['SIGINT', 'SIGTERM', 'SIGHUP'];

signals.forEach((signal) => {
    process.on(signal, async () => {
        consoleClear = false;
        console.log(`[Process Termination] Triggered by: ${signal}`)
        ws.close(1000, "Works end");
    });
});

// 2. Normal Exit
process.on('exit', (code) => {
    // Note: Only synchronous code can run here!
    console.log(`Process exited with code: ${code}`);
});