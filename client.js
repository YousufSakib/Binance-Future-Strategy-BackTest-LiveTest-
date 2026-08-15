import WebSocket from "ws";
import { monitorEventLoopDelay } from 'perf_hooks'

const h = monitorEventLoopDelay();
h.enable();

const URL = "ws://localhost:8080";

const ws = new WebSocket(URL, {
    perMessageDeflate: false,
});

let connectedAt = 0;

let messagesLastSecond = 0;
let bytesLastSecond = 0;
let lastMessageAt = 0;
let lastReportAt = Date.now();
let consoleClear = true;
let processingTime = 0;

ws.on("open", () => {
    connectedAt = Date.now();

    console.log("WebSocket Client Connected");
    console.log(`Server: ${URL}`);
    console.log("Waiting for data...");
    console.log("");
});
ws.on("message", (data) => {
    const processingStart = performance.now();
    const receivedAt = Date.now();

    const bytes = Buffer.byteLength(data);

    lastMessageAt = receivedAt;

    let parsed;

    try {
        parsed = JSON.parse(data.toString());
        for (let i = 0; i < 1_000_000; i++);
    } catch (error) {
        console.error("JSON parse error:", error.message);
        return;
    }

    const itemCount = Array.isArray(parsed) ? parsed.length : 1;

    messagesLastSecond++;
    bytesLastSecond += bytes;

    const now = Date.now();

    if (now - lastReportAt >= 1000) {
        const elapsed = (now - lastReportAt) / 1000;
        const msgRate = messagesLastSecond / elapsed;
        const mbRate = (bytesLastSecond / elapsed) / 1024 / 1024;

        if (consoleClear) {
            console.clear();
            console.log(`Messages/sec : ${msgRate.toFixed(2)}`);
            console.log(`Receive rate : ${mbRate.toFixed(2)} MB/s`);
            console.log(`Processing t : ${processingTime.toFixed(2)} ms`);
            console.log(`Event Loop D : ${(h.mean / 1e6).toFixed(2)} ms`);
            console.log(`Buffered     : ${ws.bufferedAmount}`)
        }
        else { console.log('..') }

        messagesLastSecond = 0;
        bytesLastSecond = 0;

        lastReportAt = now;
        processingTime = performance.now() - processingStart;
    }
});

ws.on("close", (code, reason) => {
    console.log("");
    console.log("WebSocket disconnected");

    console.log(`Code: ${code}`);
    console.log(`Reason: ${reason?.toString() || "none"}`);

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
        console.log(`\n[Process Termination] Triggered by: ${signal}`)
        ws.close(1000, "Works end");
    });
});

// 2. Normal Exit
process.on('exit', (code) => {
    // Note: Only synchronous code can run here!
    console.log(`Process exited with code: ${code}`);
});
