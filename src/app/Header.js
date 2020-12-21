import {
    Box,
    chakra,
    CircularProgress,
    CircularProgressLabel,
    Heading,
    Button,
    Tooltip,
    HStack,
    Icon,
    IconButton,
    Link,
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
            <Link as={Button}
                  m={0}
                  isExternal
                  aria-label="GitHub"
                  href="https://github.com/diceroll123/foodclub">
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
                    <GitHubButton/>
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
