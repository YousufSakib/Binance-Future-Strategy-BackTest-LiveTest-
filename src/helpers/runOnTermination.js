import logger from "./logger.js";

let isCleaningUp = false;

async function cleanup({ callback, signal }) {
    logger.info(`[Process Termination] Triggered by: ${signal}`);
    callback();
}

export function runOnTermination(callback) {

    // 1. Standard Termination Signals
    const signals = ['SIGINT', 'SIGTERM', 'SIGHUP'];

    signals.forEach((signal) => {
        process.on(signal, async () => {
            await cleanup({ callback, signal });
            // process.exit(0); // Exit gracefully after cleanup completes
        });
    });

    // 2. Normal Exit
    process.on('exit', (code) => {
        // Note: Only synchronous code can run here!
        logger.info(`Process exited with code: ${code}`);
    });

    // 3. Uncaught Errors & Unhandled Rejections
    process.on('uncaughtException', async (err) => {
        logger.error('Uncaught Exception:', err);
        await cleanup({ callback, signal: 'uncaughtException' });
        process.exit(1); // Exit with error code
    });

    process.on('unhandledRejection', async (reason) => {
        logger.error('Unhandled Rejection:', reason);
        await cleanup({ callback, signal: 'unhandledRejection' });
        process.exit(1);
    });
}