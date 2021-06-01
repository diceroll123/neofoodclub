import {
    Box,
    Button,
    Radio,
    Select,
    Skeleton,
    StatArrow,
    Table,
    Tbody,
    Text,
    Th,
    Thead,
    Tr,
} from "@chakra-ui/react";
import React, { useContext } from "react";

import {
    ARENA_NAMES,
    FOODS,
    NEGATIVE_FAS,
    PIRATE_NAMES,
    POSITIVE_FAS,
} from "./constants";
import {
    calculateArenaRatios,
    calculatePayoutTables,
    computePirateBinary,
    computePirateFAs,
    computePiratesBinary,
    computeProbabilities,
} from "./maths";
import { displayAsPercent } from "./util";
import BetExtras from "./components/BetExtras";
import BetFunctions from "./BetFunctions";
import BigBrainElement from "./components/BigBrainElement";
import ClearBetsButton from "./components/ClearBetsButton";
import CopyPayouts from "./components/CopyPayouts";
import CustomOddsElement from "./components/CustomOddsElement";
import CustomOddsInput from "./components/CustomOddsInput";
import CustomProbsInput from "./components/CustomProbsInput";
import FaDetailsElement from "./components/FaDetailsElement";
import HorizontalScrollingBox from "./components/HorizontalScrollingBox";
import PayoutCharts from "./components/PayoutCharts";
import PayoutTable from "./components/PayoutTable";
import Pd from "./components/Pd";
import RoundContext from "./RoundState";
import Td from "./components/Td";
import TextTooltip from "./components/TextTooltip";

const NormalTable = (props) => {
    let {
        pirateFAs,
        arenaRatios,
        probabilities,
        changeBet,
        getPirateBgColor,
        winningBetBinary,
        green,
        red,
        yellow,
        grayAccent,
    } = props;
    const { roundState, setRoundState } = useContext(RoundContext);
    const amountOfBets = Object.keys(roundState.bets).length;

    function changeBetLine(arenaIndex, pirateValue) {
        // change the entire row to pirateValue
        // for the 10-bet button
        let newBets = roundState.bets;
        for (let x = 1; x <= amountOfBets; x++) {
            newBets[x][arenaIndex] = pirateValue;
        }
        setRoundState({ bets: { ...newBets } }); // hacky way to force an object to update useEffect
    }

    const StickyTd = (props) => {
        const { children, ...rest } = props;
        return (
            <Td style={{ position: "sticky", left: "0" }} zIndex={1} {...rest}>
                {children}
            </Td>
        );
    };

    function calculatePirateFA(pirateId, foodId) {
        // returns the FA <td> element for the associated pirate/food
        let pos = POSITIVE_FAS[pirateId][foodId];
        let neg = NEGATIVE_FAS[pirateId][foodId];

        // by default, transparent + empty string if FA is 0
        let color = "transparent";
        let indicator = "";

        if (pos && neg) {
            color = yellow;
            indicator = `+${pos}/-${neg}`;
        } else if (pos) {
            color = green;
            indicator = `+${pos}`;
        } else if (neg) {
            color = red;
            indicator = `-${neg}`;
        }

        return (
            <FaDetailsElement
                key={foodId}
                as={Pd}
                isNumeric
                backgroundColor={color}
                whiteSpace="nowrap"
            >
                <Text as={"b"}>{indicator}</Text>
            </FaDetailsElement>
        );
    }

    return (
        <Table size="sm" width="auto">
            <Thead>
                <Tr>
                    <Th>Arena</Th>
                    <BigBrainElement as={Th}>Ratio</BigBrainElement>
                    <Th>Pirate</Th>
                    <BigBrainElement as={Th}>Min Prob</BigBrainElement>
                    <BigBrainElement as={Th}>Max Prob</BigBrainElement>
                    <BigBrainElement as={Th}>Std Prob</BigBrainElement>
                    <CustomOddsElement as={Th}>
                        <TextTooltip
                            text="Custom Prob"
                            label="Custom Std. Probability"
                        />
                    </CustomOddsElement>
                    <CustomOddsElement as={Th}>
                        <TextTooltip
                            text="Used"
                            label="Used Std. Probability"
                        />
                    </CustomOddsElement>
                    <BigBrainElement as={Th}>Payout</BigBrainElement>
                    <BigBrainElement as={Th}>
                        <TextTooltip text="FA" label="Food Adjustment" />
                    </BigBrainElement>
                    <FaDetailsElement as={Th} colSpan={10}>
                        FA Explanation
                    </FaDetailsElement>
                    <Th>
                        <TextTooltip text="Open" label="Opening Odds" />
                    </Th>
                    <Th>
                        <TextTooltip text="Curr" label="Current Odds" />
                    </Th>
                    <CustomOddsElement as={Th}>
                        <TextTooltip text="Custom Odds" />
                    </CustomOddsElement>
                    {/*<Th>Timeline</Th>*/}
                    {[...Array(amountOfBets)].map((e, i) => {
                        return <Th key={i}>Bet {i + 1}</Th>;
                    })}
                    <Th>
                        <ClearBetsButton />
                    </Th>
                </Tr>
            </Thead>
            {ARENA_NAMES.map((arenaName, arenaId) => {
                let pirates;
                if (roundState.roundData) {
                    pirates = roundState.roundData.pirates[arenaId];
                } else {
                    pirates = [...Array(4)];
                }

                return (
                    <Tbody key={arenaId}>
                        <Tr>
                            <Td rowSpan={5}>{arenaName}</Td>
                            <BigBrainElement as={Td} rowSpan={5} isNumeric>
                                {roundState.roundData ? (
                                    <Text>
                                        {displayAsPercent(
                                            arenaRatios[arenaId],
                                            1
                                        )}
                                    </Text>
                                ) : (
                                    <Skeleton>
                                        <Box>&nbsp;</Box>
                                    </Skeleton>
                                )}
                            </BigBrainElement>
                            <Td
                                backgroundColor={grayAccent}
                                colSpan={roundState.advanced.bigBrain ? 6 : 1}
                            />
                            <CustomOddsElement
                                as={Td}
                                backgroundColor={grayAccent}
                                colSpan={2}
                            />

                            {roundState.roundData?.foods ? (
                                <>
                                    {roundState.roundData.foods[arenaId].map(
                                        (foodId) => {
                                            const food = FOODS[foodId];
                                            return (
                                                <FaDetailsElement
                                                    key={foodId}
                                                    as={Pd}
                                                    whiteSpace="nowrap"
                                                    overflow="hidden"
                                                    textOverflow="ellipsis"
                                                    backgroundColor={grayAccent}
                                                >
                                                    <TextTooltip text={food} />
                                                </FaDetailsElement>
                                            );
                                        }
                                    )}
                                </>
                            ) : null}

                            <Td backgroundColor={grayAccent} colSpan={2} />
                            <CustomOddsElement
                                as={Td}
                                backgroundColor={grayAccent}
                            />
                            {/*<Td>showOddsTimeline</Td>*/}
                            {roundState.roundData ? (
                                <>
                                    {[...Array(amountOfBets)].map(
                                        (bet, betNum) => {
                                            return (
                                                <Td
                                                    key={betNum}
                                                    backgroundColor={grayAccent}
                                                >
                                                    <Radio
                                                        name={
                                                            "bet" +
                                                            (betNum + 1) +
                                                            arenaId
                                                        }
                                                        value={0}
                                                        onChange={() =>
                                                            changeBet(
                                                                betNum + 1,
                                                                arenaId,
                                                                0
                                                            )
                                                        }
                                                        isChecked={
                                                            roundState.bets[
                                                                betNum + 1
                                                            ][arenaId] === 0
                                                        }
                                                    />
                                                </Td>
                                            );
                                        }
                                    )}
                                    <Td backgroundColor={grayAccent}>
                                        <Button
                                            size="xs"
                                            variant="outline"
                                            onClick={() => {
                                                changeBetLine(arenaId, 0);
                                            }}
                                        >
                                            {amountOfBets}-Bet
                                        </Button>
                                    </Td>
                                </>
                            ) : (
                                <>
                                    <Td
                                        colSpan={100}
                                        backgroundColor={grayAccent}
                                    >
                                        <Skeleton height="24px">
                                            <Box>&nbsp;</Box>
                                        </Skeleton>
                                    </Td>
                                </>
                            )}
                        </Tr>

                        {pirates.map((pirateId, pirateIndex) => {
                            if (!roundState.roundData) {
                                // big ol skeleton
                                return (
                                    <Tr key={pirateIndex}>
                                        <Td colSpan={100}>
                                            <Skeleton height="24px">
                                                &nbsp;
                                            </Skeleton>
                                        </Td>
                                    </Tr>
                                );
                            }

                            let opening =
                                roundState.roundData.openingOdds[arenaId][
                                    pirateIndex + 1
                                ];
                            let current =
                                roundState.roundData.currentOdds[arenaId][
                                    pirateIndex + 1
                                ];
                            let custom =
                                roundState.customOdds[arenaId][pirateIndex + 1];
                            const useCustom =
                                roundState.advanced.bigBrain &&
                                roundState.advanced.customOddsMode;
                            const useOdds = useCustom ? custom : current;

                            let bgColor = "transparent";
                            let pirateBin = computePirateBinary(
                                arenaId,
                                pirateIndex + 1
                            );
                            if ((winningBetBinary & pirateBin) === pirateBin) {
                                bgColor = green;
                            }

                            let prob =
                                probabilities.used[arenaId][pirateIndex + 1];
                            if (useCustom) {
                                let tempProb =
                                    roundState.customProbs[arenaId][
                                        pirateIndex + 1
                                    ];
                                if (tempProb !== 0) {
                                    prob = tempProb;
                                }
                            }

                            const payout = useOdds * prob - 1;
                            let payoutBackground = "transparent";
                            if (payout > 0) {
                                payoutBackground = green;
                            } else if (payout <= -0.1) {
                                payoutBackground = red;
                            }

                            return (
                                <Tr key={pirateId} backgroundColor={bgColor}>
                                    <StickyTd
                                        backgroundColor={getPirateBgColor(
                                            opening
                                        )}
                                    >
                                        {PIRATE_NAMES[pirateId]}
                                    </StickyTd>
                                    <BigBrainElement as={Td} isNumeric>
                                        {displayAsPercent(
                                            probabilities.min[arenaId][
                                                pirateIndex + 1
                                            ],
                                            1
                                        )}
                                    </BigBrainElement>
                                    <BigBrainElement as={Td} isNumeric>
                                        {displayAsPercent(
                                            probabilities.max[arenaId][
                                                pirateIndex + 1
                                            ],
                                            1
                                        )}
                                    </BigBrainElement>
                                    <BigBrainElement as={Td} isNumeric>
                                        {displayAsPercent(
                                            probabilities.std[arenaId][
                                                pirateIndex + 1
                                            ],
                                            1
                                        )}
                                    </BigBrainElement>
                                    <CustomOddsElement as={Td} isNumeric>
                                        <CustomProbsInput
                                            arenaIndex={arenaId}
                                            pirateIndex={pirateIndex + 1}
                                            probabilities={probabilities}
                                        />
                                    </CustomOddsElement>
                                    <CustomOddsElement as={Td} isNumeric>
                                        {displayAsPercent(prob, 1)}
                                    </CustomOddsElement>
                                    <BigBrainElement
                                        as={Td}
                                        backgroundColor={payoutBackground}
                                        isNumeric
                                    >
                                        {displayAsPercent(payout, 1)}
                                    </BigBrainElement>
                                    {roundState.roundData?.foods ? (
                                        <>
                                            <BigBrainElement as={Td} isNumeric>
                                                {
                                                    pirateFAs[arenaId][
                                                        pirateIndex
                                                    ]
                                                }
                                            </BigBrainElement>
                                            {roundState.roundData.foods[
                                                arenaId
                                            ].map((foodId) => {
                                                return calculatePirateFA(
                                                    pirateId,
                                                    foodId
                                                );
                                            })}
                                        </>
                                    ) : (
                                        <BigBrainElement as={Td} isNumeric>
                                            N/A
                                        </BigBrainElement>
                                    )}
                                    <Td isNumeric>{opening}:1</Td>
                                    <Td isNumeric whiteSpace="nowrap">
                                        {current > opening && (
                                            <StatArrow
                                                mr={1}
                                                type="increase"
                                                style={{ stroke: "#000000" }}
                                            />
                                        )}
                                        {current < opening && (
                                            <StatArrow
                                                mr={1}
                                                type="decrease"
                                                style={{ stroke: "#000000" }}
                                            />
                                        )}
                                        <Text
                                            as={current === opening ? "" : "b"}
                                        >
                                            {current}:1
                                        </Text>
                                    </Td>
                                    <CustomOddsElement as={Td}>
                                        <CustomOddsInput
                                            arenaIndex={arenaId}
                                            pirateIndex={pirateIndex + 1}
                                        />
                                    </CustomOddsElement>
                                    {/* Odds Timeline */}
                                    {[...Array(amountOfBets)].map(
                                        (bet, betNum) => {
                                            return (
                                                <Td key={betNum}>
                                                    <Radio
                                                        name={
                                                            "bet" +
                                                            (betNum + 1) +
                                                            arenaId
                                                        }
                                                        value={pirateIndex + 1}
                                                        onChange={() =>
                                                            changeBet(
                                                                betNum + 1,
                                                                arenaId,
                                                                pirateIndex + 1
                                                            )
                                                        }
                                                        isChecked={
                                                            roundState.bets[
                                                                betNum + 1
                                                            ][arenaId] ===
                                                            pirateIndex + 1
                                                        }
                                                    />
                                                </Td>
                                            );
                                        }
                                    )}
                                    <Td>
                                        <Button
                                            size="xs"
                                            onClick={() => {
                                                changeBetLine(
                                                    arenaId,
                                                    pirateIndex + 1
                                                );
                                            }}
                                        >
                                            {amountOfBets}-Bet
                                        </Button>
                                    </Td>
                                </Tr>
                            );
                        })}
                    </Tbody>
                );
            })}
        </Table>
    );
};

const DropDownTable = (props) => {
    let { changeBet, getPirateBgColor, green, winningBetBinary, ...rest } =
        props;
    const { roundState } = useContext(RoundContext);
    const amountOfBets = Object.keys(roundState.bets).length;

    return (
        <Table size="sm" width="auto" {...rest}>
            <Thead>
                <Tr>
                    {ARENA_NAMES.map((arenaName, arenaId) => {
                        return <Th>{arenaName}</Th>;
                    })}
                    <Th>
                        <ClearBetsButton />
                    </Th>
                </Tr>
            </Thead>
            <Tbody>
                <Tr>
                    {[...Array(5)].map((_, arenaId) => {
                        let pirates;
                        if (roundState.roundData) {
                            pirates = roundState.roundData.pirates[arenaId];
                        } else {
                            pirates = [...Array(4)];
                        }

                        return (
                            <Pd key={arenaId}>
                                <Table size="sm" maxW="150px">
                                    <Tbody>
                                        {pirates.map(
                                            (pirateId, pirateIndex) => {
                                                if (
                                                    roundState.roundData ===
                                                    null
                                                ) {
                                                    // big ol skeleton
                                                    return (
                                                        <Tr key={pirateIndex}>
                                                            <Pd>
                                                                <Skeleton
                                                                    width="150px"
                                                                    height="24px"
                                                                >
                                                                    &nbsp;
                                                                </Skeleton>
                                                            </Pd>
                                                        </Tr>
                                                    );
                                                }

                                                let opening =
                                                    roundState.roundData
                                                        .openingOdds[arenaId][
                                                        pirateIndex + 1
                                                    ];
                                                let current =
                                                    roundState.roundData
                                                        .currentOdds[arenaId][
                                                        pirateIndex + 1
                                                    ];

                                                let pirateBg =
                                                    getPirateBgColor(opening);
                                                let trBg = "transparent";
                                                let pirateBin =
                                                    computePirateBinary(
                                                        arenaId,
                                                        pirateIndex + 1
                                                    );
                                                if (
                                                    (winningBetBinary &
                                                        pirateBin) ===
                                                    pirateBin
                                                ) {
                                                    trBg = green;
                                                    pirateBg = green;
                                                }

                                                return (
                                                    <Tr
                                                        key={pirateId}
                                                        backgroundColor={trBg}
                                                    >
                                                        <Pd
                                                            whiteSpace="nowrap"
                                                            backgroundColor={
                                                                pirateBg
                                                            }
                                                        >
                                                            {
                                                                PIRATE_NAMES[
                                                                    pirateId
                                                                ]
                                                            }
                                                        </Pd>
                                                        <Pd isNumeric>
                                                            {opening}:1
                                                        </Pd>
                                                        <Pd isNumeric>
                                                            <Text
                                                                as={
                                                                    current ===
                                                                    opening
                                                                        ? ""
                                                                        : "b"
                                                                }
                                                            >
                                                                {current}:1
                                                            </Text>
                                                        </Pd>
                                                    </Tr>
                                                );
                                            }
                                        )}
                                    </Tbody>
                                </Table>
                            </Pd>
                        );
                    })}
                </Tr>
            </Tbody>
            <Tbody>
                {[...Array(amountOfBets)].map((bet, betNum) => {
                    return (
                        <Tr key={betNum}>
                            {[...Array(5)].map((_, arenaId) => {
                                if (roundState.roundData === null) {
                                    return (
                                        <Pd key={arenaId}>
                                            <Skeleton height="24px">
                                                <Box>&nbsp;</Box>
                                            </Skeleton>
                                        </Pd>
                                    );
                                }
                                let pirates =
                                    roundState.roundData.pirates[arenaId];
                                let pirateIndex =
                                    roundState.bets[betNum + 1][arenaId];
                                let opening =
                                    roundState.roundData.openingOdds[arenaId][
                                        pirateIndex
                                    ];

                                let pirateBg = "transparent";

                                if (opening > 1) {
                                    pirateBg = getPirateBgColor(opening);
                                }

                                return (
                                    <Pd key={arenaId}>
                                        <Select
                                            size="sm"
                                            height="1.5rem"
                                            backgroundColor={pirateBg}
                                            value={pirateIndex}
                                            onChange={(e) =>
                                                changeBet(
                                                    betNum + 1,
                                                    arenaId,
                                                    parseInt(e.target.value)
                                                )
                                            }
                                        >
                                            <option value="0" />
                                            {pirates.map(
                                                (pirateId, pirateIndex) => {
                                                    return (
                                                        <option
                                                            key={pirateId}
                                                            style={{
                                                                background:
                                                                    getPirateBgColor(
                                                                        roundState
                                                                            .roundData
                                                                            .openingOdds[
                                                                            arenaId
                                                                        ][
                                                                            pirateIndex +
                                                                                1
                                                                        ]
                                                                    ),
                                                            }}
                                                            value={
                                                                pirateIndex + 1
                                                            }
                                                        >
                                                            {
                                                                PIRATE_NAMES[
                                                                    pirateId
                                                                ]
                                                            }
                                                        </option>
                                                    );
                                                }
                                            )}
                                        </Select>
                                    </Pd>
                                );
                            })}
                        </Tr>
                    );
                })}
            </Tbody>
        </Table>
    );
};

const PirateTable = (props) => {
    const { roundState, setRoundState } = useContext(RoundContext);

    function changeBet(betIndex, arenaIndex, pirateIndex) {
        // change a single pirate in a single arena
        let newBets = roundState.bets;
        newBets[betIndex][arenaIndex] = pirateIndex;
        setRoundState({ bets: { ...newBets } }); // hacky way to force an object to update useEffect
    }

    if (roundState.tableMode === "dropdown") {
        return <DropDownTable changeBet={changeBet} {...props} />;
    }

    return <NormalTable changeBet={changeBet} {...props} />;
};

export default function TheTable(props) {
    const { roundState } = useContext(RoundContext);
    const { blue, green, red, orange, yellow, grayAccent } = props;

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

    if (roundState.roundData) {
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

        payoutTables = calculatePayoutTables(
            roundState,
            probabilities.used,
            betOdds,
            betPayoffs
        );
    }

    function getPirateBgColor(openingOdds) {
        // for the cell that has the pirate name in the big table
        if ([3, 4, 5].includes(openingOdds)) return blue;
        if ([6, 7, 8, 9].includes(openingOdds)) return orange;
        if ([10, 11, 12, 13].includes(openingOdds)) return red;
        return green;
    }

    return (
        <>
            <HorizontalScrollingBox>
                <PirateTable
                    m={4}
                    pirateFAs={pirateFAs}
                    arenaRatios={arenaRatios}
                    probabilities={probabilities}
                    getPirateBgColor={getPirateBgColor}
                    winningBetBinary={winningBetBinary}
                    green={green}
                    red={red}
                    yellow={yellow}
                    grayAccent={grayAccent}
                />
            </HorizontalScrollingBox>

            <BetFunctions
                background={grayAccent}
                probabilities={probabilities}
                arenaRatios={arenaRatios}
            />

            {Object.values(betBinaries).reduce((a, b) => a + b, 0) > 0 && (
                <>
                    <BetExtras
                        background={grayAccent}
                        betBinaries={betBinaries}
                        betOdds={betOdds}
                    />

                    <HorizontalScrollingBox>
                        <PayoutTable
                            betBinaries={betBinaries}
                            betProbabilities={betProbabilities}
                            betExpectedRatios={betExpectedRatios}
                            betNetExpected={betNetExpected}
                            betOdds={betOdds}
                            betMaxBets={betMaxBets}
                            betPayoffs={betPayoffs}
                            winningBetBinary={winningBetBinary}
                            getPirateBgColor={getPirateBgColor}
                            orange={orange}
                            red={red}
                            yellow={yellow}
                            green={green}
                        />
                    </HorizontalScrollingBox>

                    <CopyPayouts
                        background={grayAccent}
                        betBinaries={betBinaries}
                        betOdds={betOdds}
                        betExpectedRatios={betExpectedRatios}
                        payoutTables={payoutTables}
                    />

                    <HorizontalScrollingBox>
                        <PayoutCharts
                            payoutTables={payoutTables}
                            betBinaries={betBinaries}
                            grayAccent={grayAccent}
                        />
                    </HorizontalScrollingBox>
                </>
            )}
        </>
    );
}
