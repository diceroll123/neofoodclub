import {
  Box,
  Button,
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
import React, { useContext, useEffect, useState, useMemo } from "react";
import moment from "moment";
import NeopointIcon from "./images/np-icon.svg";

import {
  calculateBaseMaxBet,
  calculateRoundOverPercentage,
  getMaxBet,
} from "./util";
import { RoundContext } from "./RoundState";
import RoundInput from "./components/RoundInput";
import { FaRotate, FaClockRotateLeft } from "react-icons/fa6";
import GlowCard from "./components/GlowCard";
import DateFormatter from "./components/DateFormatter";
import SidebarSettings from "./components/SidebarSettings";
moment.relativeTimeThreshold("ss", 0);

function PreviousRoundInfo() {
  const { roundState } = useContext(RoundContext);

  return (
    <Text as={Box} fontSize="xs">
      <VStack spacing={0}>
        <>Round {roundState.currentSelectedRound} ended</>
        <>
          <DateFormatter
            format={
              moment().year() === moment(roundState.roundData.timestamp).year()
                ? "MMM D, h:mm A [NST]"
                : "MMM D YYYY, h:mm A [NST]"
            }
            date={roundState.roundData.timestamp}
            tz="America/Los_Angeles"
          />
        </>
      </VStack>
    </Text>
  );
}

function CurrentRoundProgress() {
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
        <CircularProgress size="38px" value={roundPercentOver} capIsRound>
          <CircularProgressLabel>
            {Math.floor(roundPercentOver)}%
          </CircularProgressLabel>
        </CircularProgress>
      )}
    </>
  );
}

function CurrentRoundInfo() {
  const { roundState } = useContext(RoundContext);

  const timestamp = moment(roundState.roundData.timestamp);

  let element = "span";

  if (moment().diff(timestamp) > 3e5) {
    // highlight the current last update if it hasn't been updated in 30+s
    element = "mark";
  }

  return (
    <VStack
      divider={<StackDivider />}
      spacing={1}
      minW={{ sm: "140px" }}
      overflow="hidden"
    >
      <HStack>
        <Tooltip label="Last Update">
          <div>
            <Icon as={FaRotate} />
          </div>
        </Tooltip>
        <Text
          fontSize="xs"
          as={element}
          minW={{ base: "auto", sm: "100px" }}
          isTruncated
        >
          <DateFormatter
            date={roundState.roundData.timestamp}
            tz={"America/Los_Angeles"}
            fromNow
            withTitle
            titleFormat="LLL [NST]"
            interval={1}
          />
        </Text>
      </HStack>
      {roundState.roundData.lastChange &&
        roundState.roundData.start !== roundState.roundData.lastChange && (
          <HStack>
            <Tooltip label="Last Change">
              <div>
                <Icon as={FaClockRotateLeft} />
              </div>
            </Tooltip>
            <Text
              fontSize="xs"
              minW={{ base: "auto", sm: "100px" }}
              isTruncated
            >
              <DateFormatter
                date={roundState.roundData.lastChange}
                tz={"America/Los_Angeles"}
                fromNow
                withTitle
                titleFormat="LLL [NST]"
                interval={1}
              />
            </Text>
          </HStack>
        )}
    </VStack>
  );
}

function RoundInfo() {
  const { roundState } = useContext(RoundContext);

  let element = null;

  if (roundState?.roundData?.winners[0] > 0) {
    element = <PreviousRoundInfo />;
  } else if (roundState?.roundData?.timestamp) {
    element = <CurrentRoundInfo />;
  }

  return element;
}

function MaxBetInput() {
  const { roundState } = useContext(RoundContext);
  const cookies = new Cookies();
  const toast = useToast();
  const [hasFocus, setHasFocus] = useState(false);

  const [tempMaxBet, setTempMaxBet] = useState(
    getMaxBet(roundState.currentSelectedRound)
  );

  useEffect(() => {
    setTempMaxBet(getMaxBet(roundState.currentSelectedRound));
  }, [roundState.currentSelectedRound]);

  return (
    <InputGroup size="xs" w="100%">
      <InputLeftAddon children="Max Bet" />
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
        }}
        min={-1000}
        max={500000}
        allowMouseWheel
        w="100%"
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
  );
}

function TitleHeading(props) {
  const { setRoundState, roundState } = useContext(RoundContext);

  const { scrollY } = window;

  let disabled = false;

  if (
    scrollY === 0 &&
    roundState.currentSelectedRound === roundState.currentRound
  ) {
    disabled = true;
  }

  return (
    <>
      <HStack
        as={Button}
        display={{ base: "none", md: "block" }}
        cursor={"pointer"}
        userSelect={"none"}
        variant="ghost"
        _hover={{ bg: disabled ? "transparent" : undefined }}
        onClick={() => {
          setRoundState({ viewMode: false });

          if (scrollY !== 0) {
            // scroll to top
            window.scrollTo({ top: 0, behavior: "smooth" });
          } else if (
            roundState.currentSelectedRound !== roundState.currentRound
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
}

function HeaderContent() {
  const { roundState } = useContext(RoundContext);
  const [isGlowing, setIsGlowing] = useState(false);
  const [currentTimestamp, setCurrentTimestamp] = useState("");
  const [winnersExist, setWinnersExist] = useState(false);

  const anyWinners = useMemo(() => {
    const winners = roundState.roundData?.winners || [];
    return winners.some((winner) => winner > 0);
  }, [roundState.roundData?.winners]);

  useEffect(() => {
    if (!roundState.roundData) {
      setIsGlowing(false);
      return;
    }

    const timestamp = roundState.roundData?.timestamp;

    setWinnersExist(anyWinners);

    if (anyWinners) {
      setIsGlowing(false);
      return;
    }

    if (!timestamp) {
      setIsGlowing(false);
      return;
    }

    if (timestamp === roundState.roundData.start) {
      setIsGlowing(false);
      return;
    }

    if (currentTimestamp !== timestamp) {
      setIsGlowing(true);
    }

    setCurrentTimestamp(timestamp);
    const timeout = setTimeout(() => {
      setIsGlowing(false);
    }, 4000);
    return () => clearTimeout(timeout);
  }, [roundState, currentTimestamp, anyWinners]);

  return (
    <>
      <HStack p={4} spacing={4} as={Flex}>
        <SidebarSettings />
        <TitleHeading />
        <Spacer display={{ base: "none", md: "block" }} />
        <GlowCard p={2} maxW="lg" animate={isGlowing} mx="auto">
          <Flex h="100%" gap={2} align="center">
            <VStack spacing={1} maxW="140px">
              <RoundInput />
              <MaxBetInput />
            </VStack>
            <SkeletonText isLoaded={roundState?.roundData}>
              <Flex align="center" justify="center" gap={2}>
                <CurrentRoundProgress hidden={winnersExist} />
                <RoundInfo display={{ base: "none", md: "block" }} />
              </Flex>
            </SkeletonText>
          </Flex>
        </GlowCard>
        <Spacer display={{ base: "none", md: "block" }} />
      </HStack>
    </>
  );
}

function Header(props) {
  const bg = useColorModeValue(
    "rgba(255, 255, 255, 0.7)",
    "rgba(26, 32, 44, 0.7)"
  );
  const [y, setY] = useState(0);

  const { scrollY } = useScroll();
  useEffect(() => {
    scrollY.on("change", () => setY(scrollY.get()));
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
      style={{ backdropFilter: "saturate(180%) blur(5px)" }}
      left="0"
      right="0"
      width="full"
      {...props}
    >
      <HeaderContent />
    </Box>
  );
}

export default Header;
