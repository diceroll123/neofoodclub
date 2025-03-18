import Cookies from "universal-cookie";
import moment from "moment";
import {
    calculateArenaRatios,
    calculatePayoutTables,
    computePirateFAs,
    computePiratesBinary,
    computeLegacyProbabilities,
    computeLogitProbabilities,
} from "./maths";

export function reducer(state, item) {
    return { ...state, ...item };
}

export function generateRandomIntegerInRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateRandomPirateIndex() {
    return generateRandomIntegerInRange(1, 4);
}

function parseBets(betString) {
    return betString
        .replace(/[^a-y]/g, "")
        .split("")
        .map((char) => {
            return "abcdefghijklmnopqrstuvwxy".indexOf(char);
        })
        .reduce((prev, next) => {
            prev.push(Math.floor(next / 5), next % 5);
            return prev;
        }, [])
        .reduce((t, e, r) => {
            let div = r % 5;
            if (div === 0) {
                t.push([0, 0, 0, 0, 0]);
            }
            t[t.length - 1][div] = e;
            return t;
        }, [])
        .reduce((t, e, r) => {
            t[r + 1] = e;
            return t;
        }, {});
}

function parseBetAmounts(betAmountsString) {
    return betAmountsString
        .replace(/[^a-zA-Z]/g, "")
        .match(/.{1,3}/g)
        .map((chunk) => {
            let val = 0;
            for (let char = 0; char < chunk.length; char++) {
                val *= 52;
                val +=
                    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".indexOf(
                        chunk[char]
                    );
            }
            return val - 70304;
        })
        .reduce((t, e, r) => {
            t[r + 1] = e;
            return t;
        }, {});
}

export function parseBetUrl(url) {
    const urlParams = new URLSearchParams(url);

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
    if (amounts !== null && amounts !== "") {
        tempBetAmounts = parseBetAmounts(amounts);
    }

    // force data if none exists for bets and amounts alike
    // allow up to 15 bets
    let amountOfBets =
        Math.max(
            Object.keys(tempBets).length,
            Object.keys(tempBetAmounts).length,
            10
        ) > 10
            ? 15
            : 10;
    for (let index = 1; index <= amountOfBets; index++) {
        bets[index] = tempBets[index] || [0, 0, 0, 0, 0];
        betAmounts[index] = tempBetAmounts[index] || -1000;
    }

    let round = urlParams.get("round");

    if (!/^\d+$/.test(round)) {
        round = "";
    }

    return {
        round: round,
        bets: bets,
        betAmounts: betAmounts,
    };
}

function makeBetUrl(bets) {
    return Object.keys(bets)
        .sort((t, e) => {
            return t - e;
        })
        .map((t) => {
            return bets[t];
        })
        .reduce((t, e) => {
            t.push(...e);
            return t;
        }, [])
        .reduce((t, e, r) => {
            if (r % 2 === 0) {
                t.push(5 * e);
            } else {
                t[t.length - 1] += e;
            }
            return t;
        }, [])
        .map((t) => {
            return "abcdefghijklmnopqrstuvwxy"[t];
        })
        .join("");
}

function makeBetAmountsUrl(betAmounts) {
    return Object.keys(betAmounts)
        .sort((t, e) => {
            return t - e;
        })
        .map((t) => {
            return betAmounts[t];
        })
        .map((t) => {
            let e = "";
            t = ((parseInt(t) || 0) % 70304) + 70304;
            for (let r = 0; r < 3; r++) {
                let n = t % 52;
                e =
                    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"[n] +
                    e;
                t = (t - n) / 52;
            }
            return e;
        })
        .join("");
}

export function displayAsPercent(value, decimals) {
    if (value === undefined) {
        return "0%";
    }
    if (decimals === undefined) {
        return `${100 * value}%`;
    }
    return `${(100 * value).toFixed(decimals)}%`;
}

export function displayAsPlusMinus(value) {
    return `${value > 0 ? "+" : ""}${value}`;
}

function calculateMaxBet(baseMaxBet, round) {
    return baseMaxBet + 2 * round;
}

export function calculateBaseMaxBet(maxBet, round) {
    return maxBet - 2 * round;
}

export function getMaxBet(currentSelectedRound) {
    const cookies = new Cookies();
    let maxBet = cookies.get("baseMaxBet");
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

export function getUseWebDomain() {
    const cookies = new Cookies();
    return cookies.get("useWebDomain");
}

export function getUseLogitModel() {
    const cookies = new Cookies();
    return cookies.get("useLogitModel");
}

export function anyBetsExist(betsObject) {
    return Object.values(betsObject).some((pirates) =>
        pirates.some((index) => index > 0)
    );
}

export function anyBetAmountsExist(betAmountsObject) {
    return Object.values(betAmountsObject || {}).some((amount) => amount >= 50);
}

export function anyBetsDuplicate(betsObject) {
    // returns false if there are no duplicates
    // returns true if there are any duplicates
    const values = Object.values(betsObject).filter((v) => v); // remove the zeroes
    return values.length !== [...new Set(values)].length;
}

export function makeBetURL(roundNumber, bets, betAmounts, includeBetAmounts) {
    // for this function:
    // bets will only be added if any bets are valid
    // bet amounts will only be added if includeBetAmounts is true AND valid bet amounts are found

    // that aside, this only returns the hash, shaped like so:
    // "/#round=7018"
    // "/#round=7018&b=gmkhmgklhkfmlfmbkkhkgkacm"
    // "/#round=7018&b=gmkhmgklhkfmlfmbkkhkgkacm&a=CEbCEbCEbCEbCEbCEbCEbCEbCEbCEb"

    let betURL = `/#round=${roundNumber}`;
    let addBets = anyBetsExist(bets);

    if (addBets === false) {
        return betURL;
    }

    betURL += "&b=" + makeBetUrl(bets);

    if (!includeBetAmounts) {
        return betURL;
    }

    let addBetAmounts = anyBetAmountsExist(betAmounts);
    if (addBetAmounts) {
        return betURL + "&a=" + makeBetAmountsUrl(betAmounts);
    }
    return betURL;
}

export function calculateRoundOverPercentage(roundState) {
    let roundStart = roundState?.roundData?.start;

    if (roundStart === undefined) {
        return 0;
    }

    let now = moment();
    let start = moment(roundStart);
    let end = moment(roundStart).add(1, "day");
    let totalMillisInRange = end.valueOf() - start.valueOf();
    let elapsedMillis = now.valueOf() - start.valueOf();
    return Math.max(
        0,
        Math.min(100, 100 * (elapsedMillis / totalMillisInRange))
    );
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

export function shuffleArray(array) {
    // shuffles the array in-place
    // from https://stackoverflow.com/a/12646864
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

export function determineBetAmount(maxBet, betCap) {
    // here we will determine a foolproof way to consistently give a bet amount to bets when generated

    // maxBet is the user-set max bet amount for a round.
    // betCap is the highest bet amount for a bet (1,000,000 / odds + 1) // (the +1 is so we cross the 1M line)

    // first, determine if there IS a max bet set. If not, just return -1000.
    if (maxBet < 50) {
        return -1000;
    }

    if (betCap < 50) {
        // if the highest bet amount to hit 1M on this bet is under 50, return 50, the minimum bet amount.
        return 50;
    }

    // if we've made it this far,
    // we must go with the smallest of maxBet, betCap, or 500K
    return Math.min(maxBet, betCap, 500_000);
}

export function amountAbbreviation(value) {
    if (!isNaN(value)) {
        if (Math.abs(value) >= 1000000) {
            return `${value / 1000000}M`;
        }
        if (Math.abs(value) >= 1000) {
            return `${value / 1000}k`;
        }
    }
    return value;
}

export function sortedIndices(arr) {
    // returns the indices of the sorted array in least to greatest value
    // in: [3,4,1,2]
    // out:[2,3,0,1]
    // from https://stackoverflow.com/a/54323161
    return arr
        .map((val, ind) => {
            return { ind, val };
        })
        .sort((a, b) => {
            return a.val > b.val ? 1 : a.val === b.val ? 0 : -1;
        })
        .map((obj) => obj.ind);
}

export function getOdds(roundState) {
    // the odds we will use for things.
    // basically this just checks if the custom mode is on or not, and grabs the proper one.
    // returns the current round odds if there are no custom odds
    const odds = roundState?.roundData?.currentOdds;
    if (roundState?.advanced.bigBrain && roundState?.advanced.customOddsMode) {
        return roundState?.customOdds || odds;
    }
    return odds;
}

export function getProbs(roundState, legacyProbs, logitProbs) {
    // returns the current round probs if there are no custom probs
    if (
        roundState.advanced.bigBrain &&
        roundState.advanced.customOddsMode &&
        roundState.customProbs != null
    ) {
        return roundState.customProbs;
    }
    if (roundState.advanced.useLogitModel) {
        return logitProbs.used;
    }
    return legacyProbs.used;
}

export function makeBetValues(bets, betAmounts, odds, probabilities) {
    let betOdds = {};
    let betPayoffs = {};
    let betProbabilities = {};
    let betExpectedRatios = {};
    let betNetExpected = {};
    let betMaxBets = {};
    let betBinaries = {};

    for (let betIndex = 1; betIndex <= Object.keys(bets).length; betIndex++) {
        betBinaries[betIndex] = computePiratesBinary(bets[betIndex]);
        betOdds[betIndex] = 0;
        betProbabilities[betIndex] = 0;

        for (let arenaIndex = 0; arenaIndex < 5; arenaIndex++) {
            let pirateIndex = bets[betIndex][arenaIndex];
            if (pirateIndex > 0) {
                let odd = odds[arenaIndex][pirateIndex];
                let prob = probabilities[arenaIndex][pirateIndex];
                betOdds[betIndex] = (betOdds[betIndex] || 1) * odd;
                betProbabilities[betIndex] =
                    (betProbabilities[betIndex] || 1) * prob;
            }
        }
        // yes, the for-loop above had to be separate.
        const amount = (betAmounts || {})[betIndex] || -1000;
        const theseOdds = betOdds[betIndex];
        const prob = betProbabilities[betIndex];
        betPayoffs[betIndex] = Math.min(1_000_000, amount * theseOdds);
        betExpectedRatios[betIndex] = theseOdds * prob;
        betNetExpected[betIndex] = betPayoffs[betIndex] * prob - amount;
        betMaxBets[betIndex] = Math.floor(1_000_000 / theseOdds);
    }

    return {
        betOdds,
        betPayoffs,
        betProbabilities,
        betExpectedRatios,
        betNetExpected,
        betMaxBets,
        betBinaries,
    };
}

export function calculateRoundData(roundState, bets, betAmounts) {
    // calculates all of the round's mathy data for visualization purposes.
    let calculated = false;
    let legacyProbabilities = {};
    let logitProbabilities = {};
    let usedProbabilities = {};
    let pirateFAs = {};
    let arenaRatios = [];
    let betOdds = {};
    let betPayoffs = {};
    let betProbabilities = {};
    let betExpectedRatios = {};
    let betNetExpected = {};
    let betMaxBets = {};
    let betBinaries = {};
    let payoutTables = {};
    let winningBetBinary = 0;

    // for payouttable + charts:
    let totalBetAmounts = 0;
    let totalBetExpectedRatios = 0;
    let totalBetNetExpected = 0;
    let totalWinningPayoff = 0;
    let totalWinningOdds = 0;
    let totalEnabledBets = 0;

    const odds = getOdds(roundState);
    if (roundState.roundData && odds && bets && betAmounts) {
        legacyProbabilities = computeLegacyProbabilities(roundState.roundData);
        logitProbabilities = computeLogitProbabilities(roundState.roundData);
        usedProbabilities = getProbs(
            roundState,
            legacyProbabilities,
            logitProbabilities
        );

        pirateFAs = computePirateFAs(roundState.roundData);
        arenaRatios = calculateArenaRatios(odds);
        winningBetBinary = computePiratesBinary(roundState.roundData.winners);

        // keep the "cache" of bet data up to date
        const values = makeBetValues(bets, betAmounts, odds, usedProbabilities);

        betOdds = values.betOdds;
        betPayoffs = values.betPayoffs;
        betProbabilities = values.betProbabilities;
        betExpectedRatios = values.betExpectedRatios;
        betNetExpected = values.betNetExpected;
        betMaxBets = values.betMaxBets;
        betBinaries = values.betBinaries;

        for (let betIndex in bets) {
            let betBinary = betBinaries[betIndex];
            if (betBinary > 0) {
                totalEnabledBets += 1;
                totalBetAmounts += betAmounts[betIndex];
                totalBetExpectedRatios += betExpectedRatios[betIndex];
                totalBetNetExpected += betNetExpected[betIndex];
                if ((winningBetBinary & betBinary) === betBinary) {
                    // bet won
                    totalWinningOdds += betOdds[betIndex];
                    totalWinningPayoff += Math.min(
                        betOdds[betIndex] * betAmounts[betIndex],
                        1_000_000
                    );
                }
            }
        }

        // for charts
        payoutTables = calculatePayoutTables(
            bets,
            usedProbabilities,
            betOdds,
            betPayoffs
        );

        calculated = true;
    }

    return {
        calculated,
        legacyProbabilities,
        logitProbabilities,
        usedProbabilities,
        pirateFAs,
        arenaRatios,
        betOdds,
        betPayoffs,
        betProbabilities,
        betExpectedRatios,
        betNetExpected,
        betMaxBets,
        betBinaries,
        odds,
        payoutTables,
        winningBetBinary,
        totalBetAmounts,
        totalBetExpectedRatios,
        totalBetNetExpected,
        totalWinningPayoff,
        totalWinningOdds,
        totalEnabledBets,
    };
}
