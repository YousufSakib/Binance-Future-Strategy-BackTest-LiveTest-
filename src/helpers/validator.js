export function assertRequiredParams(params, fnName = "Function") {
    const missing = Object.entries(params)
        .filter(([_, v]) => v === undefined)
        .map(([key]) => key)

    if(missing.length > 0){
        throw new Error(`[${fnName}] Missing required arguments: ${missing.join(', ')}`);
    }
}
