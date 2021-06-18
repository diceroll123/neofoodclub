import Cookies from "universal-cookie/es6";
import moment from "moment";
import {
    calculateArenaRatios,
    calculatePayoutTables,
    computePirateFAs,
    computePiratesBinary,
    computeProbabilities,
} from "./maths";

export function reducer(state, item) {
    return { ...state, ...item };
}

function parseBets(betString) {
    return betString
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

    return {
        round: urlParams.get("round"),
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
    if (decimals === undefined) {
        return `${100 * value}%`;
    }
    return `${(100 * value).toFixed(decimals)}%`;
}

export function displayAsPlusMinus(value) {
    return `${0 < value ? "+" : ""}${value}`;
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

export function anyBetsExist(betsObject) {
    return Object.values(betsObject).some((pirates) =>
        pirates.some((index) => index > 0)
    );
}

export function createBetURL(roundState, ignoreBetAmounts) {
    // for this function:
    // bets will only be added if any bets are valid
    // bet amounts will only be added if ignoreBetAmounts is false AND valid bet amounts are found

    // that aside, this only returns the hash, shaped like so:
    // "/#round=7018"
    // "/#round=7018&b=gmkhmgklhkfmlfmbkkhkgkacm"
    // "/#round=7018&b=gmkhmgklhkfmlfmbkkhkgkacm&a=CEbCEbCEbCEbCEbCEbCEbCEbCEbCEb"

    ignoreBetAmounts = ignoreBetAmounts ?? true;

    let betURL = `/#round=${roundState.currentSelectedRound}`;
    let addBets = anyBetsExist(roundState.bets);

    if (addBets === false) {
        return betURL;
    }

    betURL += "&b=" + makeBetUrl(roundState.bets);

    if (ignoreBetAmounts) {
        return betURL;
    }

    let addBetAmounts = Object.values(roundState.betAmounts).some(
        (value) => value >= 50
    );
    if (addBetAmounts) {
        return betURL + "&a=" + makeBetAmountsUrl(roundState.betAmounts);
    }
    return betURL;
}

export function calculateRoundOverPercentage(roundState) {
    let now = moment();
    let start = moment(roundState.roundData.start);
    let end = moment(roundState.roundData.start).add(1, "day");
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

export function calculateRoundData(roundState) {
    // calculates all of the round's mathy data for visualization purposes.
    let calculated = false;
    let probabilities = {};
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

    if (roundState.roundData && roundState.customOdds) {
        probabilities = computeProbabilities(
            roundState.roundData,
            roundState.customProbs
        );

        pirateFAs = computePirateFAs(roundState.roundData);
        arenaRatios = calculateArenaRatios(roundState.customOdds);
        winningBetBinary = computePiratesBinary(roundState.roundData.winners);

        // keep the "cache" of bet data up to date
        for (
            let betIndex = 1;
            betIndex <= Object.keys(roundState.bets).length;
            betIndex++
        ) {
            betBinaries[betIndex] = computePiratesBinary(
                roundState.bets[betIndex]
            );
            betOdds[betIndex] = 0;
            betProbabilities[betIndex] = 0;

            for (let arenaIndex = 0; arenaIndex < 5; arenaIndex++) {
                let pirateIndex = roundState.bets[betIndex][arenaIndex];
                if (pirateIndex > 0) {
                    let odd =
                        roundState.customOdds[arenaIndex][pirateIndex] ||
                        roundState.roundData.currentOdds[arenaIndex][
                            pirateIndex
                        ];
                    let prob =
                        roundState.customProbs[arenaIndex][pirateIndex] ||
                        probabilities.used[arenaIndex][pirateIndex];
                    betOdds[betIndex] = (betOdds[betIndex] || 1) * odd;
                    betProbabilities[betIndex] =
                        (betProbabilities[betIndex] || 1) * prob;
                }
            }
            // yes, the for-loop above had to be separate.
            for (let arenaIndex = 0; arenaIndex < 5; arenaIndex++) {
                betPayoffs[betIndex] = Math.min(
                    1_000_000,
                    roundState.betAmounts[betIndex] * betOdds[betIndex]
                );
                betExpectedRatios[betIndex] =
                    betOdds[betIndex] * betProbabilities[betIndex];
                betNetExpected[betIndex] =
                    betPayoffs[betIndex] * betProbabilities[betIndex] -
                    roundState.betAmounts[betIndex];
                betMaxBets[betIndex] = Math.floor(
                    1_000_000 / betOdds[betIndex]
                );
            }
        }

        for (let betIndex in roundState.bets) {
            let betBinary = betBinaries[betIndex];
            if (betBinary > 0) {
                totalEnabledBets += 1;
                totalBetAmounts += roundState.betAmounts[betIndex];
                totalBetExpectedRatios += betExpectedRatios[betIndex];
                totalBetNetExpected += betNetExpected[betIndex];
                if ((winningBetBinary & betBinary) === betBinary) {
                    // bet won
                    totalWinningOdds += betOdds[betIndex];
                    totalWinningPayoff += Math.min(
                        betOdds[betIndex] * roundState.betAmounts[betIndex],
                        1000000
                    );
                }
            }
        }

        // for charts
        payoutTables = calculatePayoutTables(
            roundState,
            probabilities.used,
            betOdds,
            betPayoffs
        );

        calculated = true;
    }

    return {
        calculated,
        probabilities,
        pirateFAs,
        arenaRatios,
        betOdds,
        betPayoffs,
        betProbabilities,
        betExpectedRatios,
        betNetExpected,
        betMaxBets,
        betBinaries,
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
