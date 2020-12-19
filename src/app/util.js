export function reducer(state, item) {
    return {...state, ...item}
}

function parseBets(betString) {
    return betString.split("").map((char) => {
        return "abcdefghijklmnopqrstuvwxy".indexOf(char);
    }).reduce((prev, next) => {
        prev.push(Math.floor(next / 5));
        prev.push(next % 5);
        return prev;
    }, []).reduce((t, e, r) => {
        let div = r % 5;
        if (div === 0) {
            t.push([0, 0, 0, 0, 0]);
        }
        t[t.length - 1][div] = e;
        return t;
    }, []).reduce((t, e, r) => {
        t[r + 1] = e;
        return t;
    }, {});
}

function parseBetAmounts(betAmountsString) {
    return betAmountsString.match(/.{1,3}/g).map((chunk) => {
        let val = 0;
        for (let char = 0; char < chunk.length; char++) {
            val *= 52;
            val += "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".indexOf(chunk[char]);
        }
        return val - 70304;
    }).reduce((t, e, r) => {
        t[r + 1] = e
        return t
    }, {});
}

export function parseBetUrl() {
    const urlParams = new URLSearchParams(window.location.hash.slice(1));

    let bets = {};
    let betAmounts = {};
    // temp variables so we can make sure it doesn't overflow etc
    let tempBets = {};
    let tempBetAmounts = {};

    // parse Bets
    let bet = urlParams.get("b");
    if (bet !== null) {
        tempBets = parseBets(bet);
    }

    // parse Bet Amounts
    let amounts = urlParams.get("a");
    if (amounts !== null) {
        tempBetAmounts = parseBetAmounts(amounts);
    }

    // force data if none exists for bets and amounts alike
    // allow up to 15 bets
    let amountOfBets = Math.max(Object.keys(tempBets).length, Object.keys(tempBetAmounts).length, 10) > 10 ? 15 : 10;
    for (let index = 1; index <= amountOfBets; index++) {
        bets[index] = tempBets[index] || [0, 0, 0, 0, 0];
        betAmounts[index] = tempBetAmounts[index] || -1000;
    }

    return {
        round: urlParams.get("round"),
        bets: bets,
        betAmounts: betAmounts,
    };
}

export function makeBetUrl(bets) {
    return Object.keys(bets).sort((t, e) => {
        return t - e
    }).map((t) => {
        return bets[t];
    }).reduce((t, e) => {
        for (let r = 0; r < 5; r++) {
            t.push(e[r]);
        }
        return t;
    }, []).reduce((t, e, r) => {
        if (r % 2 === 0) {
            t.push(5 * e);
        } else {
            t[t.length - 1] += e;
        }
        return t;
    }, []).map((t) => {
        return "abcdefghijklmnopqrstuvwxy"[t];
    }).join("");
}

export function makeBetAmountsUrl(betAmounts) {
    return Object.keys(betAmounts).sort((t, e) => {
        return t - e;
    }).map((t) => {
        return betAmounts[t];
    }).map((t) => {
        let e = "";
        t = (parseInt(t) || 0) % 70304 + 70304;
        for (let r = 0; r < 3; r++) {
            let n = t % 52;
            e = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"[n] + e;
            t = (t - n) / 52;
        }
        return e;
    }).join("");
}

export function displayAsPercent(value, decimals) {
    return `${(100 * value).toFixed(decimals)}%`;
}

export function displayAsPlusMinus(value) {
    return `${(0 < value ? "+" : "")}${value}`;
}

export function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
