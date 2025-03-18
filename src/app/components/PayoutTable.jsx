import { ArrowDownIcon, ArrowUpIcon } from "@chakra-ui/icons";
import {
    Box,
    Skeleton,
    Table,
    Thead,
    Th,
    Tr,
    Tbody,
    HStack,
    Spacer,
    Text,
    IconButton,
} from "@chakra-ui/react";
import React, { useContext, memo } from "react";

import { PIRATE_NAMES } from "../constants";
import { computePirateBinary } from "../maths";
import { displayAsPercent } from "../util";
import BetAmountInput from "./BetAmountInput";
import Pd from "./Pd";
import PlaceThisBetButton from "./PlaceThisBetButton";
import { RoundContext } from "../RoundState";
import Td from "./Td";
import TextTooltip from "./TextTooltip";

// this element is the colorful and informative table full of your bet data

const PayoutTable = memo((props) => {
    const { blue, orange, green, red, yellow, getPirateBgColor, ...rest } =
        props;
    const {
        roundState,
        calculations,
        currentBet,
        allBets,
        setAllBets,
        allBetAmounts,
        setAllBetAmounts,
    } = useContext(RoundContext);

    const {
        calculated,
        betBinaries,
        betExpectedRatios,
        betProbabilities,
        betNetExpected,
        betOdds,
        betPayoffs,
        betMaxBets,
        winningBetBinary,
        totalBetAmounts,
        totalBetExpectedRatios,
        totalBetNetExpected,
        totalWinningPayoff,
        totalWinningOdds,
        totalEnabledBets,
    } = calculations;
    const amountOfBets = Object.keys(allBets[currentBet]).length;

    const swapBets = (index, newIndex) => {
        let bets = allBets[currentBet];
        let betAmounts = allBetAmounts[currentBet];
        [bets[index], bets[newIndex]] = [bets[newIndex], bets[index]];
        [betAmounts[index], betAmounts[newIndex]] = [
            betAmounts[newIndex],
            betAmounts[index],
        ];
        setAllBets({ ...allBets, [currentBet]: bets });
        setAllBetAmounts({ ...allBetAmounts, [currentBet]: betAmounts });
    };

    const getMaxBetColor = (betNum) => {
        let betAmount = allBetAmounts[currentBet][betNum];
        let div = 1_000_000 / betOdds[betNum];
        if (betAmount > Math.ceil(div)) {
            return orange;
        }
        if (betAmount > Math.floor(div)) {
            return yellow;
        }
        return "transparent";
    };

    return (
        <Table size="sm" width="auto" {...rest}>
            <Thead>
                <Tr>
                    <Th>Bet #</Th>
                    <Th>Amount</Th>
                    <Th>Odds</Th>
                    <Th>Payoff</Th>
                    <Th>
                        <TextTooltip text="Prob." label="Probability" />
                    </Th>
                    <Th>
                        <TextTooltip text="E.R." label="Expected Ratio" />
                    </Th>
                    <Th>
                        <TextTooltip text="N.E." label="Net Expected" />
                    </Th>
                    <Th>Maxbet</Th>
                    <Th>Shipwreck</Th>
                    <Th>Lagoon</Th>
                    <Th>Treasure</Th>
                    <Th>Hidden</Th>
                    <Th>Harpoon</Th>
                    <Th>Submit</Th>
                </Tr>
            </Thead>

            {roundState.roundData && calculated ? (
                <>
                    <Tbody>
                        {[...Array(amountOfBets)].map((e, betIndex) => {
                            const betBinary = betBinaries[betIndex + 1];

                            if (betBinary === 0 || betBinary === undefined) {
                                return null;
                            }

                            let er = betExpectedRatios[betIndex + 1];
                            let erBg = er - 1 < 0 ? red : "transparent";

                            let ne = betNetExpected[betIndex + 1];
                            let neBg = ne - 1 < 0 ? red : "transparent";

                            let betAmount =
                                allBetAmounts[currentBet][betIndex + 1];
                            let baBg =
                                betAmount < 50
                                    ? red
                                    : getMaxBetColor(betIndex + 1);
                            let mbBg = getMaxBetColor(betIndex + 1);

                            let betNumBgColor = "transparent";

                            if (winningBetBinary) {
                                betNumBgColor =
                                    (winningBetBinary & betBinary) === betBinary
                                        ? green
                                        : red;
                            }

                            return (
                                <Tr key={betIndex}>
                                    <Pd backgroundColor={betNumBgColor}>
                                        <HStack px={2} gap={1}>
                                            <Spacer />
                                            <Text>{betIndex + 1}</Text>

                                            {roundState.viewMode === false && (
                                                <>
                                                    <Spacer />
                                                    <HStack spacing="1px">
                                                        <IconButton
                                                            size="xs"
                                                            height="20px"
                                                            icon={
                                                                <ArrowUpIcon />
                                                            }
                                                            onClick={() =>
                                                                swapBets(
                                                                    betIndex +
                                                                        1,
                                                                    betIndex
                                                                )
                                                            }
                                                            isDisabled={
                                                                betIndex === 0
                                                            }
                                                        />
                                                        <IconButton
                                                            size="xs"
                                                            height="20px"
                                                            icon={
                                                                <ArrowDownIcon />
                                                            }
                                                            onClick={() =>
                                                                swapBets(
                                                                    betIndex +
                                                                        1,
                                                                    betIndex + 2
                                                                )
                                                            }
                                                            isDisabled={
                                                                betIndex ===
                                                                amountOfBets - 1
                                                            }
                                                        />
                                                    </HStack>
                                                </>
                                            )}
                                            <Spacer />
                                        </HStack>
                                    </Pd>
                                    <Pd>
                                        <BetAmountInput
                                            betIndex={betIndex}
                                            isInvalid={baBg !== "transparent"}
                                            errorBorderColor={baBg}
                                        />
                                    </Pd>
                                    <Td isNumeric>
                                        {betOdds[betIndex + 1].toLocaleString()}
                                        :1
                                    </Td>
                                    <Td isNumeric>
                                        {betPayoffs[
                                            betIndex + 1
                                        ].toLocaleString()}
                                    </Td>
                                    <Td isNumeric>
                                        <TextTooltip
                                            text={displayAsPercent(
                                                betProbabilities[betIndex + 1],
                                                3
                                            )}
                                            label={displayAsPercent(
                                                betProbabilities[betIndex + 1]
                                            )}
                                        />
                                    </Td>
                                    <Td isNumeric backgroundColor={erBg}>
                                        <TextTooltip
                                            text={er.toFixed(3) + ":1"}
                                            label={er}
                                        />
                                    </Td>
                                    <Td isNumeric backgroundColor={neBg}>
                                        <TextTooltip
                                            text={ne
                                                .toFixed(2)
                                                .toLocaleString()}
                                            label={ne}
                                        />
                                    </Td>
                                    <Td isNumeric backgroundColor={mbBg}>
                                        {betMaxBets[
                                            betIndex + 1
                                        ].toLocaleString()}
                                    </Td>
                                    {[...Array(5)].map((e, arenaIndex) => {
                                        let pirateIndex =
                                            allBets[currentBet][betIndex + 1][
                                                arenaIndex
                                            ];
                                        let bgColor = "transparent";
                                        if (pirateIndex) {
                                            if (winningBetBinary) {
                                                const pirateBin =
                                                    computePirateBinary(
                                                        arenaIndex,
                                                        pirateIndex
                                                    );
                                                if (
                                                    (winningBetBinary &
                                                        pirateBin) ===
                                                    pirateBin
                                                ) {
                                                    bgColor = green;
                                                } else {
                                                    bgColor = red;
                                                }
                                            } else {
                                                bgColor = getPirateBgColor(
                                                    roundState.roundData
                                                        .openingOdds[
                                                        arenaIndex
                                                    ][pirateIndex]
                                                );
                                            }
                                        }
                                        return (
                                            <Td
                                                key={arenaIndex}
                                                backgroundColor={bgColor}
                                            >
                                                {
                                                    PIRATE_NAMES[
                                                        roundState.roundData
                                                            .pirates[
                                                            arenaIndex
                                                        ][pirateIndex - 1]
                                                    ]
                                                }
                                            </Td>
                                        );
                                    })}
                                    <Td>
                                        <PlaceThisBetButton
                                            bet={
                                                allBets[currentBet][
                                                    betIndex + 1
                                                ]
                                            }
                                            betNum={betIndex + 1}
                                        />
                                    </Td>
                                </Tr>
                            );
                        })}
                    </Tbody>
                    <Tbody>
                        <Tr>
                            <Th isNumeric>Total:</Th>
                            <Th isNumeric>
                                {totalBetAmounts.toLocaleString()}
                            </Th>
                            <Th isNumeric>
                                {winningBetBinary > 0 && (
                                    <Text>
                                        {totalWinningOdds.toLocaleString()}:
                                        {totalEnabledBets}
                                    </Text>
                                )}
                            </Th>
                            <Th isNumeric>
                                {winningBetBinary > 0 && (
                                    <Text>
                                        {totalWinningPayoff.toLocaleString()}
                                    </Text>
                                )}
                            </Th>
                            <Th />
                            <Th isNumeric>
                                <TextTooltip
                                    text={totalBetExpectedRatios.toFixed(3)}
                                    label={totalBetExpectedRatios}
                                />
                            </Th>
                            <Th isNumeric>
                                <TextTooltip
                                    text={totalBetNetExpected
                                        .toFixed(2)
                                        .toLocaleString()}
                                    label={totalBetNetExpected}
                                />
                            </Th>
                            <Th />
                            <Th />
                            <Th />
                            <Th />
                            <Th />
                            <Th />
                            <Th />
                        </Tr>
                    </Tbody>
                </>
            ) : (
                <Tbody>
                    {[...Array(amountOfBets)].map((_, index) => {
                        return (
                            <Tr key={index}>
                                <Td colSpan={14}>
                                    <Skeleton height="30px">
                                        <Box>&nbsp;</Box>
                                    </Skeleton>
                                </Td>
                            </Tr>
                        );
                    })}
                </Tbody>
            )}
        </Table>
    );
});

export default PayoutTable;
