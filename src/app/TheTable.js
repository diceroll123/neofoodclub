import {
    Skeleton,
    Box,
    Button,
    IconButton,
    StatArrow,
    Text,
    HStack,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    NumberInput,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableCaption, useTheme, useColorModeValue
} from "@chakra-ui/react";
import {ArrowUpIcon, ArrowDownIcon} from "@chakra-ui/icons";
import React from "react";
import RoundContext from "./RoundState";
import RoundInput from "./RoundInput"
import {calculateArenaRatios, calculatePayoutTables, computePirateFAs, computeProbabilities} from "./maths";
import {displayAsPercent, numberWithCommas} from "./util";
import {ARENA_NAMES, PIRATE_NAMES} from "./constants";

function NormalTable(props) {
    let {pirateFAs, arenaRatios, probabilities, changeBet, getPirateBgColor, green, red} = props;

    const {roundState, setRoundState} = React.useContext(RoundContext);
    const amountOfBets = Object.keys(roundState.bets).length;

    const theme = useTheme();
    const zeroRowBgColor = useColorModeValue(
        theme.colors.gray["100"],
        theme.colors.gray["700"]
    );

    function changeBetLine(arenaIndex, pirateValue) {
        // change the entire row to pirateValue
        // for the 10-bet button
        let newBets = roundState.bets;
        for (let x = 1; x <= amountOfBets; x++) {
            newBets[x][arenaIndex] = pirateValue;
        }
        setRoundState({bets: {...newBets}}); // hacky way to force an object to update useEffect
    }

    function clearBets() {
        let newBets = roundState.bets;
        for (let x = 1; x <= amountOfBets; x++) {
            newBets[x] = [0, 0, 0, 0, 0];
        }
        setRoundState({bets: {...newBets}});
    }

    return (
        <Table size="sm">
            <Thead>
                <Tr>
                    <Th>Arena</Th>
                    <Th>Ratio</Th>
                    <Th>Pirate</Th>
                    <Th>Min Prob</Th>
                    <Th>Max Prob</Th>
                    <Th>Std Prob</Th>
                    {/*<Th>Custom</Th>*/}
                    {/*<Th>Used</Th>*/}
                    <Th>Payout</Th>
                    <Th>FA</Th>
                    {/*<Th colSpan={10}>FA Explanation</Th>*/}
                    <Th>Open</Th>
                    <Th>Current</Th>
                    {/*<Th>Custom</Th>*/}
                    {/*<Th>Timeline</Th>*/}
                    {
                        [...Array(amountOfBets)].map((e, i) => {
                            return <Th>Bet {i + 1}</Th>
                        })
                    }
                    <Th>
                        <Button size="xs" onClick={clearBets}>Clear</Button>
                    </Th>
                </Tr>
            </Thead>
            {
                ARENA_NAMES.map((arenaName, arenaId) => {
                    let pirates;
                    if (roundState.roundData) {
                        pirates = roundState.roundData.pirates[arenaId];
                    } else {
                        pirates = [...Array(4)];
                    }

                    return (
                        <Tbody>
                            <Tr>
                                <Td rowSpan={5}>{arenaName}</Td>
                                <Td rowSpan={5} isNumeric>
                                    {roundState.roundData ?
                                        <Text>{displayAsPercent(arenaRatios[arenaId], 1)}</Text> :
                                        <Skeleton><Box>&nbsp;</Box></Skeleton>
                                    }

                                </Td>
                                <Td backgroundColor={zeroRowBgColor} colSpan={6}></Td>
                                {/*<Td colSpan={2}></Td>*/}
                                {/* Td for FA explanation here */}
                                <Td backgroundColor={zeroRowBgColor} colSpan={2}></Td>
                                {/*<Td colSpan={1}></Td>*/}
                                {/*<Td>showOddsTimeline</Td>*/}
                                {roundState.roundData !== null ? <>
                                    {[...Array(amountOfBets)].map((bet, betNum) => {
                                        return (
                                            // TODO: Chakra's Radio component does not play well with this atm
                                            <Td backgroundColor={zeroRowBgColor}>
                                                <input type="radio"
                                                       name={"bet" + (betNum + 1) + arenaId}
                                                       value={0}
                                                       onChange={() => changeBet(betNum + 1, arenaId, 0)}
                                                       checked={roundState.bets[betNum + 1][arenaId] === 0}/>
                                            </Td>
                                        )
                                    })}
                                    <Td backgroundColor={zeroRowBgColor}>
                                        <Button size="xs" onClick={() => {
                                            changeBetLine(arenaId, 0)
                                        }}>
                                            {amountOfBets}-Bet
                                        </Button>
                                    </Td>
                                </> : (<>
                                    <Td colSpan={100} backgroundColor={zeroRowBgColor}>
                                        <Skeleton height="24px"><Box>&nbsp;</Box></Skeleton>
                                    </Td>
                                </>)
                                }
                            </Tr>

                            {pirates.map((pirateId, pirateIndex) => {

                                if (roundState.roundData === null) {
                                    // big ol skeleton
                                    return (
                                        <Tr>
                                            <Td colSpan={100}>
                                                <Skeleton height="24px">&nbsp;</Skeleton>
                                            </Td>
                                        </Tr>
                                    )
                                }

                                let opening = roundState.roundData.openingOdds[arenaId][pirateIndex + 1];
                                let current = roundState.roundData.currentOdds[arenaId][pirateIndex + 1];

                                let bgColor = "transparent";
                                if (roundState.roundData.winners[arenaId] === pirateIndex + 1) {
                                    bgColor = green;
                                }

                                let payout = current * probabilities.used[arenaId][pirateIndex + 1] - 1;
                                let payoutBackground = "transparent";
                                if (payout > 0) {
                                    payoutBackground = green;
                                } else if (payout <= -.1) {
                                    payoutBackground = red;
                                }

                                return (
                                    <Tr backgroundColor={bgColor}>
                                        <Td backgroundColor={getPirateBgColor(opening)}>{PIRATE_NAMES[pirateId]}</Td>
                                        <Td isNumeric>{displayAsPercent(probabilities.min[arenaId][pirateIndex + 1], 1)}</Td>
                                        <Td isNumeric>{displayAsPercent(probabilities.max[arenaId][pirateIndex + 1], 1)}</Td>
                                        <Td isNumeric>{displayAsPercent(probabilities.std[arenaId][pirateIndex + 1], 1)}</Td>
                                        {/*<Td>Custom</Td>*/}
                                        {/*<Td>Used</Td>*/}
                                        <Td backgroundColor={payoutBackground}
                                            isNumeric>{displayAsPercent(payout, 1)}</Td>
                                        <Td isNumeric>{pirateFAs[arenaId][pirateIndex]}</Td>
                                        <Td isNumeric>{opening}:1</Td>
                                        <Td isNumeric>
                                            {current > opening && <StatArrow mr={1} type="increase"/>}
                                            {current < opening && <StatArrow mr={1} type="decrease"/>}
                                            <Text as={current === opening ? "" : "b"}>{current}:1</Text>
                                        </Td>
                                        {/*<Td>Custom Odds</Td>*/}
                                        {/* Odds Timeline */}
                                        {[...Array(amountOfBets)].map((bet, betNum) => {
                                            return (
                                                <Td>
                                                    {/*TODO: Chakra's Radio component does not play well with this atm*/}
                                                    <input type="radio" name={"bet" + (betNum + 1) + arenaId}
                                                           value={pirateIndex + 1}
                                                           onChange={() => changeBet(betNum + 1, arenaId, pirateIndex + 1)}
                                                           checked={roundState.bets[betNum + 1][arenaId] === pirateIndex + 1}/>
                                                </Td>
                                            )
                                        })}
                                        <Td>
                                            <Button size="xs" onClick={() => {
                                                changeBetLine(arenaId, pirateIndex + 1)
                                            }}>
                                                {amountOfBets}-Bet
                                            </Button>
                                        </Td>
                                    </Tr>
                                )
                            })}
                        </Tbody>
                    )
                })
            }
            <TableCaption>
                <HStack>
                    <Text>Round:</Text>
                    <RoundInput/>

                    <Text>•</Text>
                    <Text>Max Bet:</Text>

                    <NumberInput
                        defaultValue={-1000}
                        min={-1000}
                        max={500000}
                        allowMouseWheel
                        width="110px">
                        <NumberInputField/>
                        <NumberInputStepper>
                            <NumberIncrementStepper/>
                            <NumberDecrementStepper/>
                        </NumberInputStepper>
                    </NumberInput>
                </HStack>
            </TableCaption>
        </Table>
    )
}

function PayoutTable(props) {
    const {
        payoutTables,
        betEnabled,
        betExpectedRatios,
        betProbabilities,
        betNetExpected,
        betOdds,
        betPayoffs,
        betMaxBets,
        getPirateBgColor,
        orange,
        red,
        green
    } = props;

    const {roundState, setRoundState} = React.useContext(RoundContext);
    const amountOfBets = Object.keys(roundState.bets).length;
    let totalBetAmounts = 0;
    let totalBetExpectedRatios = 0;
    let totalBetNetExpected = 0;
    let totalWinningPayoff = 0;
    let totalWinningOdds = 0;
    let totalEnabledBets = 0;
    let betsWon = {};

    for (let betIndex in roundState.bets) {
        if (betEnabled[betIndex]) {
            totalEnabledBets += 1;
            totalBetAmounts += roundState.betAmounts[betIndex];
            totalBetExpectedRatios += betExpectedRatios[betIndex];
            totalBetNetExpected += betNetExpected[betIndex];
            if (didBetWin(betIndex)) {
                betsWon[betIndex] = true;
                totalWinningOdds += betOdds[betIndex];
                totalWinningPayoff += betOdds[betIndex] * roundState.betAmounts[betIndex];
            }
        }
    }

    function didBetWin(betNum) {
        let returnValue = true;
        for (let i = 0; i < 5; i++) {
            let pirateBet = roundState.bets[betNum][i];
            if (pirateBet !== 0 && pirateBet !== roundState.roundData.winners[i]) {
                return false;
            }
        }
        return returnValue;
    }

    function swapBets(index, newIndex) {
        let bets = roundState.bets;
        let betAmounts = roundState.betAmounts;
        [bets[index], bets[newIndex]] = [bets[newIndex], bets[index]];
        [betAmounts[index], betAmounts[newIndex]] = [betAmounts[newIndex], betAmounts[index]];
        setRoundState({bets, betAmounts});
    }

    function getMaxBetColor(betNum) {
        let betAmount = roundState.betAmounts[betNum];
        let div = 1e6 / betOdds[betNum];
        if (betAmount > Math.ceil(div)) {
            return orange;
        }
        if (betAmount > Math.floor(div)) {
            return red;
        }
        return "transparent";
    }

    return (
        <Table size="sm">
            <Thead>
                <Tr>
                    <Th>Bet</Th>
                    <Th>Amount</Th>
                    <Th>Odds</Th>
                    <Th>Payoff</Th>
                    <Th>Probability</Th>
                    <Th>Expected Ratio</Th>
                    <Th>Net Expected</Th>
                    <Th>Maxbet</Th>
                    <Th>Shipwreck</Th>
                    <Th>Lagoon</Th>
                    <Th>Treasure</Th>
                    <Th>Hidden</Th>
                    <Th>Harpoon</Th>
                    <Th>Submit</Th>
                </Tr>
            </Thead>

            {roundState.roundData &&
            <>
                <Tbody>
                    {
                        [...Array(amountOfBets)].map((e, betIndex) => {

                            if (betEnabled[betIndex + 1] === false) {
                                return <></>;
                            }

                            let er = betExpectedRatios[betIndex + 1];
                            let erBg = (er - 1) < 0 ? red : "transparent";

                            let ne = betNetExpected[betIndex + 1];
                            let neBg = (ne - 1) < 0 ? red : "transparent";

                            let betAmount = roundState.betAmounts[betIndex + 1];
                            let baBg = (betAmount < 50) ? red : getMaxBetColor(betIndex + 1);
                            let mbBg = getMaxBetColor(betIndex + 1);

                            let betNumBgColor = betsWon[betIndex + 1] ? green : "transparent";

                            return (
                                <Tr>
                                    <Td backgroundColor={betNumBgColor}>
                                        <HStack>
                                            <Text>{betIndex + 1}</Text>
                                            <HStack spacing="1px">
                                                <IconButton size="xs"
                                                            height="20px"
                                                            icon={<ArrowUpIcon/>}
                                                            onClick={() => swapBets(betIndex + 1, betIndex)}
                                                            isDisabled={betIndex === 0}/>
                                                <IconButton size="xs"
                                                            height="20px"
                                                            icon={<ArrowDownIcon/>}
                                                            onClick={() => swapBets(betIndex + 1, betIndex + 2)}
                                                            isDisabled={betIndex === amountOfBets - 1}/>
                                            </HStack>
                                        </HStack>
                                    </Td>
                                    <Td isNumeric backgroundColor={baBg}>{numberWithCommas(betAmount)}</Td>
                                    <Td isNumeric>{numberWithCommas(betOdds[betIndex + 1])}:1</Td>
                                    <Td isNumeric>{numberWithCommas(betPayoffs[betIndex + 1])}</Td>
                                    <Td isNumeric>{displayAsPercent(betProbabilities[betIndex + 1], 3)}</Td>
                                    <Td isNumeric backgroundColor={erBg}>{er.toFixed(3)}:1</Td>
                                    <Td isNumeric backgroundColor={neBg}>{ne.toFixed(2)}</Td>
                                    <Td isNumeric
                                        backgroundColor={mbBg}>{numberWithCommas(betMaxBets[betIndex + 1])}</Td>
                                    {
                                        [...Array(5)].map((e, arenaIndex) => {
                                            let pirateIndex = roundState.bets[betIndex + 1][arenaIndex];
                                            let bgColor = "transparent";
                                            if (pirateIndex) {
                                                if (betsWon[betIndex + 1]) {
                                                    bgColor = green;
                                                } else {
                                                    bgColor = getPirateBgColor(roundState.roundData.openingOdds[arenaIndex][pirateIndex]);
                                                }
                                            }
                                            return (
                                                <Td backgroundColor={bgColor}>
                                                    {PIRATE_NAMES[roundState.roundData.pirates[arenaIndex][pirateIndex - 1]]}
                                                </Td>
                                            )
                                        })
                                    }
                                    <Td>
                                        <PlaceThisBetButton bet={roundState.bets[betIndex + 1]}
                                                            betNum={betIndex + 1}
                                                            betOdds={betOdds}
                                                            betPayoffs={betPayoffs}/>
                                    </Td>
                                </Tr>
                            )
                        })
                    }
                </Tbody>
                <Tbody>
                    <Tr>
                        <Th isNumeric>Total:</Th>
                        <Th isNumeric>{numberWithCommas(totalBetAmounts)}</Th>
                        <Th isNumeric>{numberWithCommas(totalWinningOdds)}:{totalEnabledBets}</Th>
                        <Th isNumeric>{numberWithCommas(totalWinningPayoff)}</Th>
                        <Th></Th>
                        <Th isNumeric>{totalBetExpectedRatios.toFixed(3)}</Th>
                        <Th isNumeric>{totalBetNetExpected.toFixed(2)}</Th>
                    </Tr>
                </Tbody>
            </>}
        </Table>
    )
}

function PlaceThisBetButton(props) {
    const {betOdds, betPayoffs, bet, betNum} = props;
    const {roundState} = React.useContext(RoundContext);

    if (roundState.roundData.winners.some((x) => x > 0)) {
        return <Button size="xs" isDisabled>Round is over!</Button>
    }

    if (roundState.betAmounts[betNum] < 50) {
        return <Button size="xs" isDisabled>Invalid bet amount!</Button>
    }

    function generate_bet_link(bet, betNum) {
        let urlString = 'http://www.neopets.com/pirates/process_foodclub.phtml?'
        for (let i = 0; i < 5; i++) {
            if (bet[i] !== 0) {
                urlString += `winner${i + 1}=${roundState.roundData.pirates[i][bet[i] - 1]}&`;
            }
        }
        for (let i = 0; i < 5; i++) {
            if (bet[i] !== 0) {
                urlString += `matches[]=${i + 1}&`;
            }
        }
        urlString += `bet_amount=${roundState.betAmounts[betNum]}&`;
        urlString += `total_odds=${betOdds[betNum]}&`;
        urlString += `winnings=${betPayoffs[betNum]}&`;
        urlString += 'type=bet';
        return window.open(urlString);
    }

    return (
        <Button size="xs" onClick={() => generate_bet_link(bet, betNum)}>
            Place this bet!
        </Button>
    )
}

function PirateTable(props) {
    let {pirateFAs, arenaRatios, probabilities, changeBet, getPirateBgColor, green, red} = props;

    return (
        <NormalTable pirateFAs={pirateFAs}
                     arenaRatios={arenaRatios}
                     probabilities={probabilities}
                     changeBet={changeBet}
                     getPirateBgColor={getPirateBgColor}
                     green={green}
                     red={red}/>
    )
}

export default function TheTable() {
    const {roundState, setRoundState} = React.useContext(RoundContext);

    let probabilities = {};
    let pirateFAs = {};
    let arenaRatios = {};
    let betEnabled = [];
    let betOdds = [];
    let betPayoffs = [];
    let betProbabilities = [];
    let betExpectedRatios = [];
    let betNetExpected = [];
    let betMaxBets = [];
    let payoutTables = {};

    if (roundState.roundData) {
        probabilities = computeProbabilities(roundState.roundData);
        pirateFAs = computePirateFAs(roundState.roundData);
        arenaRatios = calculateArenaRatios(roundState.roundData);

        // keep the "cache" of bet data up to date
        for (let betIndex = 1; betIndex <= Object.keys(roundState.bets).length; betIndex++) {
            betEnabled[betIndex] = roundState.bets[betIndex].some((x) => x > 0);
            betOdds[betIndex] = 1;
            betProbabilities[betIndex] = 1;

            for (let arenaIndex = 0; arenaIndex < 5; arenaIndex++) {
                let pirateIndex = roundState.bets[betIndex][arenaIndex];
                betOdds[betIndex] *= roundState.roundData.currentOdds[arenaIndex][pirateIndex];
                betProbabilities[betIndex] *= probabilities.used[arenaIndex][pirateIndex];
            }
            // yes, the for-loop above had to be separate.
            for (let arenaIndex = 0; arenaIndex < 5; arenaIndex++) {
                betPayoffs[betIndex] = Math.min(1_000_000, roundState.betAmounts[betIndex] * betOdds[betIndex]);
                betExpectedRatios[betIndex] = betOdds[betIndex] * betProbabilities[betIndex];
                betNetExpected[betIndex] = betPayoffs[betIndex] * betProbabilities[betIndex] - roundState.betAmounts[betIndex];
                betMaxBets[betIndex] = Math.floor(1_000_000 / betOdds[betIndex]);
            }
        }

        payoutTables = calculatePayoutTables(roundState.roundData, probabilities, betOdds, betPayoffs);
    }

    const theme = useTheme();

    // the dark values are effectively "375"
    const green = useColorModeValue(theme.colors.green["200"], "#50C17F");
    const blue = useColorModeValue(theme.colors.blue["200"], "#4BA0E4");
    const orange = useColorModeValue(theme.colors.orange["200"], "#F0923E");
    const red = useColorModeValue(theme.colors.red["200"], "#F76C6C");

    function getPirateBgColor(openingOdds) {
        // for the cell that has the pirate name in the big table
        if ([3, 4, 5].includes(openingOdds)) return blue;
        if ([6, 7, 8, 9].includes(openingOdds)) return orange;
        if ([10, 11, 12, 13].includes(openingOdds)) return red;
        return green;
    }

    function changeBet(betIndex, arenaIndex, pirateValue) {
        // change a single pirate in a single arena
        let newBets = roundState.bets;
        newBets[betIndex][arenaIndex] = pirateValue;
        setRoundState({bets: {...newBets}}); // hacky way to force an object to update useEffect
    }

    return (
        <Box mt={8}>
            <PirateTable pirateFAs={pirateFAs}
                         arenaRatios={arenaRatios}
                         probabilities={probabilities}
                         changeBet={changeBet}
                         getPirateBgColor={getPirateBgColor}
                         green={green}
                         red={red}/>
            <PayoutTable payoutTables={payoutTables}
                         betEnabled={betEnabled}
                         betProbabilities={betProbabilities}
                         betExpectedRatios={betExpectedRatios}
                         betNetExpected={betNetExpected}
                         betOdds={betOdds}
                         betMaxBets={betMaxBets}
                         betPayoffs={betPayoffs}
                         getPirateBgColor={getPirateBgColor}
                         orange={orange}
                         red={red}
                         green={green}/>
        </Box>
    )
}
