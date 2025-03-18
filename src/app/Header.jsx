import {
    Box,
    Center,
    CircularProgress,
    CircularProgressLabel,
    Flex,
    Heading,
    HStack,
    Icon,
    InputGroup,
    InputLeftAddon,
    NumberDecrementStepper,
    NumberIncrementStepper,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    SkeletonText,
    Spacer,
    StackDivider,
    Text,
    Tooltip,
    useColorModeValue,
    useToast,
    VStack,
} from "@chakra-ui/react";
import { useScroll } from "framer-motion";
import Cookies from "universal-cookie";
import Moment from "react-moment";
import React, {
    useContext,
    useEffect,
    useState,
    useMemo,
    useCallback,
    memo,
} from "react";
import moment from "moment";
import NeopointIcon from "./images/np-icon.svg";

import {
    calculateBaseMaxBet,
    calculateRoundOverPercentage,
    getMaxBet,
} from "./util";
import { RoundContext } from "./RoundState";
import RoundInput from "./components/RoundInput";
import { FaSync } from "react-icons/fa";
import { FaClockRotateLeft } from "react-icons/fa6";
import GlowCard from "./components/GlowCard";

moment.relativeTimeThreshold("ss", 0);

const PreviousRoundInfo = memo(function PreviousRoundInfo() {
    const { roundState } = useContext(RoundContext);

    const memoizedText = useMemo(
        () => (
            <Text as={Box} fontSize="xs">
                <VStack spacing={0}>
                    <>Round {roundState.currentSelectedRound} ended</>
                    <>
                        <Moment
                            format="YYYY-MM-DD hh:mm:ss A [NST]"
                            date={roundState.roundData.timestamp}
                            tz="America/Los_Angeles"
                        />
                    </>
                </VStack>
            </Text>
        ),
        [roundState.currentSelectedRound, roundState.roundData.timestamp]
    );

    return memoizedText;
});

const CurrentRoundProgress = memo(function CurrentRoundProgress() {
    const { roundState } = useContext(RoundContext);
    const roundPercentOver = calculateRoundOverPercentage(roundState);

    let winners = roundState?.roundData?.winners;

    if (winners !== undefined && winners.some((winner) => winner > 0)) {
        return null;
    }

    return (
        <>
            {roundPercentOver === 100 ? (
                <CircularProgress size="38px" isIndeterminate capIsRound />
            ) : (
                <CircularProgress
                    size="38px"
                    value={roundPercentOver}
                    capIsRound
                >
                    <CircularProgressLabel>
                        {Math.floor(roundPercentOver)}%
                    </CircularProgressLabel>
                </CircularProgress>
            )}
        </>
    );
});

// Define constants outside the component to ensure stability across renders
const divider = <StackDivider />;
const LABEL_LAST_UPDATE = "Last Update";
const LABEL_LAST_CHANGE = "Last Change";

const CurrentRoundInfo = memo(function CurrentRoundInfo() {
    const { roundState } = useContext(RoundContext);

    // Memoize the timestamp to avoid recalculating on every render
    const timestamp = useMemo(
        () => moment(roundState.roundData.timestamp),
        [roundState.roundData.timestamp]
    );

    let element = "span";

    if (moment().diff(timestamp) > 3e5) {
        // highlight the current last update if it hasn't been updated in 30+s
        element = "mark";
    }

    return (
        <VStack divider={divider} spacing={1} minW="140px">
            <HStack>
                <Tooltip label={LABEL_LAST_UPDATE}>
                    <Icon as={FaSync} />
                </Tooltip>
                <Text fontSize="xs" as={element} minW="100px">
                    <Moment
                        date={roundState.roundData.timestamp}
                        tz={"America/Los_Angeles"}
                        fromNow
                        withTitle
                        titleFormat="LLL [NST]"
                    />
                </Text>
            </HStack>
            {roundState.roundData.lastChange &&
                roundState.roundData.start !==
                    roundState.roundData.lastChange && (
                    <HStack>
                        <Tooltip label={LABEL_LAST_CHANGE}>
                            <Icon as={FaClockRotateLeft} />
                        </Tooltip>
                        <Text fontSize="xs" minW="100px">
                            <Moment
                                date={roundState.roundData.lastChange}
                                tz={"America/Los_Angeles"}
                                fromNow
                                withTitle
                                titleFormat="LLL [NST]"
                            />
                        </Text>
                    </HStack>
                )}
        </VStack>
    );
});

const RoundInfo = memo(function RoundInfo() {
    const { roundState } = useContext(RoundContext);

    let element = null;

    if (roundState?.roundData?.winners[0] > 0) {
        element = <PreviousRoundInfo />;
    } else if (roundState?.roundData?.timestamp) {
        element = <CurrentRoundInfo />;
    }

    return element;
});

const MaxBetInput = memo(function MaxBetInput() {
    const { roundState } = useContext(RoundContext);
    const cookies = useMemo(() => new Cookies(), []);
    const toast = useToast();
    const [hasFocus, setHasFocus] = useState(false);

    const maxBet = useMemo(
        () => getMaxBet(roundState.currentSelectedRound),
        [roundState.currentSelectedRound]
    );

    const [tempMaxBet, setTempMaxBet] = useState(maxBet);

    useEffect(() => {
        setTempMaxBet(maxBet);
    }, [maxBet]);

    const handleChange = useCallback((value) => {
        setTempMaxBet(value);
    }, []);

    const handleFocus = useCallback((e) => {
        setHasFocus(true);
        e.target.select();
    }, []);

    const handleBlur = useCallback(
        (e) => {
            setHasFocus(false);
            let value = parseInt(e.target.value);
            if (value === tempMaxBet) {
                // don't save over it if it's the same
                return;
            }

            if (isNaN(value) || value < 50) {
                value = -1000;
            }

            setTempMaxBet(value);

            let baseMaxBet = calculateBaseMaxBet(
                value,
                roundState.currentSelectedRound
            );
            cookies.set("baseMaxBet", baseMaxBet, {
                expires: moment().add(100, "years").toDate(),
            });

            toast.closeAll();
            toast({
                title: `Max Bet Saved!`,
                status: "success",
                duration: 2000,
                isClosable: true,
            });
        },
        [tempMaxBet, cookies, roundState.currentSelectedRound, toast]
    );

    const memoizedInputGroup = useMemo(
        () => (
            <InputGroup size="xs">
                <InputLeftAddon children="Max Bet" />
                <NumberInput
                    value={tempMaxBet.toString()}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    min={-1000}
                    max={500000}
                    allowMouseWheel
                >
                    <NumberInputField />
                    {hasFocus && (
                        <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                        </NumberInputStepper>
                    )}
                </NumberInput>
            </InputGroup>
        ),
        [tempMaxBet, hasFocus, handleChange, handleFocus, handleBlur]
    );

    return memoizedInputGroup;
});

const TitleHeading = React.memo(function TitleHeading() {
    const { setRoundState, roundState } = useContext(RoundContext);

    return (
        <>
            <HStack
                display={{ base: "none", md: "block" }}
                cursor={"pointer"}
                userSelect={"none"}
                onClick={() => {
                    setRoundState({ viewMode: false });

                    // scroll to top
                    window.scrollTo({ top: 0, behavior: "smooth" });

                    if (
                        window.scrollY === 0 &&
                        roundState.currentSelectedRound !==
                            roundState.currentRound
                    ) {
                        // TODO MAYBE: add a confirmation dialog?
                        setRoundState({
                            currentSelectedRound: roundState.currentRound,
                        });
                    }
                }}
            >
                <Center>
                    <Box
                        as="img"
                        src={NeopointIcon}
                        height="1.5em"
                        width="1.5em"
                        display={{ base: "none", md: "inline-block" }}
                        mr={2}
                    />
                    <Heading
                        as="h1"
                        fontFamily="heading"
                        fontWeight="bold"
                        fontSize="xl"
                        display={{ base: "none", lg: "inline-block" }}
                    >
                        NeoFoodClub
                    </Heading>
                    <Heading
                        as="h1"
                        fontFamily="heading"
                        fontWeight="bold"
                        fontSize="xl"
                        display={{
                            base: "none",
                            md: "inline-block",
                            lg: "none",
                        }}
                    >
                        NFC
                    </Heading>
                </Center>
            </HStack>
        </>
    );
});

const HeaderContent = memo(function HeaderContent() {
    const { roundState } = useContext(RoundContext);
    const { roundData } = roundState;
    const [isGlowing, setIsGlowing] = useState(false);
    const [currentTimestamp, setCurrentTimestamp] = useState("");
    const [winnersExist, setWinnersExist] = useState(false);

    const anyWinners = useMemo(() => {
        const winners = roundData?.winners || [];
        return winners.some((winner) => winner > 0);
    }, [roundData?.winners]);

    useEffect(() => {
        if (!roundData) {
            setIsGlowing(false);
            return;
        }

        const timestamp = roundData?.timestamp;

        setWinnersExist(anyWinners);

        if (anyWinners) {
            setIsGlowing(false);
            return;
        }

        if (!timestamp) {
            setIsGlowing(false);
            return;
        }

        if (timestamp === roundData.start) {
            setIsGlowing(false);
            return;
        }

        if (currentTimestamp !== timestamp) {
            setIsGlowing(true);
            setCurrentTimestamp(timestamp);
        }

        const timeout = setTimeout(() => {
            setIsGlowing(false);
        }, 4000);
        return () => clearTimeout(timeout);
    }, [roundData?.winners, currentTimestamp, anyWinners, roundData?.timestamp, roundData?.start]);

    const isLoaded = useMemo(() => !!roundData, [roundData]);

    const memoizedHStack = useMemo(
        () => (
            <HStack p={4} spacing={4} as={Flex}>
                <TitleHeading />
                <Spacer />

                <GlowCard p={2} maxW="lg" animate={isGlowing}>
                    <HStack spacing={3} h="100%">
                        <VStack spacing={1} maxW={"140px"}>
                            <RoundInput />
                            <MaxBetInput />
                        </VStack>
                        <SkeletonText minW={"130"} isLoaded={isLoaded}>
                            <HStack>
                                <CurrentRoundProgress hidden={winnersExist} />
                                <RoundInfo />
                            </HStack>
                        </SkeletonText>
                    </HStack>
                </GlowCard>
                <Spacer />
            </HStack>
        ),
        [isGlowing, isLoaded, winnersExist]
    );

    return memoizedHStack;
});

const Header = memo(function Header() {
    const bg = useColorModeValue(
        "rgba(255, 255, 255, 0.7)",
        "rgba(26, 32, 44, 0.7)"
    );
    const [y, setY] = useState(0);

    const { scrollY } = useScroll();
    useEffect(() => {
        scrollY.on("change", () => setY(scrollY.get()));
    }, [scrollY]);

    return useMemo(
        () => (
            <Box
                as={"header"}
                shadow={y > 0 ? "lg" : undefined}
                transition="box-shadow 0.2s"
                pos="fixed"
                top="0"
                zIndex="2"
                bg={bg}
                backdropFilter="saturate(180%) blur(5px)"
                left="0"
                right="0"
                width="full"
            >
                <HeaderContent />
            </Box>
        ),
        [y, bg]
    );
});

export default Header;
