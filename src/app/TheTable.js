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

const ARENA_NAMES = ["Shipwreck", "Lagoon", "Treasure", "Hidden", "Harpoon"];
const PIRATE_NAMES = {
    1: "Dan",
    2: "Sproggie",
    3: "Orvinn",
    4: "Lucky",
    5: "Edmund",
    6: "Peg Leg",
    7: "Bonnie",
    8: "Puffo",
    9: "Stuff",
    10: "Squire",
    11: "Crossblades",
    12: "Stripey",
    13: "Ned",
    14: "Fairfax",
    15: "Gooblah",
    16: "Franchisco",
    17: "Federismo",
    18: "Blackbeard",
    19: "Buck",
    20: "Tailhook",
}
const FOODS = {
    1: "Hotfish",
    2: "Broccoli",
    3: "Wriggling Grub",
    4: "Joint Of Ham",
    5: "Rainbow Negg",
    6: "Streaky Bacon",
    7: "Ultimate Burger",
    8: "Bacon Muffin",
    9: "Hot Cakes",
    10: "Spicy Wings",
    11: "Apple Onion Rings",
    12: "Sushi",
    13: "Negg Stew",
    14: "Ice Chocolate Cake",
    15: "Strochal",
    16: "Mallowicious Bar",
    17: "Fungi Pizza",
    18: "Broccoli and Cheese Pizza",
    19: "Bubbling Blueberry Pizza",
    20: "Grapity Slush",
    21: "Rainborific Slush",
    22: "Tangy Tropic Slush",
    23: "Blueberry Tomato Blend",
    24: "Lemon Blitz",
    25: "Fresh Seaweed Pie",
    26: "Flaming Burnumup",
    27: "Hot Tyrannian Pepper",
    28: "Eye Candy",
    29: "Cheese and Tomato Sub",
    30: "Asparagus Pie",
    31: "Wild Chocomato",
    32: "Cinnamon Swirl",
    33: "Anchovies",
    34: "Flaming Fire Faerie Pizza",
    35: "Orange Negg",
    36: "Fish Negg",
    37: "Super Lemon Grape Slush",
    38: "Rasmelon",
    39: "Mustard Ice Cream",
    40: "Worm and Leech Pizza"
}

function PirateTable() {
    const {roundState, setRoundState} = React.useContext(RoundContext);
    const amountOfBets = Object.keys(roundState.bets).length;

    const theme = useTheme();
    const zeroRowBgColor = useColorModeValue(
        theme.colors.gray["100"],
        theme.colors.gray["700"]
    );

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

                                return (
                                    <Tr>
                                        <Td>{PIRATE_NAMES[pirateId]}</Td>
                                        <Td isNumeric>Min%</Td>
                                        <Td isNumeric>Max%</Td>
                                        <Td isNumeric>Std%</Td>
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
