import {
    Box,
    Flex,
    chakra,
    CircularProgress,
    CircularProgressLabel,
    Divider,
    Heading,
    Tooltip,
    HStack,
    IconButton,
    Skeleton,
    SkeletonText,
    Spacer,
    Text,
    useColorMode,
    useColorModeValue,
    VStack,
    useToast,
} from "@chakra-ui/react"
import Moment from "react-moment";
import {SunIcon, MoonIcon} from "@chakra-ui/icons"
import React, {useEffect, useState} from "react"
import RoundInput from "./RoundInput";
import RoundContext from "./RoundState";
import moment from "moment";
import {useViewportScroll} from "framer-motion";
import {calculateBaseMaxBet, calculateRoundOverPercentage, getMaxBet} from "./util";
import BetAmountInput from "./BetAmountInput";
import Cookies from "universal-cookie/es6";

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
        <Text as={Box} fontSize="xs" display={{sm: "none", md: "block"}}>
            <VStack>
                <>Round ended</>
                <Moment format="YYYY-MM-DD hh:mm:ss A"
                        date={roundState.roundData.lastUpdate || roundState.roundData.timestamp}/>
            </VStack>
        </Text>
    )
}

function CurrentRoundInfo() {
    const {roundState} = React.useContext(RoundContext);
    const roundPercentOver = calculateRoundOverPercentage(roundState);

    const timestamp = moment(roundState.roundData.timestamp);

    let element = "span";

    if (moment().diff(timestamp) > 3e5) {
        // highlight the current last update if it hasn't been updated in 30+s
        element = "mark";
    }

    return (
        <HStack>
            {roundPercentOver === 100 ?
                <CircularProgress size="38px" isIndeterminate capIsRound/>
                :
                <CircularProgress size="38px" value={roundPercentOver} capIsRound>
                    <CircularProgressLabel>
                        {Math.floor(roundPercentOver)}%
                    </CircularProgressLabel>
                </CircularProgress>
            }
            <Box textAlign="left">
                <Text fontSize="xs" as={element}>
                    Last Update: <Moment date={roundState.roundData.lastUpdate}
                                         fromNow
                                         withTitle
                                         titleFormat="LLL"
                                         interval={1}/>
                </Text>
                {roundState.roundData.lastChange &&
                roundState.roundData.start !== roundState.roundData.lastChange &&
                <>
                    <Divider my={1}/>
                    <Text fontSize="xs">
                        Last Change: <Moment date={roundState.roundData.lastChange}
                                             fromNow
                                             withTitle
                                             titleFormat="LLL"
                                             interval={1}/>
                    </Text>
                </>
                }
            </Box>
        </HStack>
    )
}

function RoundInfo() {
    const {roundState} = React.useContext(RoundContext);

    const oldRound = parseInt(roundState.currentSelectedRound) !== roundState.currentRound;

    const skeletonWidth = oldRound ? "129px" : "190px";

    let element = <SkeletonText noOfLines={3} minWidth={skeletonWidth}/>;

    if (roundState.roundData !== null) {
        if (roundState.roundData.winners[0] > 0) {
            element = <PreviousRoundInfo/>;
        } else {
            element = <CurrentRoundInfo/>;
        }
    }

    return (
        <Box display={{base: "none", md: "block"}}>
            {element}
        </Box>
    )
}

function MaxBetInput() {
    const {roundState} = React.useContext(RoundContext);
    const cookies = new Cookies();
    const toast = useToast();

    const [tempMaxBet, setTempMaxBet] = useState(getMaxBet(roundState.currentSelectedRound));

    useEffect(() => {
        setTempMaxBet(getMaxBet(roundState.currentSelectedRound));
    }, [roundState.currentSelectedRound]);

    return (
        <Skeleton isLoaded={roundState.roundData !== null}>
            <BetAmountInput
                value={tempMaxBet.toString()}
                onChange={(value) => setTempMaxBet(value)}
                onBlur={(e) => {
                    let value = parseInt(e.target.value);
                    if (value === tempMaxBet) {
                        // don't save over it if it's the same
                        return;
                    }

                    if (isNaN(value) || value < 50) {
                        value = -1000;
                    }

                    setTempMaxBet(value);

                    let baseMaxBet = calculateBaseMaxBet(value, roundState.currentSelectedRound);
                    cookies.set('baseMaxBet', baseMaxBet, {expires: moment().add(28, 'days').toDate()});

                    toast.closeAll();
                    toast({
                        title: `Max Bet Saved!`,
                        status: "success",
                        duration: 1200,
                        isClosable: true
                    });
                }}
            />
        </Skeleton>
    )
}

function TitleHeading() {
    return (
        <>
            <Heading as="h1" fontSize="lg" display={{base: "none", lg: "block"}}>
                NeoFoodClub
            </Heading>

            <Heading as="h1" fontSize="sm" display={{base: "block", lg: "none"}}>
                NFC
            </Heading>
        </>
    )
}

function HeaderContent() {
    return (
        <>
            <Flex w="100%" h="100%" p={4} align="center">
                <TitleHeading/>

                <Spacer/>
                <Box p={2} h="4.5rem" maxW="lg" borderWidth="1px" borderRadius="md">
                    <HStack spacing={3} h="100%">
                        <VStack spacing={0}>
                            <Text fontSize="sm" as="i">
                                Round:
                            </Text>
                            <RoundInput/>
                        </VStack>

                        <RoundInfo/>

                        <Divider orientation="vertical"/>

                        <VStack spacing={0}>
                            <Text fontSize="sm" as="i">
                                Max Bet:
                            </Text>
                            <MaxBetInput/>
                        </VStack>
                    </HStack>
                </Box>

                <Spacer/>
                <ColorModeButton/>
            </Flex>
        </>
    )
}

function Header(props) {
    const bg = useColorModeValue("white", "gray.800");
    const [y, setY] = React.useState(0);

    const {scrollY} = useViewportScroll();
    React.useEffect(() => {
        return scrollY.onChange(() => setY(scrollY.get()));
    }, [scrollY]);

    return (
        <chakra.header
            shadow={y > 0 ? "md" : undefined}
            transition="box-shadow 0.2s"
            pos="fixed"
            top="0"
            zIndex="2"
            bg={bg}
            left="0"
            right="0"
            width="full"
            {...props}
        >
            <HeaderContent/>
        </chakra.header>
    )
}

export default Header;
