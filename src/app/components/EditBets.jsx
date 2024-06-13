import { TriangleDownIcon, TriangleUpIcon } from "@chakra-ui/icons";
import {
    Box,
    Button,
    Icon,
    Radio,
    Skeleton,
    Table,
    Tbody,
    Text,
    Th,
    Thead,
    Tr,
    Collapse,
    useColorModeValue,
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
import { displayAsPercent, anyBetsExist, getOdds } from "../util";
import BetAmountsSettings from "./BetAmountsSettings";
import BetFunctions from "../BetFunctions";
import BigBrainElement from "./BigBrainElement";
import ClearBetsButton from "./ClearBetsButton";
import CustomOddsElement from "./CustomOddsElement";
import CustomOddsInput from "./CustomOddsInput";
import CustomProbsInput from "./CustomProbsInput";
import FaDetailsElement from "./FaDetailsElement";
import HorizontalScrollingBox from "./HorizontalScrollingBox";
import PayoutCharts from "./PayoutCharts";
import PayoutTable from "./PayoutTable";
import PirateSelect from "./PirateSelect";
import Pd from "./Pd";
import { RoundContext } from "../RoundState";
import Td from "./Td";
import TextTooltip from "./TextTooltip";
import TableSettings from "./TableSettings";
import { FaEdit } from "react-icons/fa";

const StickyTd = (props) => {
    const { children, ...rest } = props;
    return (
        <Td style={{ position: "sticky", left: "0" }} zIndex={1} {...rest}>
            {children}
        </Td>
    );
};

function PirateFA(props) {
    const { pirateId, foodId } = props;
    // returns the FA <td> element for the associated pirate/food
    const green = useColorModeValue("nfc.green", "nfc.greenDark");
    const red = useColorModeValue("nfc.red", "nfc.redDark");
    const yellow = useColorModeValue("nfc.yellow", "nfc.yellowDark");

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
    const { red, green, getPirateBgColor } = props;
    const gray = useColorModeValue("nfc.gray", "nfc.grayDark");
    const { roundState, setRoundState, calculations } =
        useContext(RoundContext);
    const { arenaRatios, winningBetBinary, legacyProbabilities, logitProbabilities, usedProbabilities, pirateFAs } =
        calculations;
    const amountOfBets = Object.keys(roundState.bets).length;


    const changeBet = (betIndex, arenaIndex, pirateIndex) => {
        // change a single pirate in a single arena
        let newBets = roundState.bets;
        newBets[betIndex][arenaIndex] = pirateIndex;
        setRoundState({ bets: { ...newBets } }); // hacky way to force an object to update useEffect
    }

    const changeBetLine = (arenaIndex, pirateValue) => {
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
                    {roundState.advanced.useLogitModel ?
                        (
                            <BigBrainElement as={Th}>Prob</BigBrainElement>
                        ) : (
                            <>
                                <BigBrainElement as={Th}>Min Prob</BigBrainElement>
                                <BigBrainElement as={Th}>Max Prob</BigBrainElement>
                                <BigBrainElement as={Th}>Std Prob</BigBrainElement>
                            </>
                        )}
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
                    {[...Array(amountOfBets)].map((_e, i) => {
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
                                        text={displayAsPercent(arenaRatios[arenaId], 1)}
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
                                colSpan={roundState.advanced.bigBrain ? (roundState.advanced.useLogitModel ? 4 : 6) : 1}
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
                                        (_bet, betNum) => {
                                            return (
                                                <Td key={betNum} backgroundColor={gray}>
                                                    <Radio
                                                        name={`bet${betNum + 1}${arenaId}`}
                                                        value={0}
                                                        onChange={() =>
                                                            changeBet(betNum + 1, arenaId, 0)
                                                        }
                                                        isChecked={
                                                            roundState.bets[betNum + 1][arenaId] === 0
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
                            if (!roundState.roundData || !calculations.calculated) {
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

                            let opening = roundState.roundData.openingOdds[arenaId][pirateIndex + 1];
                            let current = roundState.roundData.currentOdds[arenaId][pirateIndex + 1];

                            let usedOdds = getOdds(roundState);
                            let custom = usedOdds[arenaId][pirateIndex + 1];
                            const useCustom = roundState.advanced.bigBrain && roundState.advanced.customOddsMode;
                            const useOdds = useCustom ? custom : current;

                            let bgColor = "transparent";
                            let pirateBin = computePirateBinary(arenaId, pirateIndex + 1);
                            if ((winningBetBinary & pirateBin) === pirateBin) {
                                bgColor = green;
                            }

                            let probs = usedProbabilities;
                            let prob = probs[arenaId][pirateIndex + 1];

                            const payout = useOdds * prob - 1;
                            let payoutBackground = "transparent";
                            if (payout > 0) {
                                payoutBackground = green;
                            } else if (payout <= -0.1) {
                                payoutBackground = red;
                            }

                            return (
                                <Tr key={pirateId} backgroundColor={bgColor}>
                                    <StickyTd backgroundColor={getPirateBgColor(opening)}>
                                        {PIRATE_NAMES[pirateId]}
                                    </StickyTd>
                                    {roundState.advanced.useLogitModel ? (
                                        <BigBrainElement as={Td} isNumeric>
                                            {displayAsPercent(logitProbabilities.prob[arenaId][pirateIndex + 1], 1)}
                                        </BigBrainElement>
                                    ) : (
                                        <>
                                            <BigBrainElement as={Td} isNumeric>
                                                {displayAsPercent(legacyProbabilities.min[arenaId][pirateIndex + 1], 1)}
                                            </BigBrainElement>
                                            <BigBrainElement as={Td} isNumeric>
                                                {displayAsPercent(legacyProbabilities.max[arenaId][pirateIndex + 1], 1)}
                                            </BigBrainElement>
                                            <BigBrainElement as={Td} isNumeric>
                                                {displayAsPercent(legacyProbabilities.std[arenaId][pirateIndex + 1], 1)}
                                            </BigBrainElement>
                                        </>
                                    )}
                                    <CustomOddsElement as={Td} isNumeric>
                                        <CustomProbsInput
                                            arenaIndex={arenaId}
                                            pirateIndex={pirateIndex + 1}
                                            used={probs}
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
                                                {pirateFAs[arenaId][pirateIndex]}
                                            </BigBrainElement>
                                            {roundState.roundData.foods[
                                                arenaId
                                            ].map((foodId, i) => {
                                                return <PirateFA key={i} pirateId={pirateId} foodId={foodId} />;
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
                                            <Icon as={TriangleUpIcon} mr={1} color={green} />
                                        )}
                                        {current < opening && (
                                            <Icon as={TriangleDownIcon} mr={1} color={red} />
                                        )}
                                        <Text as={current === opening ? "" : "b"}>
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
                                        (_bet, betNum) => {
                                            return (
                                                <Td key={betNum}>
                                                    <Radio
                                                        name={`bet${betNum + 1}${arenaId}`}
                                                        value={pirateIndex + 1}
                                                        onChange={() =>
                                                            changeBet(betNum + 1, arenaId, pirateIndex + 1)
                                                        }
                                                        isChecked={
                                                            roundState.bets[betNum + 1][arenaId] === pirateIndex + 1
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
    let { ...rest } = props;
    const { roundState, setRoundState, calculations } =
        useContext(RoundContext);
    const { winningBetBinary, arenaRatios } = calculations;
    const amountOfBets = Object.keys(roundState.bets).length;

    const blue = useColorModeValue("nfc.blue", "nfc.blueDark");
    const green = useColorModeValue("nfc.green", "nfc.greenDark");
    const red = useColorModeValue("nfc.red", "nfc.redDark");
    const orange = useColorModeValue("nfc.orange", "nfc.orangeDark");

    const getPirateBgColor = (odds) => {
        if ([3, 4, 5].includes(odds)) return blue;
        if ([6, 7, 8, 9].includes(odds)) return orange;
        if ([10, 11, 12, 13].includes(odds)) return red;

        return green;
    }

    const changeBet = (betIndex, arenaIndex, pirateIndex) => {
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
                        return <Th>{arenaName} ({displayAsPercent(arenaRatios[arenaId], 1)})</Th>;
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
                                                if (roundState.roundData === null) {
                                                    // big ol skeleton
                                                    return (
                                                        <Tr key={pirateIndex}>
                                                            <Pd>
                                                                <Skeleton width="150px" height="24px">
                                                                    &nbsp;
                                                                </Skeleton>
                                                            </Pd>
                                                        </Tr>
                                                    );
                                                }

                                                let opening = roundState.roundData.openingOdds[arenaId][pirateIndex + 1];
                                                let current = roundState.roundData.currentOdds[arenaId][pirateIndex + 1];

                                                let pirateBg = getPirateBgColor(opening);
                                                let trBg = "transparent";
                                                let pirateBin = computePirateBinary(arenaId, pirateIndex + 1);

                                                if ((winningBetBinary & pirateBin) === pirateBin) {
                                                    trBg = green;
                                                    pirateBg = green;
                                                }

                                                return (
                                                    <Tr key={pirateId} backgroundColor={trBg}>
                                                        <Pd whiteSpace="nowrap" backgroundColor={pirateBg}>
                                                            {PIRATE_NAMES[pirateId]}
                                                        </Pd>
                                                        <Pd isNumeric>
                                                            {opening}:1
                                                        </Pd>
                                                        <Pd isNumeric>
                                                            <Text as={current === opening ? "" : "b"}>
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
                {[...Array(amountOfBets)].map((_bet, betNum) => {
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
                                let pirateIndex = roundState.bets[betNum + 1][arenaId];

                                return (
                                    <Pd key={arenaId}>
                                        <PirateSelect
                                            arenaId={arenaId}
                                            pirateValue={pirateIndex}
                                            getPirateBgColor={getPirateBgColor}
                                            onChange={(e) =>
                                                changeBet(betNum + 1, arenaId, parseInt(e.target.value))
                                            }
                                        />
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
    const { blue, orange, green, red, yellow, gray, getPirateBgColor } = props;

    const { roundState, setRoundState } = useContext(RoundContext);

    const anyBets = anyBetsExist(roundState.bets);

    return (
        <>
            <Collapse in={roundState.viewMode}>
                <Box
                    bgColor={blue}
                    p={4}
                >
                    <Button
                        leftIcon={<Icon as={FaEdit} />}
                        variant="ghost"
                        onClick={() => {
                            setRoundState({ viewMode: false });
                        }}
                    >
                        Edit these bets
                    </Button>
                </Box>
            </Collapse>

            <Collapse in={!roundState.viewMode}>
                <TableSettings />

                <HorizontalScrollingBox>
                    <PirateTable
                        m={4}
                        red={red}
                        green={green}
                        getPirateBgColor={getPirateBgColor}
                    />
                </HorizontalScrollingBox>

                <BetFunctions
                    blue={blue}
                    orange={orange}
                    red={red}
                    green={green}
                    yellow={yellow}
                    gray={gray}
                    getPirateBgColor={getPirateBgColor}
                />

            </Collapse>

            {anyBets && (
                <>
                    <BetAmountsSettings boxShadow="md" />

                    <HorizontalScrollingBox py={4}>
                        <PayoutTable
                            blue={blue}
                            orange={orange}
                            red={red}
                            green={green}
                            yellow={yellow}
                            getPirateBgColor={getPirateBgColor}
                        />
                    </HorizontalScrollingBox>

                    <HorizontalScrollingBox py={4}>
                        <PayoutCharts />
                    </HorizontalScrollingBox>
                </>
            )}
        </>
    );
}
