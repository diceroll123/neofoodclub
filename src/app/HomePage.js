import React, {useEffect} from "react"
import RoundContext from "./RoundState"
import {
    Box,
    Button,
    HStack,
    Icon,
    Link,
    NumberDecrementStepper,
    NumberIncrementStepper,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    SkeletonText,
    Spacer,
    Text,
    Tooltip,
    useColorMode,
    VStack
} from "@chakra-ui/react";
import Moment from "react-moment";
import 'moment-timezone';
import TheTable from "./TheTable";


function Time({stamp}) {
    return (
        <Moment format="YYYY-MM-DD hh:mm:ss A" date={stamp}/>
    )
}

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
            <Link isExternal aria-label="GitHub" href="https://github.com/diceroll123">
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
            <Button onClick={toggleColorMode}>
                {colorMode === "light" ? "🌙" : "🌞"}
            </Button>
        </Tooltip>
    );
}

function RoundInput() {
    const {roundState, setRoundState} = React.useContext(RoundContext);

    return (
        <NumberInput isDisabled={roundState.currentRound === null}
                     value={roundState.currentRound || 1}
                     min={1} max={99999} width="90px"
                     onChange={(r) => setRoundState({currentRound: parseInt(r), roundData: null})}>
            <NumberInputField/>
            <NumberInputStepper>
                <NumberIncrementStepper/>
                <NumberDecrementStepper/>
            </NumberInputStepper>
        </NumberInput>
    )
}

function RoundInfo() {
    const {roundState} = React.useContext(RoundContext);

    if (roundState.roundData === null) {
        return (
            <Box>
                <SkeletonText noOfLines={3} spacing="1" width="180px"/>
            </Box>
        )
    }

    return (
        <Box>
            <Text fontSize="xs">
                Last Update <Time stamp={roundState.roundData.lastUpdate}/>
            </Text>
            {roundState.roundData.lastChange &&
            <Text fontSize="xs">
                Last Change <Time stamp={roundState.roundData.lastChange}/>
            </Text>
            }
        </Box>
    )
}

export default function HomePage() {
    const {roundState, setRoundState} = React.useContext(RoundContext);

    useEffect(() => {
        new Promise((resolve, reject) => {
            if (roundState.currentRound === null) {
                // first pass-through sets the round, then bails out
                // which starts useEffect again a second time, with a round number
                fetch("/next_round.txt", {cache: "no-cache"})
                    .then(response => response.text())
                    .then(data => setRoundState({currentRound: parseInt(data)}))
                    .then(reject)
            } else {
                resolve();
            }
        }).then(() => {
            if(roundState.currentRound !== null) {
                fetch(`/rounds/${roundState.currentRound}.json`, {
                    cache: "no-cache"
                })
                    .then(response => response.json())
                    .then(roundData => setRoundState({roundData}))
                    .catch(() => {
                        // rip
                    });
            }
        }).catch(() => {
            // blah
        })
    }, [roundState.currentRound])

    return (
        <Box padding={4}>
            <header>
                <HStack spacing={5}>
                    <Text>
                        Round
                    </Text>

                    <RoundInput/>

                    <VStack spacing={1}>
                        <RoundInfo/>
                    </VStack>

                    <Spacer/>
                    <GitHubButton/>
                    <ColorModeButton/>
                </HStack>
            </header>

            <TheTable/>
        </Box>
    )
}
