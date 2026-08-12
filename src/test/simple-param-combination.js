export function create_param_combinations({ slRate, tpRate, windowSize }) {
    const arr = [
        { slRate: 0.02, tpRate: 0.02, windowSize: 120 },
        { slRate: 0.02, tpRate: 0.001, windowSize: 30 },
        { slRate: 0.02, tpRate: 0.01, windowSize: 10 },
        { slRate: 0.02, tpRate: 1, windowSize: 500 },
        { slRate: 0.02, tpRate: 0.01, windowSize: 15 },
        { slRate: 0.02, tpRate: 0.00001, windowSize: 5 },

    ]

    return arr.map(e => ({ ...e, key: JSON.stringify(e) }))
}