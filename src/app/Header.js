import {
    Box,
    CircularProgress,
    CircularProgressLabel,
    Container,
    Divider,
    Heading,
    HStack,
    IconButton,
    InputGroup,
    InputLeftAddon,
    NumberDecrementStepper,
    NumberIncrementStepper,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    Skeleton,
    SkeletonText,
    Stack,
    Text,
    Tooltip,
    useColorMode,
    useColorModeValue,
    useToast,
    VStack,
} from "@chakra-ui/react"
import Moment from "react-moment";
import {SunIcon, MoonIcon} from "@chakra-ui/icons"
import React, {useEffect, useState} from "react"
import RoundInput from "./RoundInput";
import RoundContext from "./RoundState";
import moment from "moment";
import {useViewportScroll} from "framer-motion";
import {calculateBaseMaxBet, calculateRoundOverPercentage, getMaxBet} from "./util";
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
                <>Round {roundState.currentSelectedRound} ended</>
                <Moment format="YYYY-MM-DD hh:mm:ss A"
                        date={roundState.roundData.timestamp}/>
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
                    Last Update: <Moment date={roundState.roundData.timestamp}
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
    const [hasFocus, setHasFocus] = useState(false);

    const [tempMaxBet, setTempMaxBet] = useState(getMaxBet(roundState.currentSelectedRound));

    useEffect(() => {
        setTempMaxBet(getMaxBet(roundState.currentSelectedRound));
    }, [roundState.currentSelectedRound]);

    return (
        <Skeleton isLoaded={roundState.roundData !== null}>
            <InputGroup
                size="xs">
                <InputLeftAddon children="Max Bet"/>
                <NumberInput
                    value={tempMaxBet.toString()}
                    onChange={(value) => setTempMaxBet(value)}
                    onFocus={(e) => {
                        setHasFocus(true);
                        e.target.select();
                    }}
                    onBlur={(e) => {
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
                    min={-1000}
                    max={500000}
                    allowMouseWheel>
                    <NumberInputField/>
                    {hasFocus &&
                    <NumberInputStepper>
                        <NumberIncrementStepper/>
                        <NumberDecrementStepper/>
                    </NumberInputStepper>
                    }
                </NumberInput>
            </InputGroup>
        </Skeleton>
    )
}

function TitleHeading(props) {
    return (
        <>
            <Heading
                fontSize="xl"
                display={{base: "none", lg: "block"}}
                {...props}>
                NeoFoodClub
            </Heading>

            <Heading
                fontSize="sm"
                display={{base: "block", lg: "none"}}
                {...props}>
                NFC
            </Heading>
        </>
    )
}

function HeaderContent() {
    return (
        <>
            <Stack as={Container}
                   maxW={'7xl'}
                   py={4}
                   direction={'row'}
                   spacing={4}
                   justify={'space-between'}
                   align={'center'}>

                <TitleHeading
                    as="h1"
                    fontFamily="heading"
                    fontWeight="bold"/>

                <Box p={2} h="4.5rem" maxW="lg" borderWidth="1px" borderRadius="md">
                    <HStack spacing={3} h="100%">
                        <VStack spacing={1} maxW={"140px"}>
                            <RoundInput/>
                            <MaxBetInput/>
                        </VStack>

                        <RoundInfo/>
                    </HStack>
                </Box>
                <ColorModeButton/>
            </Stack>
        </>
    )
}

function Header(props) {
    const bg = useColorModeValue("rgba(255, 255, 255, 0.7)", "rgba(26, 32, 44, 0.7)");
    const [y, setY] = React.useState(0);

    const {scrollY} = useViewportScroll();
    React.useEffect(() => {
        return scrollY.onChange(() => setY(scrollY.get()));
    }, [scrollY]);

    return (
        <Box
            as={"header"}
            shadow={y > 0 ? "lg" : undefined}
            transition="box-shadow 0.2s"
            pos="fixed"
            top="0"
            zIndex="2"
            bg={bg}
            style={{backdropFilter: "blur(16px)"}}
            left="0"
            right="0"
            width="full"
            {...props}
        >
            <HeaderContent/>
        </Box>
    )
}

export default Header;
