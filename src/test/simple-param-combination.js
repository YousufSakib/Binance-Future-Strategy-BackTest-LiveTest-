export function create_param_combinations({ slRate, tpRate, windowSize }) {
    const arr = [
        { slRate: 0.02, tpRate: 0.02, windowSize: 120 },
    ]

    return arr.map(e => ({ ...e, key: JSON.stringify(e) }))
}