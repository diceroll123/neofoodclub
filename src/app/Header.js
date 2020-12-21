import {
    Box,
    chakra,
    CircularProgress,
    CircularProgressLabel,
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
} from "@chakra-ui/react"
import Moment from "react-moment";
import {SunIcon, MoonIcon} from "@chakra-ui/icons"
import React from "react"
import RoundInput from "./RoundInput";
import RoundContext from "./RoundState";
import moment from "moment";
import TimeAgo from "react-timeago";
import {useViewportScroll} from "framer-motion";

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

function HeaderContent() {
    return (
        <>
            <Box p={4}>
                <HStack spacing={5}>
                    <Heading as="h1" size="lg">
                        NeoFoodClub
                    </Heading>

                    <VStack spacing={0}>
                        <Text fontSize="sm" as="i">
                            Round:
                        </Text>
                        <RoundInput/>
                    </VStack>

                    <RoundInfo/>

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
