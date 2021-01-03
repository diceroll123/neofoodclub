import {NEGATIVE_FAS, POSITIVE_FAS} from "./constants";

export function computePirateFAs(roundData) {
    // pre-populate with zeroes because really old rounds don't have this data
    // I'm not sure how, but the original neofoodclub somehow made up values to make up for this
    // I will be having none of that here.
    let fas = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];

    if (roundData.foods) {
        for (let arenaIndex = 0; arenaIndex < 5; arenaIndex++) {
            fas[arenaIndex] = [];
            for (let pirateIndex = 0; pirateIndex < 4; pirateIndex++) {
                for (let foodIndex = fas[arenaIndex][pirateIndex] = 0; foodIndex < 10; foodIndex++) {
                    let foodId = roundData.foods[arenaIndex][foodIndex];
                    let pirateId = roundData.pirates[arenaIndex][pirateIndex];
                    fas[arenaIndex][pirateIndex] += POSITIVE_FAS[pirateId][foodId];
                    fas[arenaIndex][pirateIndex] -= NEGATIVE_FAS[pirateId][foodId];
                }
            }
        }
    }
    return fas;
}

export function computeProbabilities(roundData) {
    let returnValue = {
        min: [],
        std: [],
        max: [],
        used: []
    };
    for (let arenaIndex = 0; arenaIndex < 5; arenaIndex++) {
        returnValue.min[arenaIndex] = [1];
        returnValue.max[arenaIndex] = [1];
        returnValue.std[arenaIndex] = [1];
        returnValue.used[arenaIndex] = [1];
        let min = 0;
        let max = 0;
        let pirateIndex;
        for (pirateIndex = 1; pirateIndex <= 4; pirateIndex++) {
            let pirateOdd = roundData.openingOdds[arenaIndex][pirateIndex];
            if (pirateOdd === 13) {
                returnValue.min[arenaIndex][pirateIndex] = 0;
                returnValue.max[arenaIndex][pirateIndex] = 1 / 13;
            } else if (pirateOdd === 2) {
                returnValue.min[arenaIndex][pirateIndex] = 1 / 3;
                returnValue.max[arenaIndex][pirateIndex] = 1;
            } else {
                returnValue.min[arenaIndex][pirateIndex] = 1 / (1 + pirateOdd);
                returnValue.max[arenaIndex][pirateIndex] = 1 / pirateOdd;
            }
            min += returnValue.min[arenaIndex][pirateIndex];
            max += returnValue.max[arenaIndex][pirateIndex];
        }

        for (pirateIndex = 1; pirateIndex <= 4; pirateIndex++) {
            let pirateOdd = roundData.openingOdds[arenaIndex][pirateIndex];
            let minOrig = returnValue.min[arenaIndex][pirateIndex];
            let maxOrig = returnValue.max[arenaIndex][pirateIndex];
            returnValue.min[arenaIndex][pirateIndex] = Math.max(minOrig, 1 + maxOrig - max);
            returnValue.max[arenaIndex][pirateIndex] = Math.min(maxOrig, 1 + minOrig - min);
            if (pirateOdd === 13) {
                returnValue.std[arenaIndex][pirateIndex] = 0.05;
            } else {
                returnValue.std[arenaIndex][pirateIndex] = (returnValue.min[arenaIndex][pirateIndex] + returnValue.max[arenaIndex][pirateIndex]) / 2;
            }
        }

        let rectifyLevel = 2;
        while (rectifyLevel <= 13) {
            let stdTotal = 0;
            let rectifyCount = 0;
            let rectifyValue = 0;
            let maxRectifyValue = 1;
            for (pirateIndex = 1; pirateIndex <= 4; pirateIndex++) {
                stdTotal += returnValue.std[arenaIndex][pirateIndex];
                if (roundData.openingOdds[arenaIndex][pirateIndex] <= rectifyLevel) {
                    rectifyCount++;
                    rectifyValue += returnValue.std[arenaIndex][pirateIndex] - returnValue.min[arenaIndex][pirateIndex];
                    maxRectifyValue = Math.min(maxRectifyValue, returnValue.max[arenaIndex][pirateIndex] - returnValue.min[arenaIndex][pirateIndex]);
                }
            }
            if (stdTotal === 1) {
                break;
            }
            if (stdTotal - rectifyValue > 1 || rectifyCount === 0 || rectifyValue + 1 - stdTotal > maxRectifyValue * rectifyCount) {
                rectifyLevel++;
                continue;
            }
            rectifyValue += 1 - stdTotal; // positive or 0
            rectifyValue /= rectifyCount;
            for (pirateIndex = 1; pirateIndex <= 4; pirateIndex++) {
                if (roundData.openingOdds[arenaIndex][pirateIndex] <= rectifyLevel) {
                    returnValue.std[arenaIndex][pirateIndex] = returnValue.min[arenaIndex][pirateIndex] + rectifyValue;
                }
            }
            break;
        }

        let sum = 0;
        for (pirateIndex = 1; pirateIndex <= 4; pirateIndex++) {
            returnValue.used[arenaIndex][pirateIndex] = roundData.customProbs[arenaIndex][pirateIndex] || returnValue.std[arenaIndex][pirateIndex];
            sum += returnValue.used[arenaIndex][pirateIndex];
        }

        for (pirateIndex = 1; pirateIndex <= 4; pirateIndex++) {
            returnValue.used[arenaIndex][pirateIndex] = returnValue.used[arenaIndex][pirateIndex] / sum;
        }
    }
    return returnValue;
}

export function calculateArenaRatios(roundData) {
    let arenas = [];
    for (let arenaIndex = 0; arenaIndex < 5; arenaIndex++) {
        let ratio = 0;
        for (let pirateIndex = 1; pirateIndex <= 4; pirateIndex++) {
            ratio += 1 / roundData.customOdds[arenaIndex][pirateIndex];
        }
        ratio = 1 / ratio - 1;
        arenas[arenaIndex] = ratio;
    }
    return arenas;
}

function tableToList(oddsTable) {
    let oddsList = [];
    for (let odds in oddsTable) {
        oddsList.push({value: odds, probability: oddsTable[odds]});
    }
    oddsList.sort((a, b) => a.value - b.value);
    let cumulative = 0;
    let tail = 1;
    for (let i = 0; i < oddsList.length; i++) {
        cumulative += oddsList[i].probability;
        oddsList[i].cumulative = cumulative;
        oddsList[i].tail = tail;
        tail -= oddsList[i].probability;
    }
    return oddsList;
}

export function calculatePayoutTables(roundState, probabilities, betOdds, betPayoffs) {
    /*
    ib is a binary format to represent bets.
    It works on 20 bits (because there are 20 pirates).
    Each of the bits of an ib represents whether it accepts some pirate. (whether the bet can win if this pirate wins)
    From most significant to least significant bits, the pirates are in the usual arena-by-arena order.
    This binary format allows some easy operations:
    ib1&ib2 accepts the pirates that both ib1 and ib2 accepts. The winning combinations of ib1&ib2 is the intersection of the winning combinations of ib1 and ib2.
    ib1|ib2 accepts the pirates that ib1 or ib2 accepts. The winning combinations of ib1&ib2 is BIGGER or equal to the union of the winning combinations of ib1 and ib2.
    */

    // arIb[i] will accept pirates from arena i and only them. arIb[4] == 1111, arIb[3] == 11110000, etc...
    let arIb = [983040, 61440, 3840, 240, 15];
    // allIb will accept all pirates. allIb = 11111111111111111111 (should be 20 '1's)
    let allIb = (1 << 20) - 1;
    // pirIb[i] will accept pirates of index i (from 0 to 3) pirIb[0] = 10001000100010001000, pirIb[1] = 01000100010001000100, pirIb[2] = 00100010001000100010, pirIb[3] = 00010001000100010001
    let pirIb = [69905 << 3, 69905 << 2, 69905 << 1, 69905];

    // this will allow an easier conversion from the old bet format to the new
    let convrtPirIb = [allIb].concat(pirIb);

    // betToIb converts from old bet format to the new.
    function betToIb(bet) {
        let ib = 0;
        for (let i = 0; i < 5; i++) {
            // this adds pirates meant by bet[i] to the pirates accepted by ib.
            ib = ib | (convrtPirIb[bet[i]] & arIb[i]);
        }
        return ib;
    }

    // checks if there are possible winning combinations for ib
    function ibDoable(ib) {
        // checks whether ib accepts at least one pirate in each arena
        return (ib & arIb[0]) && (ib & arIb[1]) && (ib & arIb[2]) && (ib & arIb[3]) && (ib & arIb[4]);
    }

    /*
    an ibObj has the following format:
    {
        ibBet1: winnings1,
        ibBet2: winnings2,
        ...
    }
    */

    /*
    expandIbObject takes an ibObj and returns an ibObj.
    The returned bet set "res" satisfies the following properties:
    - for all possible winning combinations it has the same value as the old set
    - two different bets in "res" will have 0 common accepted winning combinations
    - all winning combinations are accepted by a bet in "res" (giving the value 0 to combinations that busts)
    It's done so that the probability distribution becomes easy to compute.
    */
    function expandIbObject(ibObj) {
        // magic for now, just accept that it works
        let res = {};
        res[allIb] = 0;
        for (let bet in ibObj) {
            let valBet = ibObj[bet];
            let iter = Object.keys(res);
            iter.forEach(function (ibKey) {
                let com = bet & ibKey;
                if (ibDoable(com)) {
                    let valKey = res[ibKey];
                    delete res[ibKey];
                    res[com] = valBet + valKey;
                    for (let i = 0; i < 5; i++) {
                        let ar = arIb[i];
                        let tst = ibKey ^ (com & ar);
                        if (ibDoable(tst)) {
                            res[tst] = valKey;
                            ibKey = (ibKey & (~ar)) | (com & ar);
                        }
                    }
                }
            });
        }
        return res;
    }

    // computes the probability that the winning combination is accepted by ib
    function ibProb(ib) {
        let totProb = 1;
        for (let i = 0; i < 5; i++) {
            let arProb = 0;
            for (let j = 0; j < 4; j++) {
                if (ib & arIb[i] & pirIb[j]) {
                    arProb += roundState.roundData.customProbs[i][j+1] || probabilities[i][j+1];
                }
            }
            totProb *= arProb;
        }
        return totProb;
    }

    /*
    Takes a bet set in ibObj satisfying the following condition:
    - two different bets in the bet set will have 0 common accepted winning combinations
    and computes its win table.
    */
    function computeWinTableIbExpObj(ibExpObj) {
        let winTable = {};
        for (let ibKey in ibExpObj) {
            winTable[ibExpObj[ibKey]] = winTable[ibExpObj[ibKey]] || 0;
            winTable[ibExpObj[ibKey]] += ibProb(ibKey);
        }
        return tableToList(winTable);
    }

    // making the ibObjs
    let ibObjOdds = {};
    let ibObjWinnings = {};
    for (let betNum in roundState.bets) {
        let ib = betToIb(roundState.bets[betNum]);
        ibObjOdds[ib] = ibObjOdds[ib] || 0;
        ibObjWinnings[ib] = ibObjWinnings[ib] || 0;
        ibObjOdds[ib] += betOdds[betNum];
        ibObjWinnings[ib] += betPayoffs[betNum];
    }

    // expanding the ibObj so that computing its probability distribution is easier
    let ibExpObjOdds = expandIbObject(ibObjOdds);
    let ibExpObjWinnings = expandIbObject(ibObjWinnings);

    // computing the win tables
    let winTblOdds = computeWinTableIbExpObj(ibExpObjOdds);
    let winTblWinnings = computeWinTableIbExpObj(ibExpObjWinnings);

    return {
        odds: winTblOdds,
        winnings: winTblWinnings
    };
}

export function computePirateBinary(arenaIndex, pirateIndex) {
    return 1 << (19 - (pirateIndex - 1 + arenaIndex * 4));
}

export function computePiratesBinary(piratesArray) {
    // transform a 5-length list to a bet-shaped binary number to process wins faster
    let value = 0;
    for (let arenaIndex = 0; arenaIndex < 5; arenaIndex++) {
        let pirateIndex = piratesArray[arenaIndex];
        if (pirateIndex > 0) {
            value |= computePirateBinary(arenaIndex, pirateIndex)
        }
    }
    return value;
}

export function computeBinaryToPirates(bin) {
    let indices = [];
    [983040, 61440, 3840, 240, 15].forEach((arenaValue) => {
        let value = arenaValue & bin;
        if (value > 0) {
            value = 4 - ((value.toString(2).length - 1) % 4);
        }
        indices.push(value)
    })
    return indices;
}
