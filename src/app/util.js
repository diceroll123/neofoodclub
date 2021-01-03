import Cookies from "universal-cookie/es6";
import moment from "moment";

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

function makeBetUrl(bets) {
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

function makeBetAmountsUrl(betAmounts) {
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

function calculateMaxBet(baseMaxBet, round) {
    return baseMaxBet + 2 * round;
}

export function calculateBaseMaxBet(maxBet, round) {
    return maxBet - 2 * round;
}

export function getMaxBet(currentSelectedRound) {
    const cookies = new Cookies();
    let maxBet = cookies.get('baseMaxBet');
    if (maxBet === undefined) {
        return -1000;
    }
    let value = calculateMaxBet(parseInt(maxBet), currentSelectedRound);

    if (value < 50) {
        return -1000;
    }

    return Math.min(500_000, value);
}

export function getTableMode() {
    const validModes = ["normal", "dropdown"];
    const cookies = new Cookies();
    let mode = cookies.get("tableMode");
    if (validModes.includes(mode) === false) {
        mode = "normal";
    }
    return mode;
}

export function anyBetsExist(betsObject) {
    let exists = false;
    for (const [, value] of Object.entries(betsObject)) {
        if (exists === false) {
            exists = value.some(x => x > 0);
        }
    }
    return exists;
}

export function createBetURL(roundState, ignoreBetAmounts) {
    // for this function:
    // bets will only be added if any bets are valid
    // bet amounts will only be added if ignoreBetAmounts is false AND valid bet amounts are found

    // that aside, this only returns the hash, shaped like so:
    // "/#round=7018"
    // "/#round=7018&b=gmkhmgklhkfmlfmbkkhkgkacm"
    // "/#round=7018&b=gmkhmgklhkfmlfmbkkhkgkacm&a=CEbCEbCEbCEbCEbCEbCEbCEbCEbCEb"

    if (ignoreBetAmounts === undefined) {
        ignoreBetAmounts = true;
    }

    let betURL = `/#round=${roundState.currentSelectedRound}`;
    let addBets = anyBetsExist(roundState.bets);

    if (addBets === false) {
        return betURL;
    }

    betURL += '&b=' + makeBetUrl(roundState.bets);

    if (ignoreBetAmounts) {
        return betURL;
    }

    let addBetAmounts = false;
    for (const [, value] of Object.entries(roundState.betAmounts)) {
        if (addBetAmounts === false) {
            addBetAmounts = value >= 50;
        }
    }
    if (addBetAmounts) {
        return betURL + '&a=' + makeBetAmountsUrl(roundState.betAmounts);
    }
    return betURL;
}

export function calculateRoundOverPercentage(roundState) {
    let now = moment();
    let start = moment(roundState.roundData.start);
    let end = moment(roundState.roundData.start).add(1, 'day');
    let totalMillisInRange = end.valueOf() - start.valueOf();
    let elapsedMillis = now.valueOf() - start.valueOf();
    return Math.max(0, Math.min(100, 100 * (elapsedMillis / totalMillisInRange)));
}

export function cloneArray(arr) {
    // forgive me, there is no better way to clone in JS yet
    return JSON.parse(JSON.stringify(arr));
}

export function makeEmptyBets(length) {
    const bets = {};
    for (let index = 1; index <= length; index++) {
        bets[index] = [0, 0, 0, 0, 0];
    }
    return bets;
}

export function makeEmptyBetAmounts(length) {
    const betAmounts = {};
    for (let index = 1; index <= length; index++) {
        betAmounts[index] = -1000;
    }
    return betAmounts;
}
