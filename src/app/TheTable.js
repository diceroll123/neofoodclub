import {
    Box,
    Button,
    ButtonGroup,
    Checkbox,
    Flex,
    HStack,
    Icon,
    IconButton,
    Select,
    Skeleton,
    Spacer,
    StatArrow,
    RadioGroup,
    Stack,
    Radio,
    Table,
    Tbody,
    Td as OriginalTd,
    Text,
    Th,
    Thead,
    Tooltip,
    Tr,
    useClipboard,
    useColorModeValue,
    useTheme,
    useToast,
} from "@chakra-ui/react";
import {ArrowUpIcon, ArrowDownIcon, LinkIcon} from "@chakra-ui/icons";
import React, {useEffect, useState} from "react";
import RoundContext from "./RoundState";
import {
    calculateArenaRatios,
    calculatePayoutTables,
    computePirateFAs,
    computeProbabilities,
    computePirateBinary,
    computePiratesBinary
} from "./maths";
import {
    displayAsPercent,
    numberWithCommas,
    getMaxBet,
    getTableMode,
    createBetURL
} from "./util";
import {ARENA_NAMES, FOODS, NEGATIVE_FAS, PIRATE_NAMES, POSITIVE_FAS} from "./constants";
import BetAmountInput from "./BetAmountInput";
import Cookies from "universal-cookie/es6";

import moment from "moment";
moment.relativeTimeThreshold('ss', 0);

const redditIcon = (props) => (
    <svg viewBox="0 0 20 20" {...props}>
        <circle cx="10" cy="10" r="10" fill="#FF4500"/>
        <path fill="#FFF"
              d="M16.67 10a1.46 1.46 0 00-2.47-1 7.12 7.12 0 00-3.85-1.23L11 4.65l2.14.45a1 1 0 10.13-.61L10.82 4a.31.31 0 00-.37.24l-.74 3.47a7.14 7.14 0 00-3.9 1.23 1.46 1.46 0 10-1.61 2.39 2.87 2.87 0 000 .44c0 2.24 2.61 4.06 5.83 4.06s5.83-1.82 5.83-4.06a2.87 2.87 0 000-.44 1.46 1.46 0 00.81-1.33zm-10 1a1 1 0 111 1 1 1 0 01-1-1zm5.81 2.75a3.84 3.84 0 01-2.47.77 3.84 3.84 0 01-2.47-.77.27.27 0 01.38-.38A3.27 3.27 0 0010 14a3.28 3.28 0 002.09-.61.27.27 0 11.39.4zm-.18-1.71a1 1 0 111-1 1 1 0 01-1.01 1.04z"/>
    </svg>
)

const BrainIcon = (props) => (
    <svg viewBox="0 0 36 36" {...props}>
        <path fill="#EA596E"
              d="M29.896 26.667c.003.283-.07.653-.146.958c-.531 2.145-2.889 4.552-6.208 4.333c-3.008-.198-5.458-1.642-5.458-3.667s2.444-3.667 5.458-3.667s6.335.018 6.354 2.043z"/>
        <path fill="#DD2E44"
              d="M23.542 24.964c-1.619 0-5.314.448-6.162.448c-1.498 0-2.713.94-2.713 2.1c0 .558.286 1.062.744 1.438c0 0 1.006 1.009 2.818.525c.793-.212 2.083-1.786 4.354-2.036c1.131-.125 3.25.75 6.974.771c.16-.344.193-.583.193-.583c0-2.027-3.194-2.663-6.208-2.663z"/>
        <path fill="#F4ABBA"
              d="M29.75 27.625s2.184-.443 3.542-2.229c1.583-2.083 1.375-4.312 1.375-4.312c1.604-3-.5-5.813-.5-5.813C33.958 12.104 32 10.792 32 10.792c-1.271-3.021-4.083-3.833-4.083-3.833c-2.208-2.583-6.125-2.5-6.125-2.5s-3.67-1.345-8.708.167c-.833.25-3.625.833-5.667 2.083C.981 10.649.494 16.793.584 17.792C1.083 23.375 5 24.375 7.5 24.958c.583 1.583 2.729 4.5 6.583 3.417c4.75-.833 6.75-2.25 7.917-2.25s4.417 1.25 7.75 1.5z"/>
        <g fill="#EA596E">
            <path
                d="M17.737 18.648c2.328-1.255 3.59-1.138 4.704-1.037c.354.032.689.057 1.028.055c1.984-.045 3.591-.881 4.302-1.69a.501.501 0 0 0-.752-.661c-.548.624-1.899 1.313-3.573 1.351c-.3.009-.601-.021-.913-.05c-1.195-.111-2.679-.247-5.271 1.152c-.665.359-1.577.492-2.565.592c-2.197-3.171-.875-5.933-.497-6.591c.037.002.073.014.111.014c.4 0 .802-.098 1.166-.304a.5.5 0 0 0-.492-.87a1.426 1.426 0 0 1-1.88-.467a.5.5 0 0 0-.841.539c.237.371.571.65.948.837c-.521 1.058-1.51 3.84.372 6.951c-1.324.13-2.65.317-3.688.986a7.182 7.182 0 0 0-1.878 1.791c-.629-.108-2.932-.675-3.334-3.231c.25-.194.452-.45.577-.766a.5.5 0 1 0-.93-.368a.772.772 0 0 1-.454.461a.777.777 0 0 1-.643-.07a.5.5 0 0 0-.486.874c.284.158.588.238.89.238c.037 0 .072-.017.109-.019c.476 2.413 2.383 3.473 3.732 3.794a3.69 3.69 0 0 0-.331 1.192a.5.5 0 0 0 .454.542l.045.002a.5.5 0 0 0 .498-.456c.108-1.213 1.265-2.48 2.293-3.145c.964-.621 2.375-.752 3.741-.879c1.325-.121 2.577-.237 3.558-.767zm12.866-1.504a.5.5 0 0 0 .878.48c.019-.034 1.842-3.449-1.571-5.744a.5.5 0 0 0-.558.83c2.644 1.778 1.309 4.326 1.251 4.434zM9.876 9.07a.497.497 0 0 0 .406-.208c1.45-2.017 3.458-1.327 3.543-1.295a.5.5 0 0 0 .345-.938c-.96-.356-3.177-.468-4.7 1.65a.5.5 0 0 0 .406.791zm13.072-1.888c2.225-.181 3.237 1.432 3.283 1.508a.5.5 0 0 0 .863-.507c-.054-.091-1.34-2.218-4.224-1.998a.5.5 0 0 0 .078.997zm9.15 14.611c-.246-.014-.517.181-.539.457c-.002.018-.161 1.719-1.91 2.294a.499.499 0 0 0 .157.975a.499.499 0 0 0 .156-.025c2.372-.778 2.586-3.064 2.594-3.161a.502.502 0 0 0-.458-.54z"/>
            <path
                d="M7.347 16.934a.5.5 0 1 0 .965.26a1.423 1.423 0 0 1 1.652-1.014a.5.5 0 0 0 .205-.979a2.354 2.354 0 0 0-1.248.086c-1.166-1.994-.939-3.96-.936-3.981a.502.502 0 0 0-.429-.562a.503.503 0 0 0-.562.427c-.013.097-.28 2.316 1.063 4.614a2.376 2.376 0 0 0-.71 1.149zm11.179-2.47a1.069 1.069 0 0 1 1.455.015a.502.502 0 0 0 .707-.011a.5.5 0 0 0-.01-.707a2.004 2.004 0 0 0-.797-.465c.296-1.016.179-1.467-.096-2.312a20.6 20.6 0 0 1-.157-.498l-.03-.1c-.364-1.208-.605-2.005.087-3.13a.5.5 0 0 0-.852-.524c-.928 1.508-.587 2.637-.192 3.944l.03.1c.059.194.113.364.163.517c.247.761.322 1.016.02 1.936a2.022 2.022 0 0 0-1.01.504a.5.5 0 0 0 .682.731zm6.365-2.985a2 2 0 0 0 .859-.191a.5.5 0 0 0-.426-.905a1.072 1.072 0 0 1-1.384-.457a.5.5 0 1 0-.881.472c.18.336.448.601.76.785c-.537 1.305-.232 2.691.017 3.426a.5.5 0 1 0 .947-.319c-.168-.498-.494-1.756-.002-2.826c.038.002.073.015.11.015zm4.797 9.429a.497.497 0 0 0-.531-.467a1.825 1.825 0 0 1-1.947-1.703a.509.509 0 0 0-.533-.465a.502.502 0 0 0-.465.533c.041.59.266 1.122.608 1.555c-.804.946-1.857 1.215-2.444 1.284c-.519.062-.973.009-1.498-.053c-.481-.055-1.025-.118-1.698-.098l-.005.001c-.02-.286-.088-.703-.305-1.05a.501.501 0 0 0-.847.531c.134.215.159.558.159.725c-.504.181-.94.447-1.334.704c-.704.458-1.259.82-2.094.632c-.756-.173-1.513-.208-2.155-.118c-.1-.251-.258-.551-.502-.782a.5.5 0 0 0-.687.727c.086.081.154.199.209.317c-1.103.454-1.656 1.213-1.682 1.25a.499.499 0 0 0 .407.788a.502.502 0 0 0 .406-.205c.005-.008.554-.743 1.637-1.04c.56-.154 1.363-.141 2.146.037c.219.05.422.067.619.07c.093.218.129.477.134.573a.501.501 0 0 0 .499.472l.027-.001a.5.5 0 0 0 .473-.523a3.023 3.023 0 0 0-.13-.686c.461-.167.862-.428 1.239-.673c.572-.373 1.113-.726 1.82-.749c.592-.021 1.08.036 1.551.091c.474.055.94.091 1.454.061c.091.253.084.591.07.704a.503.503 0 0 0 .497.563a.5.5 0 0 0 .495-.435a2.883 2.883 0 0 0-.059-.981a4.67 4.67 0 0 0 2.345-1.471a2.807 2.807 0 0 0 1.656.413a.499.499 0 0 0 .465-.531z"/>
        </g>
    </svg>
)

const Td = (props) => (<OriginalTd py={1} {...props}>{props.children}</OriginalTd>);

// A special Td with minimal x-axis padding to cut down on giant tables
const Pd = (props) => (<Td px={1} {...props}>{props.children}</Td>);

const TextTooltip = (props) => {
    const {text, label, ...rest} = props;
    return <Tooltip label={label || text} aria-label={label || text} {...rest}>{text}</Tooltip>
};

const ClearBetsButton = () => {
    const {roundState, setRoundState} = React.useContext(RoundContext);
    const amountOfBets = Object.keys(roundState.bets).length;

    function clearBets() {
        let newBets = roundState.bets;
        for (let x = 1; x <= amountOfBets; x++) {
            newBets[x] = [0, 0, 0, 0, 0];
        }
        setRoundState({bets: {...newBets}});
    }

    return (
        <Button width="100%" size="xs" onClick={clearBets}>Clear</Button>
    )
}

const CopyLinkButtons = () => {
    const toast = useToast();
    const {roundState} = React.useContext(RoundContext);

    let betURL = createBetURL(roundState);
    let amountsBetUrl = createBetURL(roundState, false);

    const urlClip = useClipboard(window.location.origin + betURL);
    const urlAmountsClip = useClipboard(window.location.origin + amountsBetUrl);

    return (
        <>
            {betURL.includes("&b=") &&
            <ButtonGroup size="sm" isAttached variant="outline">
                <Button mr="-px"
                        leftIcon={<LinkIcon/>}
                        onClick={() => {
                            urlClip.onCopy();
                            toast.closeAll();
                            toast({
                                title: `Bet URL copied!`,
                                status: "success",
                                duration: 1300,
                                isClosable: true
                            });
                        }}>Copy URL</Button>
                {amountsBetUrl.includes("&a=") &&
                <Button onClick={() => {
                    urlAmountsClip.onCopy();
                    toast.closeAll();
                    toast({
                        title: `Bet URL + Amounts copied!`,
                        status: "success",
                        duration: 1300,
                        isClosable: true
                    });
                }}>+ Amounts</Button>
                }
            </ButtonGroup>
            }
        </>
    )
}

const BigBrainElement = (props) => {
    const {roundState} = React.useContext(RoundContext);
    const {children, ...rest} = props;

    if (roundState.advanced.bigBrain === false) {
        return null;
    }

    return (
        <Box {...rest}>{children}</Box>
    )
}

const FaDetailsElement = (props) => {
    const {roundState} = React.useContext(RoundContext);
    const {children, ...rest} = props;

    if (roundState.advanced.bigBrain === false) {
        return null;
    }

    if (roundState.advanced.faDetails === false) {
        return null;
    }

    if (roundState.roundData === null || roundState.roundData.foods === undefined) {
        return null;
    }

    return (
        <Box maxWidth="55px" {...rest}>{children}</Box>
    )
}

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
        grayAccent
    } = props;
    const {roundState, setRoundState} = React.useContext(RoundContext);
    const amountOfBets = Object.keys(roundState.bets).length;

    function changeBetLine(arenaIndex, pirateValue) {
        // change the entire row to pirateValue
        // for the 10-bet button
        let newBets = roundState.bets;
        for (let x = 1; x <= amountOfBets; x++) {
            newBets[x][arenaIndex] = pirateValue;
        }
        setRoundState({bets: {...newBets}}); // hacky way to force an object to update useEffect
    }

    const StickyTd = (props) => {
        const {children, ...rest} = props;
        return (
            <Td style={{"position": "sticky", "left": "0"}}
                {...rest}>{children}</Td>
        )
    }

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
            <FaDetailsElement as={Pd}
                              isNumeric
                              backgroundColor={color}
                              whiteSpace="nowrap">
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
                    {/*<Th>Custom</Th>*/}
                    {/*<Th>Used</Th>*/}
                    <BigBrainElement as={Th}>Payout</BigBrainElement>
                    {roundState.roundData && roundState.roundData.foods !== undefined ?
                        <BigBrainElement as={Th}><TextTooltip text="FA" label="Food Adjustment"/></BigBrainElement>
                        : null
                    }
                    <FaDetailsElement as={Th} colSpan={10}>FA Explanation</FaDetailsElement>
                    <Th><TextTooltip text="Open" label="Opening Odds"/></Th>
                    <Th><TextTooltip text="Curr" label="Current Odds"/></Th>
                    {/*<Th>Custom</Th>*/}
                    {/*<Th>Timeline</Th>*/}
                    {
                        [...Array(amountOfBets)].map((e, i) => {
                            return <Th>Bet {i + 1}</Th>
                        })
                    }
                    <Th><ClearBetsButton/></Th>
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
                                <BigBrainElement as={Td} rowSpan={5} isNumeric>
                                    {roundState.roundData ?
                                        <Text>{displayAsPercent(arenaRatios[arenaId], 1)}</Text> :
                                        <Skeleton><Box>&nbsp;</Box></Skeleton>
                                    }
                                </BigBrainElement>
                                <Td backgroundColor={grayAccent} colSpan={roundState.advanced.bigBrain ? 6 : 1}/>
                                {/*<Td colSpan={2}></Td>*/}

                                {roundState.roundData !== null && roundState.roundData.foods !== undefined ? <>

                                    {roundState.roundData.foods[arenaId].map((foodId) => {
                                        const food = FOODS[foodId];
                                        return (
                                            <FaDetailsElement as={Pd}
                                                              whiteSpace="nowrap"
                                                              overflow="hidden"
                                                              textOverflow="ellipsis"
                                                              backgroundColor={grayAccent}>
                                                <TextTooltip text={food}/>
                                            </FaDetailsElement>
                                        )
                                    })}

                                </> : null}

                                <Td backgroundColor={grayAccent} colSpan={2}/>
                                {/*<Td colSpan={1}></Td>*/}
                                {/*<Td>showOddsTimeline</Td>*/}
                                {roundState.roundData !== null ? <>
                                    {[...Array(amountOfBets)].map((bet, betNum) => {
                                        return (
                                            <Td backgroundColor={grayAccent}>
                                                <Radio
                                                    name={"bet" + (betNum + 1) + arenaId}
                                                    value={0}
                                                    onChange={() => changeBet(betNum + 1, arenaId, 0)}
                                                    isChecked={roundState.bets[betNum + 1][arenaId] === 0}/>
                                            </Td>
                                        )
                                    })}
                                    <Td backgroundColor={grayAccent}>
                                        <Button size="xs" variant="outline" onClick={() => {
                                            changeBetLine(arenaId, 0)
                                        }}>
                                            {amountOfBets}-Bet
                                        </Button>
                                    </Td>
                                </> : (<>
                                    <Td colSpan={100} backgroundColor={grayAccent}>
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
                                let pirateBin = computePirateBinary(arenaId, pirateIndex + 1);
                                if ((winningBetBinary & pirateBin) === pirateBin) {
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
                                        <StickyTd
                                            backgroundColor={getPirateBgColor(opening)}>{PIRATE_NAMES[pirateId]}</StickyTd>
                                        <BigBrainElement as={Td}
                                                         isNumeric>{displayAsPercent(probabilities.min[arenaId][pirateIndex + 1], 1)}</BigBrainElement>
                                        <BigBrainElement as={Td}
                                                         isNumeric>{displayAsPercent(probabilities.max[arenaId][pirateIndex + 1], 1)}</BigBrainElement>
                                        <BigBrainElement as={Td}
                                                         isNumeric>{displayAsPercent(probabilities.std[arenaId][pirateIndex + 1], 1)}</BigBrainElement>
                                        {/*<Td>Custom</Td>*/}
                                        {/*<Td>Used</Td>*/}
                                        <BigBrainElement as={Td} backgroundColor={payoutBackground}
                                                         isNumeric>{displayAsPercent(payout, 1)}</BigBrainElement>
                                        {
                                            roundState.roundData && roundState.roundData.foods !== undefined ?
                                                <>
                                                    <BigBrainElement as={Td}
                                                                     isNumeric>{pirateFAs[arenaId][pirateIndex]}</BigBrainElement>
                                                    {roundState.roundData.foods[arenaId].map((foodId) => {
                                                        return calculatePirateFA(pirateId, foodId)
                                                    })}
                                                </> : null
                                        }
                                        <Td isNumeric>{opening}:1</Td>
                                        <Td isNumeric whiteSpace="nowrap">
                                            {current > opening &&
                                            <StatArrow mr={1} type="increase" style={{"stroke": "#000000"}}/>}
                                            {current < opening &&
                                            <StatArrow mr={1} type="decrease" style={{"stroke": "#000000"}}/>}
                                            <Text as={current === opening ? "" : "b"}>{current}:1</Text>
                                        </Td>
                                        {/*<Td>Custom Odds</Td>*/}
                                        {/* Odds Timeline */}
                                        {[...Array(amountOfBets)].map((bet, betNum) => {
                                            return (
                                                <Td>
                                                    <Radio name={"bet" + (betNum + 1) + arenaId}
                                                           value={pirateIndex + 1}
                                                           onChange={() => changeBet(betNum + 1, arenaId, pirateIndex + 1)}
                                                           isChecked={roundState.bets[betNum + 1][arenaId] === pirateIndex + 1}/>
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
        </Table>
    )
}

const BetExtras = (props) => {
    const {betOdds, ...rest} = props;
    const {roundState, setRoundState} = React.useContext(RoundContext);

    function setAllBets(value) {
        let betAmounts = roundState.betAmounts;
        for (let index in roundState.betAmounts) {
            betAmounts[index] = Math.min(value, Math.max(Math.floor(1_000_000 / betOdds[index]) + 1, 50));
        }
        setRoundState({betAmounts});
    }

    return (
        <SettingsBox mt={4} {...rest}>
            <HorizontalScrollingBox whiteSpace="nowrap" p={4}>
                <HStack>
                    <Button minWidth="unset" // weird, but it fixes an issue that this layout structure does
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setAllBets(getMaxBet(roundState.currentSelectedRound));
                            }}>Set all to max</Button>
                    <CopyLinkButtons/>
                </HStack>
            </HorizontalScrollingBox>
        </SettingsBox>
    )
}

const SettingsBox = (props) => {
    const {background, children, ...rest} = props;
    return (
        <Flex align="center"
              justify="space-between"
              mx={4}
              mb={4}
              backgroundColor={background}
              borderWidth="1px"
              {...rest}>
            {children}
        </Flex>
    )
}

const PayoutTable = (props) => {
    const {
        betBinaries,
        betExpectedRatios,
        betProbabilities,
        betNetExpected,
        betOdds,
        betPayoffs,
        betMaxBets,
        winningBetBinary,
        getPirateBgColor,
        orange,
        red,
        green,
        yellow,
        ...rest
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
        let betBinary = betBinaries[betIndex];
        if (betBinary > 0) {
            totalEnabledBets += 1;
            totalBetAmounts += roundState.betAmounts[betIndex];
            totalBetExpectedRatios += betExpectedRatios[betIndex];
            totalBetNetExpected += betNetExpected[betIndex];
            if ((winningBetBinary & betBinary) === betBinary) { // bet won
                betsWon[betIndex] = true;
                totalWinningOdds += betOdds[betIndex];
                totalWinningPayoff += betOdds[betIndex] * roundState.betAmounts[betIndex];
            }
        }
    }

    function swapBets(index, newIndex) {
        let bets = roundState.bets;
        let betAmounts = roundState.betAmounts;
        [bets[index], bets[newIndex]] = [bets[newIndex], bets[index]];
        [betAmounts[index], betAmounts[newIndex]] = [betAmounts[newIndex], betAmounts[index]];
        setRoundState({bets: {...bets}, betAmounts: {...betAmounts}});
    }

    function getMaxBetColor(betNum) {
        let betAmount = roundState.betAmounts[betNum];
        let div = 1_000_000 / betOdds[betNum];
        if (betAmount > Math.ceil(div)) {
            return orange;
        }
        if (betAmount > Math.floor(div)) {
            return yellow;
        }
        return "transparent";
    }

    return (
        <Table size="sm" width="auto" {...rest}>
            <Thead>
                <Tr>
                    <Th>Bet</Th>
                    <Th>Amount</Th>
                    <Th>Odds</Th>
                    <Th>Payoff</Th>
                    <Th><TextTooltip text="Prob." label="Probability"/></Th>
                    <Th><TextTooltip text="E.R." label="Expected Ratio"/></Th>
                    <Th><TextTooltip text="N.E." label="Net Expected"/></Th>
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

                            if (betBinaries[betIndex + 1] === 0) {
                                return null;
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
                                    <Pd backgroundColor={betNumBgColor}>
                                        <HStack>
                                            <Spacer/>
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
                                    </Pd>
                                    <Pd>
                                        <BetAmountInput
                                            value={roundState.betAmounts[betIndex + 1]}
                                            onChange={(str, value) => {
                                                let betAmounts = roundState.betAmounts;
                                                if (isNaN(value) || value === 0) {
                                                    value = -1000;
                                                }
                                                betAmounts[betIndex + 1] = value;
                                                setRoundState({betAmounts});
                                            }}
                                            isInvalid={baBg !== "transparent"}
                                            errorBorderColor={baBg}
                                        />
                                    </Pd>
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
                                                            betPayoffs={betPayoffs}
                                                            betBinaries={betBinaries}
                                                            winningBetBinary={winningBetBinary}/>
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
                        <Th isNumeric>
                            {winningBetBinary > 0 &&
                            <Text>{numberWithCommas(totalWinningOdds)}:{totalEnabledBets}</Text>
                            }
                        </Th>
                        <Th isNumeric>
                            {winningBetBinary > 0 &&
                            <Text>{numberWithCommas(totalWinningPayoff)}</Text>
                            }
                        </Th>
                        <Th/>
                        <Th isNumeric>{totalBetExpectedRatios.toFixed(3)}</Th>
                        <Th isNumeric>{totalBetNetExpected.toFixed(2)}</Th>
                        <Th/>
                        <Th/>
                        <Th/>
                        <Th/>
                        <Th/>
                        <Th/>
                        <Th/>
                    </Tr>
                </Tbody>
            </>}
        </Table>
    )
}

const HorizontalScrollingBox = (props) => {
    const {children, ...rest} = props;
    return (<Box overflowX="auto" {...rest}>{children}</Box>);
}

const PlaceThisBetButton = (props) => {
    const {betOdds, betPayoffs, bet, betNum, betBinaries, winningBetBinary} = props;
    const {roundState} = React.useContext(RoundContext);
    const [clicked, setClicked] = useState(false);

    useEffect(() => {
        setClicked(false);
    }, [roundState.bets]);

    if (winningBetBinary > 0 || roundState.currentSelectedRound < roundState.currentRound) {
        return <Button size="xs" isDisabled>Round is over!</Button>
    }

    if (roundState.betAmounts[betNum] < 50) {
        return <Button size="xs" isDisabled>Invalid bet amount!</Button>
    }

    if (Object.values(betBinaries).filter((b) => b === betBinaries[betNum]).length > 1) {
        return <Button size="xs" isDisabled>Duplicate bet!</Button>
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
        <Button size="xs" isDisabled={clicked} onClick={() => {
            generate_bet_link(bet, betNum);
            setClicked(true);
        }}>
            {clicked ? "Bet placed!" : "Place this bet!"}
        </Button>
    )
}

const DropDownTable = (props) => {
    let {changeBet, getPirateBgColor, green, winningBetBinary, ...rest} = props;
    const {roundState} = React.useContext(RoundContext);
    const amountOfBets = Object.keys(roundState.bets).length;

    return (
        <Table size="sm" width="auto" {...rest}>
            <Thead>
                <Tr>
                    <Th>Shipwreck</Th>
                    <Th>Lagoon</Th>
                    <Th>Treasure</Th>
                    <Th>Hidden</Th>
                    <Th>Harpoon</Th>
                    <Th><ClearBetsButton/></Th>
                </Tr>
            </Thead>
            <Tbody>
                <Tr>
                    {
                        [...Array(5)].map((_, arenaId) => {
                            let pirates;
                            if (roundState.roundData) {
                                pirates = roundState.roundData.pirates[arenaId];
                            } else {
                                pirates = [...Array(4)];
                            }

                            return (
                                <Pd>
                                    <Table size="sm" maxW="150px">
                                        <Tbody>
                                            {
                                                pirates.map((pirateId, pirateIndex) => {

                                                    if (roundState.roundData === null) {
                                                        // big ol skeleton
                                                        return (
                                                            <Tr>
                                                                <Pd>
                                                                    <Skeleton width="150px"
                                                                              height="24px">&nbsp;</Skeleton>
                                                                </Pd>
                                                            </Tr>
                                                        )
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
                                                        <Tr backgroundColor={trBg}>
                                                            <Pd whiteSpace="nowrap"
                                                                backgroundColor={pirateBg}>{PIRATE_NAMES[pirateId]}</Pd>
                                                            <Pd isNumeric>{opening}:1</Pd>
                                                            <Pd isNumeric>
                                                                <Text
                                                                    as={current === opening ? "" : "b"}>{current}:1</Text>
                                                            </Pd>
                                                        </Tr>
                                                    )
                                                })
                                            }
                                        </Tbody>
                                    </Table>
                                </Pd>
                            )
                        })
                    }
                </Tr>
            </Tbody>
            <Tbody>
                {
                    [...Array(amountOfBets)].map((bet, betNum) => {
                        return (
                            <Tr>
                                {
                                    [...Array(5)].map((_, arenaId) => {
                                        if (roundState.roundData === null) {
                                            return (
                                                <Pd>
                                                    <Skeleton height="24px"><Box>&nbsp;</Box></Skeleton>
                                                </Pd>
                                            )
                                        }
                                        let pirates = roundState.roundData.pirates[arenaId];
                                        let pirateIndex = roundState.bets[betNum + 1][arenaId];
                                        let opening = roundState.roundData.openingOdds[arenaId][pirateIndex];

                                        let pirateBg = "transparent";

                                        if (opening > 1) {
                                            pirateBg = getPirateBgColor(opening);
                                        }

                                        return (
                                            <Pd>
                                                <Select size="sm"
                                                        height="1.5rem"
                                                        backgroundColor={pirateBg}
                                                        value={pirateIndex}
                                                        onChange={(e) => changeBet(betNum + 1, arenaId, parseInt(e.target.value))}>
                                                    <option value="0"/>
                                                    {
                                                        pirates.map((pirateId, pirateIndex) => {
                                                            return (
                                                                <option
                                                                    style={{"background": getPirateBgColor(roundState.roundData.openingOdds[arenaId][pirateIndex + 1])}}
                                                                    value={pirateIndex + 1}>{PIRATE_NAMES[pirateId]}</option>
                                                            )
                                                        })
                                                    }
                                                </Select>
                                            </Pd>
                                        )
                                    })
                                }
                            </Tr>
                        )
                    })
                }
            </Tbody>
        </Table>
    )
}

const PirateTable = (props) => {
    const {roundState} = React.useContext(RoundContext);

    if (roundState.tableMode === "dropdown") {
        return <DropDownTable {...props}/>;
    }

    return <NormalTable {...props}/>
}

const PayoutExtras = (props) => {
    const {payoutTables, grayAccent} = props;

    if (payoutTables.odds === undefined) {
        return (<></>)
    }

    function makeTable(title, data) {
        let tableRows = Object.keys(data).map(key => {
            const dataObj = data[key];

            return (
                <Tr>
                    <Td isNumeric>{numberWithCommas(dataObj.value)}</Td>
                    <Td isNumeric>{displayAsPercent(dataObj.probability, 3)}</Td>
                    <Td isNumeric>{displayAsPercent(dataObj.cumulative, 3)}</Td>
                    <Td isNumeric>{displayAsPercent(dataObj.tail, 3)}</Td>
                </Tr>
            )
        });

        return (
            <Table size="sm"
                   width="auto"
                   backgroundColor={grayAccent}
                   borderTopLeftRadius="0.5rem"
                   borderTopRightRadius="0.5rem">
                <Thead>
                    <Tr>
                        <Th>{title}</Th>
                        <Th>Probability</Th>
                        <Th>Cumulative</Th>
                        <Th>Tail</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {tableRows}
                </Tbody>
            </Table>
        )
    }

    return (
        <HStack mx={4}>
            {makeTable("Odds", payoutTables.odds)}
            {makeTable("Winnings", payoutTables.winnings)}
        </HStack>
    )
}

const TableModes = () => {
    const {setRoundState} = React.useContext(RoundContext);
    const cookies = new Cookies();
    const [value, setValue] = useState(getTableMode());

    return (
        <ExtraBox whiteSpace="nowrap">
            <RadioGroup onChange={(v) => {
                setValue(v);
                cookies.set("tableMode", v);
                setRoundState({tableMode: v});
            }} value={value}>
                <Stack>
                    <Radio value="normal">Normal Mode</Radio>
                    <Radio isDisabled>Custom mode</Radio>
                    <Radio value="dropdown">Dropdown Mode</Radio>
                </Stack>
            </RadioGroup>
            {/*<Checkbox mt={1}*/}
            {/*          isChecked={Object.keys(roundState.bets).length === 15}*/}
            {/*          onChange={(e) => {*/}
            {/*              const bets = roundState.bets;*/}
            {/*              const betAmounts = roundState.betAmounts;*/}
            {/*              if (e.target.checked) {*/}
            {/*                  for (let betNum = 11; betNum <= 15; betNum++) {*/}
            {/*                      bets[betNum] = [0, 0, 0, 0, 0];*/}
            {/*                      betAmounts[betNum] = -1000;*/}
            {/*                  }*/}
            {/*              } else {*/}
            {/*                  for (let betNum = 11; betNum <= 15; betNum++) {*/}
            {/*                      delete bets[betNum];*/}
            {/*                      delete betAmounts[betNum];*/}
            {/*                  }*/}
            {/*              }*/}
            {/*              setRoundState({bets: {...bets}, betAmounts: {...betAmounts}});*/}
            {/*          }}>*/}
            {/*    15-bet mode*/}
            {/*</Checkbox>*/}
        </ExtraBox>
    )
}

const NormalExtras = (props) => {
    const {roundState, setRoundState} = React.useContext(RoundContext);

    const [bigBrain, setBigBrain] = useState(true);
    const [faDetails, toggleFaDetails] = useState(false);

    const faExists = roundState.roundData !== null && roundState.roundData.foods !== undefined;

    if (getTableMode() !== "normal") {
        return null;
    }

    const brainSize = bigBrain ? "2em" : "1em";

    return (
        <ExtraBox {...props}>
            <Stack>
                <Button onClick={() => {
                    setBigBrain(v => !v);
                    let currentAdvanced = roundState.advanced;
                    setRoundState({advanced: {...currentAdvanced, bigBrain: !bigBrain}});
                }}
                        leftIcon={<Icon as={BrainIcon}
                                        w={brainSize}
                                        h={brainSize}
                                        style={{"transition": "width 0.3s ease-in-out, height 0.3s ease-in-out"}}
                        />}
                        size="sm"
                        w="190px">
                    Big Brain Mode is {bigBrain === true ? "ON" : "OFF"}
                </Button>
                <Checkbox
                    isChecked={faDetails}
                    isDisabled={!faExists ^ !bigBrain}
                    onChange={(e) => {
                        let checked = e.target.checked;
                        toggleFaDetails(checked);
                        let currentAdvanced = roundState.advanced;
                        setRoundState({advanced: {...currentAdvanced, faDetails: checked}});

                    }}
                >FA Details</Checkbox>
                <Checkbox isDisabled>Odds Timeline</Checkbox>
            </Stack>
        </ExtraBox>
    )
}

const ExtraBox = (props) => {
    const {children, ...rest} = props;
    const theme = useTheme();
    const defaultBgColor = useColorModeValue(theme.colors.white, theme.colors.gray["800"]);
    return (
        <Box p={2} borderWidth="1px" borderRadius="md" backgroundColor={defaultBgColor} {...rest}>{children}</Box>
    )
}

const TableExtras = (props) => {
    return (
        <SettingsBox {...props}>
            <HorizontalScrollingBox>
                <HStack p={4}>
                    <TableModes/>
                    <NormalExtras/>
                </HStack>
            </HorizontalScrollingBox>
        </SettingsBox>
    );
}

const CopyPayouts = (props) => {
    const {payoutTables, betBinaries, betExpectedRatios, betOdds, ...rest} = props;
    const {roundState} = React.useContext(RoundContext);
    const toast = useToast();

    function createRedditTables() {
        if (payoutTables.odds === undefined) {
            return null;
        }

        let totalTER = 0;
        let betCount = 0;
        let lines = [];
        // bet table
        lines.push(`[${roundState.currentSelectedRound}](${window.location.origin}${createBetURL(roundState)})|Shipwreck|Lagoon|Treasure|Hidden|Harpoon|Odds`);
        lines.push(':-:|-|-|-|-|-|-:');

        for (let betNum in roundState.bets) {
            totalTER += betExpectedRatios[betNum];
            if (betBinaries[betNum] > 0) {
                betCount += 1;
                let str = `${betNum}`;
                for (let i = 0; i < 5; i++) {
                    str += "|";
                    let pirateId = roundState.roundData.pirates[i][roundState.bets[betNum][i] - 1];
                    if (pirateId) {
                        str += PIRATE_NAMES[pirateId];
                    }
                }
                lines.push(`${str}|${betOdds[betNum]}:1`);
            }
        }
        lines.push("\n");
        // stats
        lines.push(`TER: ${totalTER.toFixed(3)}`);
        lines.push("\n");
        lines.push("Odds|Probability|Cumulative|Tail");
        lines.push("--:|--:|--:|--:");
        payoutTables.odds.forEach((item) => {
            lines.push(`${item.value}:${betCount}|${displayAsPercent(item.probability, 3)}|${displayAsPercent(item.cumulative, 3)}|${displayAsPercent(item.tail, 3)}`)
        });

        return lines.join("\n");
    }

    const tableCode = createRedditTables();

    const urlClip = useClipboard(tableCode);

    // disable if there's not a bet url in the code
    let disabled = tableCode === null || tableCode.includes("&b=") === false;

    return (
        <SettingsBox mt={4} {...rest}>
            <Box p={4}>
                <Button
                    isDisabled={disabled}
                    leftIcon={<Icon as={redditIcon}
                                    w="1.8em"
                                    h="1.8em"/>}
                    variant="outline"
                    onClick={() => {
                        urlClip.onCopy();
                        toast.closeAll();
                        toast({
                            title: `reddit code copied!`,
                            description: "Don't forget to switch to Markdown mode before you post it on reddit!",
                            status: "success",
                            duration: 5000,
                            isClosable: true
                        });
                    }}>
                    Copy reddit table codes
                </Button>
            </Box>
        </SettingsBox>
    )
}

export default function TheTable(props) {
    const {roundState, setRoundState} = React.useContext(RoundContext);

    let probabilities = {};
    let pirateFAs = {};
    let arenaRatios = {};
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
        probabilities = computeProbabilities(roundState.roundData);
        pirateFAs = computePirateFAs(roundState.roundData);
        arenaRatios = calculateArenaRatios(roundState.roundData);
        winningBetBinary = computePiratesBinary(roundState.roundData.winners);

        // keep the "cache" of bet data up to date
        for (let betIndex = 1; betIndex <= Object.keys(roundState.bets).length; betIndex++) {
            betBinaries[betIndex] = computePiratesBinary(roundState.bets[betIndex])
            betOdds[betIndex] = 0;
            betProbabilities[betIndex] = 0;

            for (let arenaIndex = 0; arenaIndex < 5; arenaIndex++) {
                let pirateIndex = roundState.bets[betIndex][arenaIndex];
                if (pirateIndex > 0) {
                    betOdds[betIndex] = (betOdds[betIndex] || 1) * roundState.roundData.currentOdds[arenaIndex][pirateIndex];
                    betProbabilities[betIndex] = (betProbabilities[betIndex] || 1) * probabilities.used[arenaIndex][pirateIndex];
                }
            }
            // yes, the for-loop above had to be separate.
            for (let arenaIndex = 0; arenaIndex < 5; arenaIndex++) {
                betPayoffs[betIndex] = Math.min(1_000_000, roundState.betAmounts[betIndex] * betOdds[betIndex]);
                betExpectedRatios[betIndex] = betOdds[betIndex] * betProbabilities[betIndex];
                betNetExpected[betIndex] = betPayoffs[betIndex] * betProbabilities[betIndex] - roundState.betAmounts[betIndex];
                betMaxBets[betIndex] = Math.floor(1_000_000 / betOdds[betIndex]);
            }
        }

        payoutTables = calculatePayoutTables(roundState, probabilities, betOdds, betPayoffs);
    }

    const theme = useTheme();
    const grayAccent = useColorModeValue(theme.colors.gray["50"], theme.colors.gray["700"]);
    // the dark values are effectively "375"
    const green = useColorModeValue(theme.colors.green["200"], "#50C17F");
    const blue = useColorModeValue(theme.colors.blue["200"], "#4BA0E4");
    const orange = useColorModeValue(theme.colors.orange["200"], "#F0923E");
    const red = useColorModeValue(theme.colors.red["200"], "#F76C6C");
    const yellow = useColorModeValue(theme.colors.yellow["200"], "#EFCF50");

    function getPirateBgColor(openingOdds) {
        // for the cell that has the pirate name in the big table
        if ([3, 4, 5].includes(openingOdds)) return blue;
        if ([6, 7, 8, 9].includes(openingOdds)) return orange;
        if ([10, 11, 12, 13].includes(openingOdds)) return red;
        return green;
    }

    function changeBet(betIndex, arenaIndex, pirateIndex) {
        // change a single pirate in a single arena
        let newBets = roundState.bets;
        newBets[betIndex][arenaIndex] = pirateIndex;
        setRoundState({bets: {...newBets}}); // hacky way to force an object to update useEffect
    }

    return (
        <Box {...props}>
            <TableExtras background={grayAccent}/>

            <HorizontalScrollingBox>
                <PirateTable m={4}
                             pirateFAs={pirateFAs}
                             arenaRatios={arenaRatios}
                             probabilities={probabilities}
                             changeBet={changeBet}
                             getPirateBgColor={getPirateBgColor}
                             winningBetBinary={winningBetBinary}
                             green={green}
                             red={red}
                             yellow={yellow}
                             grayAccent={grayAccent}/>
            </HorizontalScrollingBox>

            <BetExtras background={grayAccent}
                       betOdds={betOdds}/>

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
                    grayAccent={grayAccent}/>
            </HorizontalScrollingBox>

            <CopyPayouts background={grayAccent}
                         betBinaries={betBinaries}
                         betOdds={betOdds}
                         betExpectedRatios={betExpectedRatios}
                         payoutTables={payoutTables}/>

            <HorizontalScrollingBox>
                <PayoutExtras payoutTables={payoutTables}
                              grayAccent={grayAccent}/>
            </HorizontalScrollingBox>
        </Box>
    )
}
