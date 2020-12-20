import React, {useEffect} from "react"
import RoundContext from "./RoundState"
import {SunIcon, MoonIcon} from "@chakra-ui/icons"
import {
    Box,
    IconButton,
    HStack,
    Icon,
    Link,
    Skeleton,
    Spacer,
    Text,
    Tooltip,
    CircularProgress,
    CircularProgressLabel,
    useColorMode,
    VStack,
    useToast
} from "@chakra-ui/react";
import Moment from "react-moment";
import 'moment-timezone';
import TimeAgo from 'react-timeago'
import TheTable from "./TheTable";
import RoundInput from "./RoundInput"
import {makeBetAmountsUrl, makeBetUrl} from "./util";
import moment from "moment";

const GithubIcon = (props) => (
    <svg viewBox="0 0 20 20" {...props}>
        <path
            fill="currentColor"
            d="M10 0a10 10 0 0 0-3.16 19.49c.5.1.68-.22.68-.48l-.01-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.1.39-1.99 1.03-2.69a3.6 3.6 0 0 1 .1-2.64s.84-.27 2.75 1.02a9.58 9.58 0 0 1 5 0c1.91-1.3 2.75-1.02 2.75-1.02.55 1.37.2 2.4.1 2.64.64.7 1.03 1.6 1.03 2.69 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85l-.01 2.75c0 .26.18.58.69.48A10 10 0 0 0 10 0"
        />
    </svg>
)

function GitHubButton() {
    return (
        <Tooltip label="GitHub">
            <Link isExternal aria-label="GitHub" href="https://github.com/diceroll123/foodclub">
                <Icon
                    as={GithubIcon}
                    transition="color 0.2s"
                    w="5"
                    h="5"
                    _hover={{color: "gray.600"}}
                />
            </Link>
        </Tooltip>
    )
}

function ColorModeButton() {
    const {colorMode, toggleColorMode} = useColorMode();
    const label = colorMode === "light" ? "Dark mode" : "Light mode";

    return (
        <Tooltip label={label}>
            <IconButton onClick={toggleColorMode}
                        icon={colorMode === "light" ? <MoonIcon/> : <SunIcon/>}
            />
        </Tooltip>
    );
}

function PreviousRoundInfo() {
    const {roundState} = React.useContext(RoundContext);

    return (
        <Text fontSize="xs">
            Round ended <Moment format="YYYY-MM-DD hh:mm:ss A"
                                date={roundState.roundData.lastUpdate || roundState.roundData.timestamp}/>
        </Text>
    )

}

function CurrentRoundInfo() {
    const {roundState} = React.useContext(RoundContext);

    let now = moment();
    let start = moment(roundState.roundData.start);
    let end = moment(roundState.roundData.start).add(1, 'day');
    let totalMillisInRange = end.valueOf() - start.valueOf();
    let elapsedMillis = now.valueOf() - start.valueOf();
    const roundPercentOver = Math.max(0, Math.min(100, 100 * (elapsedMillis / totalMillisInRange)));

    return (
        <HStack>
            <Box textAlign="left">
                <Text fontSize="xs">
                    Last Update: <TimeAgo date={roundState.roundData.lastUpdate}/>
                </Text>
                {roundState.roundData.lastChange &&
                roundState.roundData.start !== roundState.roundData.lastChange &&
                <Text fontSize="xs">
                    Last Change: <TimeAgo date={roundState.roundData.lastChange}/>
                </Text>
                }
            </Box>
            {roundPercentOver === 100 ?
                <CircularProgress isIndeterminate capIsRound/>
                :
                <CircularProgress value={roundPercentOver} capIsRound>
                    <CircularProgressLabel>
                        {Math.floor(roundPercentOver)}%
                    </CircularProgressLabel>
                </CircularProgress>
            }
        </HStack>
    )
}

function RoundInfo() {
    const {roundState} = React.useContext(RoundContext);

    let data = <Box width="210px">&nbsp;</Box>;

    if (roundState.roundData !== null) {
        if (roundState.roundData.winners.some((x) => x > 0)) {
            data = <PreviousRoundInfo/>
        } else {
            data = <CurrentRoundInfo/>
        }
    }

    return (
        <Skeleton
            isLoaded={roundState.roundData !== null}>
            {/*TODO: SkeletonText does not fade in, so don't use that until #2800 is fixed*/}
            {/*<SkeletonText noOfLines={3}*/}
            {/*              spacing="1"*/}
            {/*              width="180px"*/}
            {data}
            {/*</SkeletonText>*/}
        </Skeleton>
    )
}

export default function HomePage() {
    const {roundState, setRoundState} = React.useContext(RoundContext);
    const toast = useToast();

    function getCurrentRoundNumber(resolve, reject) {
        if (roundState.currentRound === null) {
            // first pass-through sets the round, then bails out
            // which starts useEffect again a second time, with a round number
            fetch("https://neofoodclub.s3.amazonaws.com/next_round.txt", {cache: "no-cache"})
                .then(response => response.text())
                .then(data => {
                    let currentRound = parseInt(data);
                    if (isNaN(currentRound) === false) {
                        setRoundState({
                            currentRound: currentRound,
                            currentSelectedRound: roundState.currentSelectedRound || currentRound
                        })
                    } else {
                        throw Error('Cannot grab current round data');
                    }
                })
                .catch(() => {
                    toast.closeAll();
                    toast({
                        title: `Current round data not found.`,
                        description: "We don't seem to know what round it currently is. 🤔",
                        status: "error",
                        duration: 3000,
                        isClosable: true
                    })
                })
                .then(reject)
        } else {
            resolve();
        }
    }

    function getRoundData(forceUpdate) {
        if (roundState.currentSelectedRound === null) {
            // this should never happen
            return;
        }

        // update if there's no data
        if (roundState.roundData === null || forceUpdate) {
            fetch(`https://neofoodclub.s3.amazonaws.com/rounds/${roundState.currentSelectedRound}.json`, {
                cache: "no-cache"
            })
                .then(response => response.json())
                .then(roundData => {
                    let currentRound = roundState.currentRound;
                    // if winning pirates were just added, increase the in-memory current round
                    if (currentRound === roundState.currentSelectedRound && roundData.winners.some((x) => x > 0)) {
                        currentRound += 1;
                    }
                    setRoundState({roundData, currentRound});
                })
                .catch(() => {
                    toast.closeAll();
                    toast({
                        title: `Round ${roundState.currentSelectedRound} not found.`,
                        description: "We don't seem to have data for this round. 🤔",
                        status: "error",
                        duration: 3000,
                        isClosable: true
                    })
                });
        } else {

        }
    }

    useEffect(() => {
        // TODO: Debounce round number input
        new Promise((resolve, reject) => {
            getCurrentRoundNumber(resolve, reject);
        }).then(() => {
            getRoundData(false);
        }).catch(() => {
            // blah
        }).then(() => {
            // changing round/bets will keep the url updated
            if (roundState.currentSelectedRound === null) {
                return;
            }

            let url = window.location.pathname + "#";
            url += "round=" + roundState.currentSelectedRound;

            // check if the bet is empty before putting it in the url
            let addBets = false;
            for (const [, value] of Object.entries(roundState.bets)) {
                if (addBets === false) {
                    addBets = value.some(x => x > 0);
                }
            }

            if (addBets) {
                url += '&b=' + makeBetUrl(roundState.bets);
            }

            // TODO: Decide if the bet amounts in the url is even desired
            // TODO: add roundState.betAmounts to deps array below if so
            // check if the bet amount is valid before putting it in the url
            // let addBetAmounts = false;
            // for (const [, value] of Object.entries(roundState.betAmounts)) {
            //     if (addBetAmounts === false) {
            //         addBetAmounts = value >= 50;
            //     }
            // }
            //
            // if(addBetAmounts) {
            //     url += '&a=' + makeBetAmountsUrl(roundState.betAmounts);
            // }

            window.history.replaceState(null, "", url);
        });
    }, [
        roundState.currentSelectedRound,
        roundState.currentRound,
        roundState.roundData,
        roundState.bets,
        roundState.betAmounts
    ]);

    return (
        <Box padding={4}>
            <Box mx="auto" maxW="6xl">
                <HStack spacing={5}>
                    <Text>
                        Round:
                    </Text>

                    <RoundInput/>

                    <VStack spacing={1}>
                        <RoundInfo/>
                    </VStack>

                    <Spacer/>
                    <GitHubButton/>
                    <ColorModeButton/>
                </HStack>
            </Box>

            <TheTable/>
        </Box>
    )
}
