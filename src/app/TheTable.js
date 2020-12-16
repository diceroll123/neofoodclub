import {
    Skeleton,
    SkeletonText,
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
    TableCaption
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

function PirateTable() {
    const {roundState} = React.useContext(RoundContext);
    const amountOfBets = 10;

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
                                <Td rowSpan={5}>
                                    {roundState.roundData ?
                                        <Text>0%</Text> :
                                        <Skeleton><Box>&nbsp;</Box></Skeleton>
                                    }

                                </Td>
                                <Td colSpan={6}></Td>
                                {/*<Td colSpan={2}></Td>*/}
                                {/* Td for FA explanation here */}
                                <Td colSpan={2}></Td>
                                {/*<Td colSpan={1}></Td>*/}
                                {/*<Td>showOddsTimeline</Td>*/}
                                {[...Array(amountOfBets)].map((bet, betNum) => {
                                    return (
                                        // TODO: Chakra's Radio component does not play well with this atm
                                        <Td><input type="radio" name={"bet" + (betNum + 1) + arenaId} value={0}/></Td>
                                    )
                                })}
                                <Td>
                                    <Button size="xs">
                                        10-Bet
                                    </Button>
                                </Td>
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
                                                           value={pirateIndex + 1}/>
                                                </Td>
                                            )
                                        })}
                                        <Td>
                                            <Button size="xs">
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
    // const [amountOfBets, setAmountOfBets] = useState(10); // 15 for Charity Corner

    return (
        <Box mt={8}>
            <PirateTable/>
        </Box>
    )
}
