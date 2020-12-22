import {
    Box,
    chakra,
    CircularProgress,
    CircularProgressLabel,
    Divider,
    Heading,
    Tooltip,
    HStack,
    IconButton,
    Skeleton,
    Spacer,
    Text,
    useColorMode,
    useColorModeValue,
    VStack,
    useToast,
} from "@chakra-ui/react"
import Moment from "react-moment";
import {SunIcon, MoonIcon} from "@chakra-ui/icons"
import React from "react"
import RoundInput from "./RoundInput";
import RoundContext from "./RoundState";
import moment from "moment";
import TimeAgo from "react-timeago";
import {useViewportScroll} from "framer-motion";
import {calculateBaseMaxBet, getMaxBet} from "./util";
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
        <Text fontSize="xs" display={{sm: "none", md: "block"}}>
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

    let now = moment();
    let start = moment(roundState.roundData.start);
    let end = moment(roundState.roundData.start).add(1, 'day');
    let totalMillisInRange = end.valueOf() - start.valueOf();
    let elapsedMillis = now.valueOf() - start.valueOf();
    const roundPercentOver = Math.max(0, Math.min(100, 100 * (elapsedMillis / totalMillisInRange)));

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
            <Box textAlign="left" display={{sm: "none", lg: "block"}}>
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
        </HStack>
    )
}

function RoundInfo() {
    const {roundState} = React.useContext(RoundContext);

    let data = <Box width="210px">&nbsp;</Box>;

    if (roundState.roundData !== null) {
        if (roundState.roundData.winners[0] > 0) {
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

function MaxBetInput() {
    const {roundState} = React.useContext(RoundContext);
    const cookies = new Cookies();
    const toast = useToast();

    let maxBet = getMaxBet(roundState.currentSelectedRound);

    return (
        <>
            {roundState.roundData === null ?
                <Skeleton height="24px" width="80px"><Box>&nbsp;</Box></Skeleton>
                :
                <BetAmountInput
                    defaultValue={maxBet}
                    onBlur={(e) => {
                        let value = parseInt(e.target.value);
                        if (value === maxBet) {
                            // don't save over it if it's the same
                            return;
                        }

                        if (isNaN(value) || value === 0) {
                            value = -1000;
                        }

                        let baseMaxBet = calculateBaseMaxBet(value, roundState.currentSelectedRound);
                        cookies.set('baseMaxBet', baseMaxBet, {expires: moment().add(28, 'days').toDate()});

                        toast.closeAll();
                        toast({
                            title: `Max Bet Saved!`,
                            status: "success",
                            duration: 1200,
                            isClosable: true
                        });
                    }}/>
            }
        </>
    )
}

function TitleHeading() {
    return (
        <>
            <Heading as="h1" fontSize="lg" display={{base: "none", lg: "block"}}>
                NeoFoodClub
            </Heading>

            <Heading as="h1" fontSize="md" display={{base: "block", lg: "none"}}>
                NFC
            </Heading>
        </>
    )
}

function HeaderContent() {
    return (
        <>
            <Box p={4}>
                <HStack spacing={5}>
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
                </HStack>
            </Box>
        </>
    )
}

function Header(props) {
    const bg = useColorModeValue("white", "gray.800");
    const [y, setY] = React.useState(0);

    const {scrollY} = useViewportScroll()
    React.useEffect(() => {
        return scrollY.onChange(() => setY(scrollY.get()))
    }, [scrollY])

    return (
        <chakra.header
            shadow={y > 0 ? "md" : undefined}
            transition="box-shadow 0.2s"
            pos="fixed"
            top="0"
            zIndex="1"
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
