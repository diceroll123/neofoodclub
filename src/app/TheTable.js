import {
    Skeleton,
    Box,
    Button,
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
import React from "react";
import RoundContext from "./RoundState";
import RoundInput from "./RoundInput"

function PirateTable() {
    const {roundState, setRoundState} = React.useContext(RoundContext);
    const amountOfBets = Object.keys(roundState.bets).length;

    const theme = useTheme();
    const zeroRowBgColor = useColorModeValue(
        theme.colors.gray["100"],
        theme.colors.gray["700"]
    );

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

    function changeBetLine(arenaIndex, pirateValue) {
        // change the entire row to pirateValue
        // for the 10-bet button
        let newBets = roundState.bets;
        for (let x = 1; x <= amountOfBets; x++) {
            newBets[x][arenaIndex] = pirateValue;
        }
        setRoundState({bets: {...newBets}}); // hacky way to force an object to update useEffect
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
                    <Th></Th>
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
                                        <Text>0%</Text> :
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
                                            10-Bet
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

                                return (
                                    <Tr backgroundColor={bgColor}>
                                        <Td isNumeric>Min%</Td>
                                        <Td isNumeric>Max%</Td>
                                        <Td isNumeric>Std%</Td>
                                        <Td backgroundColor={getPirateBgColor(opening)}>{PIRATE_NAMES[pirateId]}</Td>
                                        {/*<Td>Custom</Td>*/}
                                        {/*<Td>Used</Td>*/}
                                        <Td isNumeric>Payout%</Td>
                                        <Td isNumeric>FA</Td>
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
                                                10-Bet
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

export default function TheTable() {

    return (
        <Box mt={8}>
            <PirateTable/>
        </Box>
    )
}
