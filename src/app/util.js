export function reducer(state, item) {
    return {...state, ...item}
}

export function parseBetUrl() {
    const urlParams = new URLSearchParams(window.location.hash.slice(1));
    return {
        round: urlParams.get("round"),
        bet: urlParams.get("b"),
        betAmount: urlParams.get("a"),
    };
}
