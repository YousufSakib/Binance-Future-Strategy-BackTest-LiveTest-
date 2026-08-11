export function create_param_combinations({ slRate, tpRate, windowSize }) {
    return [
        { slRate: 0.02, tpRate: 0.02, windowSize: 120 },
        { slRate: 0.02, tpRate: 0.001, windowSize: 30 }
    ]
}