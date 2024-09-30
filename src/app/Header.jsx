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
import { FaSync } from "react-icons/fa";
import { FaClockRotateLeft } from "react-icons/fa6";

moment.relativeTimeThreshold("ss", 0);

function PreviousRoundInfo() {
  const { roundState } = useContext(RoundContext);

  return (
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
    <VStack divider={<StackDivider />} spacing={1} minW="140px">
      <HStack>
        <Tooltip label="Last Update">
          <div>
            <Icon as={FaSync} />
          </div>
        </Tooltip>
        <Text fontSize="xs" as={element} minW="100px">
          <Moment
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
            <Text fontSize="xs" minW="100px">
              <Moment
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
    <InputGroup size="xs">
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
        <TitleHeading />
        <Spacer />

        <Box
          p={2}
          maxW="lg"
          borderWidth="1px"
          borderRadius="md"
          boxShadow={isGlowing ? "outline" : undefined}
          transition="box-shadow 4s"
        >
          <HStack spacing={3} h="100%">
            <VStack spacing={1} maxW={"140px"}>
              <RoundInput />
              <MaxBetInput />
            </VStack>
            <SkeletonText minW={"130"} isLoaded={roundState?.roundData}>
              <HStack>
                <CurrentRoundProgress hidden={winnersExist} />
                <RoundInfo />
              </HStack>
            </SkeletonText>
          </HStack>
        </Box>
        <Spacer />
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
