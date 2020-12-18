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
            returnValue.used[arenaIndex][pirateIndex] = returnValue.std[arenaIndex][pirateIndex];
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
            ratio += 1 / roundData.currentOdds[arenaIndex][pirateIndex];
        }
        ratio = 1 / ratio - 1;
        arenas[arenaIndex] = ratio;
    }
    return arenas;
}
