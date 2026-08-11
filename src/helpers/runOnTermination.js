import logger from "./logger.js";

export function runOnProcessTerm(callback) {
    process.on('exit', (code) => {
        callback()
    });
}