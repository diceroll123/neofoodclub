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
} from "../constants";
import { computePirateBinary } from "../maths";
import {
    displayAsPercent,
    calculateRoundData,
    PirateBgColor,
    Colors,
} from "../util";
import BetExtras from "../components/BetExtras";
import BetFunctions from "../BetFunctions";
import BigBrainElement from "../components/BigBrainElement";
import ClearBetsButton from "../components/ClearBetsButton";
import CopyPayouts from "../components/CopyPayouts";
import CustomOddsElement from "../components/CustomOddsElement";
import CustomOddsInput from "../components/CustomOddsInput";
import CustomProbsInput from "../components/CustomProbsInput";
import FaDetailsElement from "../components/FaDetailsElement";
import HorizontalScrollingBox from "../components/HorizontalScrollingBox";
import PayoutCharts from "../components/PayoutCharts";
import PayoutTable from "../components/PayoutTable";
import Pd from "../components/Pd";
import { RoundContext } from "../RoundState";
import Td from "../components/Td";
import TextTooltip from "../components/TextTooltip";
import TableSettings from "../components/TableSettings";

const StickyTd = (props) => {
    const { children, ...rest } = props;
    return (
        <Td style={{ position: "sticky", left: "0" }} zIndex={1} {...rest}>
            {children}
        </Td>
    );
};

function PirateFA(pirateId, foodId) {
    const { green, red, yellow } = Colors();
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

const NormalTable = (props) => {
    let { calculations } = props;
    const { green, red, yellow, gray } = Colors();
    const { arenaRatios, winningBetBinary, probabilities, pirateFAs } =
        calculations;
    const { roundState, setRoundState } = useContext(RoundContext);
    const amountOfBets = Object.keys(roundState.bets).length;

    function changeBet(betIndex, arenaIndex, pirateIndex) {
        // change a single pirate in a single arena
        let newBets = roundState.bets;
        newBets[betIndex][arenaIndex] = pirateIndex;
        setRoundState({ bets: { ...newBets } }); // hacky way to force an object to update useEffect
    }

    function changeBetLine(arenaIndex, pirateValue) {
        // change the entire row to pirateValue
        // for the 10-bet button
        let newBets = roundState.bets;
        for (let x = 1; x <= amountOfBets; x++) {
            newBets[x][arenaIndex] = pirateValue;
        }
        setRoundState({ bets: { ...newBets } }); // hacky way to force an object to update useEffect
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
                                    <TextTooltip
                                        text={displayAsPercent(
                                            arenaRatios[arenaId],
                                            1
                                        )}
                                        label={arenaRatios[arenaId] * 100}
                                    />
                                ) : (
                                    <Skeleton>
                                        <Box>&nbsp;</Box>
                                    </Skeleton>
                                )}
                            </BigBrainElement>
                            <Td
                                backgroundColor={gray}
                                colSpan={roundState.advanced.bigBrain ? 6 : 1}
                            />
                            <CustomOddsElement
                                as={Td}
                                backgroundColor={gray}
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
                                                    backgroundColor={gray}
                                                >
                                                    <TextTooltip text={food} />
                                                </FaDetailsElement>
                                            );
                                        }
                                    )}
                                </>
                            ) : null}

                            <Td backgroundColor={gray} colSpan={2} />
                            <CustomOddsElement as={Td} backgroundColor={gray} />
                            {/*<Td>showOddsTimeline</Td>*/}
                            {roundState.roundData ? (
                                <>
                                    {[...Array(amountOfBets)].map(
                                        (bet, betNum) => {
                                            return (
                                                <Td
                                                    key={betNum}
                                                    backgroundColor={gray}
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
                                    <Td backgroundColor={gray}>
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
                                    <Td colSpan={100} backgroundColor={gray}>
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
                                        backgroundColor={PirateBgColor(opening)}
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
                                                return PirateFA(
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
    let { winningBetBinary, ...rest } = props;
    const { green } = Colors();
    const { roundState, setRoundState } = useContext(RoundContext);
    const amountOfBets = Object.keys(roundState.bets).length;

    function changeBet(betIndex, arenaIndex, pirateIndex) {
        // change a single pirate in a single arena
        let newBets = roundState.bets;
        newBets[betIndex][arenaIndex] = pirateIndex;
        setRoundState({ bets: { ...newBets } }); // hacky way to force an object to update useEffect
    }

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
                                                    PirateBgColor(opening);
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
                                    pirateBg = PirateBgColor(opening);
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
                                                                    PirateBgColor(
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
    const { roundState } = useContext(RoundContext);
    if (roundState.tableMode === "dropdown") {
        return <DropDownTable {...props} />;
    }

    return <NormalTable {...props} />;
};

export default function EditBets(props) {
    const { roundState } = useContext(RoundContext);

    let calculations = calculateRoundData(roundState);

    const { betBinaries } = calculations;

    return (
        <>
            <TableSettings />

            <HorizontalScrollingBox>
                <PirateTable m={4} calculations={calculations} />
            </HorizontalScrollingBox>

            <BetFunctions calculations={calculations} />

            {Object.values(betBinaries).reduce((a, b) => a + b, 0) > 0 && (
                <>
                    <BetExtras calculations={calculations} />

                    <HorizontalScrollingBox>
                        <PayoutTable calculations={calculations} />
                    </HorizontalScrollingBox>

                    <CopyPayouts calculations={calculations} />

                    <HorizontalScrollingBox>
                        <PayoutCharts calculations={calculations} />
                    </HorizontalScrollingBox>
                </>
            )}
        </>
    );
}
