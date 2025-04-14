import { TriangleDownIcon, TriangleUpIcon } from "@chakra-ui/icons";
import {
  Box,
  Tooltip,
  Button,
  Icon,
  Radio,
  Skeleton,
  Circle,
  Table,
  Tbody,
  Text,
  Th,
  Thead,
  Tr,
  Collapse,
  useColorModeValue,
  useDisclosure,
  Heading,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  Flex,
  Avatar,
  Stack,
  StackDivider,
  Spacer,
  VStack,
} from "@chakra-ui/react";
import React, { useContext } from "react";
import moment from "moment";
import "moment-timezone";
import { FaSackDollar, FaUtensils, FaSkullCrossbones } from "react-icons/fa6";

import {
  ARENA_NAMES,
  FOODS,
  FULL_PIRATE_NAMES,
  NEGATIVE_FAS,
  PIRATE_NAMES,
  POSITIVE_FAS,
} from "../constants";
import { computePirateBinary } from "../maths";
import {
  displayAsPercent,
  anyBetsExist,
  getOdds,
  displayAsPlusMinus,
  useTableColors,
} from "../util";
import BetAmountsSettings from "./BetAmountsSettings";
import BetFunctions from "../BetFunctions";
import BigBrainElement from "./BigBrainElement";
import ClearBetsButton from "./ClearBetsButton";
import CustomOddsElement from "./CustomOddsElement";
import CustomOddsInput from "./CustomOddsInput";
import CustomProbsInput from "./CustomProbsInput";
import FaDetailsElement from "./FaDetailsElement";
import HorizontalScrollingBox from "./HorizontalScrollingBox";
import PayoutCharts from "./PayoutCharts";
import PayoutTable from "./PayoutTable";
import PirateSelect from "./PirateSelect";
import Pd from "./Pd";
import { RoundContext } from "../RoundState";
import Td from "./Td";
import TextTooltip from "./TextTooltip";
import { FaPenToSquare } from "react-icons/fa6";
import DateFormatter from "./DateFormatter";

const StickyTd = (props) => {
  const { children, onClick, cursor, ...rest } = props;
  return (
    <Td
      style={{ position: "sticky", left: "0" }}
      zIndex={1}
      onClick={onClick}
      cursor={cursor}
      {...rest}
    >
      {children}
    </Td>
  );
};

function PirateFA(props) {
  const { pirateId, foodId } = props;
  // returns the FA <td> element for the associated pirate/food
  const green = useColorModeValue("nfc.green", "nfc.greenDark");
  const red = useColorModeValue("nfc.red", "nfc.redDark");
  const yellow = useColorModeValue("nfc.yellow", "nfc.yellowDark");

  let pos = POSITIVE_FAS[pirateId][foodId];
  let neg = NEGATIVE_FAS[pirateId][foodId];

  // by default, transparent + empty string if FA is 0
  let color = "transparent";
  let indicator = "";

  if (pos && neg) {
    color = yellow;
    indicator = `+${pos}/-${neg}`;
  } else if (pos) {
    color = green;
    indicator = `+${pos}`;
  } else if (neg) {
    color = red;
    indicator = `-${neg}`;
  }

  return (
    <FaDetailsElement
      key={foodId}
      as={Pd}
      isNumeric
      backgroundColor={color}
      whiteSpace="nowrap"
    >
      <Text as={"b"}>{indicator}</Text>
    </FaDetailsElement>
  );
}

function calculatePercentages(timestamps, endTime) {
  const percentages = [];
  const startTime = timestamps[0];
  const diff = endTime - startTime;

  for (let i = 0; i < timestamps.length; i++) {
    let duration;
    if (i === timestamps.length - 1) {
      duration = endTime - timestamps[i];
    } else {
      duration = timestamps[i + 1] - timestamps[i];
    }

    const percentage = (duration / diff) * 100;
    percentages.push(percentage);
  }

  return percentages;
}

const TimelineBar = (props) => {
  const { index, odds, percent } = props;

  const colors = [
    "cyan",
    "green",
    "blue",
    "purple",
    "orange",
    "red",
    "yellow",
    "gray",
    "pink",
  ];

  let label = `${odds} (${moment.localeData().ordinal(index)} change)`;

  if (index === 0) {
    label = `${odds} (Opening Odds)`;
  }

  return (
    <Tooltip label={label}>
      <Box
        width={percent + "%"}
        bgColor={`${colors[odds % (colors.length - 1)]}.500`}
        whiteSpace="nowrap"
        overflow="hidden"
        fontSize="xs"
      >
        &nbsp;{odds}
      </Box>
    </Tooltip>
  );
};

const TimelineContent = (props) => {
  const { roundState, arenaId, pirateIndex } = props;

  if (!roundState.roundData) {
    return (
      <Skeleton>
        <Box>&nbsp;</Box>
      </Skeleton>
    );
  }

  const pirateId = roundState.roundData.pirates[arenaId][pirateIndex];
  const openingOdds =
    roundState.roundData.openingOdds[arenaId][pirateIndex + 1];
  const start = new Date(roundState.roundData.start);
  const endTime = new Date(roundState.roundData.timestamp);

  const thisPiratesOdds = [openingOdds];
  const thisPiratesChangesTimes = [start.getTime()];
  const thisPiratesChanges = [];

  const changes = roundState.roundData.changes || [];

  for (let i = 0; i < changes.length; i++) {
    let change = changes[i];
    if (change["arena"] === arenaId && change["pirate"] === pirateIndex + 1) {
      thisPiratesChanges.push(change);
      thisPiratesOdds.push(change["new"]);
      thisPiratesChangesTimes.push(new Date(change["t"]).getTime());
    }
  }

  const pirateName = PIRATE_NAMES[pirateId];

  const winners = roundState.roundData.winners || [0, 0, 0, 0, 0];
  const isRoundOver = winners[0] > 0;
  const winningPirate = winners[arenaId];
  const didPirateWin = winningPirate === pirateIndex + 1;

  let oddsChangesCountLabel = "";

  if (thisPiratesChanges.length > 0) {
    oddsChangesCountLabel = ` - ${thisPiratesChanges.length} odds change`;
    if (thisPiratesChanges.length > 1) {
      oddsChangesCountLabel += "s";
    }
  }

  return (
    <>
      <DrawerHeader>
        <Flex flex="1" gap="4" alignItems="center" flexWrap="wrap">
          <Avatar
            name={pirateName}
            src={`https://images.neopets.com/pirates/fc/fc_pirate_${pirateId}.gif`}
          />
          <Box>
            <Heading size="sm">
              {pirateName} {oddsChangesCountLabel}
            </Heading>
            <Text as="i" fontSize="md">
              Round {roundState.roundData.round}
              {" - "}
              <DateFormatter
                tz="America/Los_Angeles"
                format="dddd, MMMM Do YYYY"
                date={start}
              />
            </Text>
          </Box>
        </Flex>
      </DrawerHeader>

      <DrawerBody>
        <Stack divider={<StackDivider />} spacing="4">
          <Box>
            <Flex flex="1" gap="4" alignItems="center" flexWrap="wrap">
              <Circle boxSize={10} bgColor="blue.500">
                <Icon as={FaUtensils} boxSize={6} />
              </Circle>
              <Box>
                <Heading size="sm">
                  Round started{" - "}
                  <DateFormatter
                    format="LTS [NST]"
                    date={start}
                    tz="America/Los_Angeles"
                  />
                </Heading>
                <Text as="i">
                  {pirateName} opened at {openingOdds}:1
                </Text>
              </Box>
            </Flex>
          </Box>
          {thisPiratesChanges.map((change, i) => {
            const wentUp = change.new > change.old;
            return (
              <Box key={i}>
                <Flex flex="1" gap="4" alignItems="center" flexWrap="wrap">
                  <Circle
                    size={8}
                    bg={wentUp ? "tomato" : "green.500"}
                    color="white"
                  >
                    <Text fontSize="sm" as="b">
                      {displayAsPlusMinus(change.new - change.old)}
                    </Text>
                  </Circle>
                  <Box>
                    <Heading size="sm">
                      {change.old} to {change.new}
                    </Heading>
                    <Text fontSize="xs">
                      {moment.localeData().ordinal(i + 1)} change
                    </Text>
                  </Box>
                  <Spacer />

                  <VStack spacing={0}>
                    <Text as="i" fontSize="xs">
                      <DateFormatter
                        format="LTS [NST]"
                        date={change.t}
                        withTitle
                        titleFormat="LLL [NST]"
                      />
                    </Text>
                    <Text as="i" fontSize="xs" hidden={isRoundOver}>
                      <DateFormatter
                        format="llll [NST]"
                        date={change.t}
                        fromNow
                        withTitle
                        titleFormat="LLL [NST]"
                        interval={1}
                      />
                    </Text>
                  </VStack>
                </Flex>
              </Box>
            );
          })}
          {isRoundOver ? (
            <>
              <Box>
                <Flex flex="1" gap="4" alignItems="center" flexWrap="wrap">
                  <Circle size={10} bg={didPirateWin ? "green.500" : "tomato"}>
                    <Icon
                      boxSize={6}
                      as={didPirateWin ? FaSackDollar : FaSkullCrossbones}
                    />
                  </Circle>
                  <Box>
                    <Heading size="sm">
                      Round Over{" - "}
                      <DateFormatter
                        format="LTS [NST]"
                        date={endTime}
                        tz="America/Los_Angeles"
                      />
                    </Heading>
                    <Stack spacing={0}>
                      <Text as="i">
                        {pirateName}{" "}
                        {didPirateWin
                          ? "Won!"
                          : `lost to ${
                              PIRATE_NAMES[
                                roundState.roundData.pirates[arenaId][
                                  winningPirate - 1
                                ]
                              ]
                            }`}
                      </Text>
                      <Text as="i">
                        <DateFormatter
                          format="dddd, MMMM Do YYYY"
                          date={endTime}
                          tz="America/Los_Angeles"
                        />
                      </Text>
                    </Stack>
                  </Box>
                </Flex>
              </Box>
            </>
          ) : null}
        </Stack>
      </DrawerBody>
    </>
  );
};

const OddsTimeline = (props) => {
  const { roundState, onClick, arenaId, pirateIndex } = props;

  if (!roundState.roundData) {
    return (
      <Skeleton>
        <Box>&nbsp;</Box>
      </Skeleton>
    );
  }

  // Get timeline data
  const openingOdds =
    roundState.roundData.openingOdds[arenaId][pirateIndex + 1];
  const start = new Date(roundState.roundData.start);
  const endTime = new Date(roundState.roundData.timestamp);
  const changes = roundState.roundData.changes || [];

  // Calculate pirate odds history
  const thisPiratesOdds = [openingOdds];
  const thisPiratesChangesTimes = [start.getTime()];

  // Filter changes for this pirate
  changes.forEach((change) => {
    if (change.arena === arenaId && change.pirate === pirateIndex + 1) {
      thisPiratesOdds.push(change.new);
      thisPiratesChangesTimes.push(new Date(change.t).getTime());
    }
  });

  // Calculate proportional widths for timeline bars
  const percentages = calculatePercentages(
    thisPiratesChangesTimes,
    endTime.getTime()
  );

  return (
    <Flex maxW="300px" onClick={onClick} cursor="pointer">
      {thisPiratesOdds.map((odds, i) => (
        <TimelineBar key={i} index={i} odds={odds} percent={percentages[i]} />
      ))}
    </Flex>
  );
};

// Common utility function for changing bets
const createChangeBet = (allBets, currentBet, setAllBets) => {
  return (betIndex, arenaIndex, pirateIndex) => {
    // change a single pirate in a single arena
    const newBets = JSON.parse(JSON.stringify(allBets[currentBet]));
    newBets[betIndex][arenaIndex] = pirateIndex;
    setAllBets({ ...allBets, [currentBet]: newBets });
  };
};

// Common utility function for changing bet lines
const createChangeBetLine = (allBets, currentBet, setAllBets) => {
  return (arenaIndex, pirateValue) => {
    const amountOfBets = Object.keys(allBets[currentBet]).length;
    // change the entire row to pirateValue for the 10-bet button
    const newBets = JSON.parse(JSON.stringify(allBets[currentBet]));
    for (let x = 1; x <= amountOfBets; x++) {
      newBets[x][arenaIndex] = pirateValue;
    }
    setAllBets({ ...allBets, [currentBet]: newBets });
  };
};

const NormalTable = (props) => {
  let { timelineHandlers, getPirateBgColor } = props;
  const { roundState, calculations, currentBet, allBets, setAllBets } =
    useContext(RoundContext);
  const {
    arenaRatios,
    winningBetBinary,
    legacyProbabilities,
    logitProbabilities,
    usedProbabilities,
    pirateFAs,
  } = calculations;
  const amountOfBets = Object.keys(allBets[currentBet]).length;

  const { openTimelineDrawer } = timelineHandlers;

  const colors = useTableColors();

  const changeBet = createChangeBet(allBets, currentBet, setAllBets);
  const changeBetLine = createChangeBetLine(allBets, currentBet, setAllBets);

  const amountOfChanges = (roundState?.roundData?.changes || []).length;

  return (
    <Table size="sm" width="auto">
      <Thead>
        <Tr>
          <Th>Arena</Th>
          <BigBrainElement as={Th}>Ratio</BigBrainElement>
          <Th>Pirate</Th>
          {roundState.advanced.useLogitModel ? (
            <BigBrainElement as={Th}>Prob</BigBrainElement>
          ) : (
            <>
              <BigBrainElement as={Th}>Min Prob</BigBrainElement>
              <BigBrainElement as={Th}>Max Prob</BigBrainElement>
              <BigBrainElement as={Th}>Std Prob</BigBrainElement>
            </>
          )}
          <CustomOddsElement as={Th}>
            <TextTooltip text="Custom Prob" label="Custom Std. Probability" />
          </CustomOddsElement>
          <CustomOddsElement as={Th}>
            <TextTooltip text="Used" label="Used Std. Probability" />
          </CustomOddsElement>
          <BigBrainElement as={Th}>Payout</BigBrainElement>
          <BigBrainElement as={Th}>
            <TextTooltip text="FA" label="Food Adjustment" />
          </BigBrainElement>
          <FaDetailsElement as={Th} colSpan={10}>
            FA Explanation
          </FaDetailsElement>
          <Th>
            <TextTooltip text="Open" label="Opening Odds" />
          </Th>
          <Th>
            <TextTooltip text="Curr" label="Current Odds" />
          </Th>
          <CustomOddsElement as={Th} whiteSpace="nowrap">
            Custom Odds
          </CustomOddsElement>
          {roundState.advanced.oddsTimeline ? (
            <BigBrainElement as={Th} minW="300px">
              Odds Timeline ({amountOfChanges} change
              {amountOfChanges === 1 ? "" : "s"})
            </BigBrainElement>
          ) : null}
          {[...Array(amountOfBets)].map((_e, i) => {
            return (
              <Th key={i} whiteSpace="nowrap">
                Bet {i + 1}
              </Th>
            );
          })}
          <Th>
            <ClearBetsButton />
          </Th>
        </Tr>
      </Thead>
      {ARENA_NAMES.map((arenaName, arenaId) => {
        let pirates;
        if (roundState.roundData) {
          pirates = roundState.roundData.pirates[arenaId];
        } else {
          pirates = [...Array(4)];
        }

        return (
          <Tbody key={arenaId}>
            <Tr>
              <Td rowSpan={5}>{arenaName}</Td>
              <BigBrainElement as={Td} rowSpan={5} isNumeric>
                {roundState.roundData ? (
                  <TextTooltip
                    text={displayAsPercent(arenaRatios[arenaId], 1)}
                    label={arenaRatios[arenaId] * 100}
                  />
                ) : (
                  <Skeleton>
                    <Box>&nbsp;</Box>
                  </Skeleton>
                )}
              </BigBrainElement>
              <Td
                backgroundColor={colors.gray}
                colSpan={
                  roundState.advanced.bigBrain
                    ? roundState.advanced.useLogitModel
                      ? 4
                      : 6
                    : 1
                }
              />
              <CustomOddsElement
                as={Td}
                backgroundColor={colors.gray}
                colSpan={2}
              />
              {roundState.roundData?.foods ? (
                <>
                  {roundState.roundData.foods[arenaId].map((foodId) => {
                    const food = FOODS[foodId];
                    return (
                      <FaDetailsElement
                        key={foodId}
                        as={Pd}
                        whiteSpace="nowrap"
                        overflow="hidden"
                        textOverflow="ellipsis"
                        backgroundColor={colors.gray}
                      >
                        <TextTooltip text={food} />
                      </FaDetailsElement>
                    );
                  })}
                </>
              ) : null}
              <Td backgroundColor={colors.gray} colSpan={2} />
              <CustomOddsElement as={Td} backgroundColor={colors.gray} />
              {roundState.advanced.oddsTimeline ? (
                <BigBrainElement as={Td} backgroundColor={colors.gray} />
              ) : null}
              {roundState.roundData ? (
                <>
                  {[...Array(amountOfBets)].map((_bet, betNum) => {
                    return (
                      <Td key={betNum} backgroundColor={colors.gray}>
                        <center>
                          <Radio
                            name={`bet${betNum + 1}${arenaId}`}
                            value={0}
                            onChange={() => changeBet(betNum + 1, arenaId, 0)}
                            isChecked={
                              allBets[currentBet][betNum + 1][arenaId] === 0
                            }
                          />
                        </center>
                      </Td>
                    );
                  })}
                  <Td backgroundColor={colors.gray}>
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => {
                        changeBetLine(arenaId, 0);
                      }}
                    >
                      {amountOfBets}-Bet
                    </Button>
                  </Td>
                </>
              ) : (
                <>
                  <Td colSpan={100} backgroundColor={colors.gray}>
                    <Skeleton height="24px">
                      <Box>&nbsp;</Box>
                    </Skeleton>
                  </Td>
                </>
              )}
            </Tr>

            {pirates.map((pirateId, pirateIndex) => {
              if (!roundState.roundData || !calculations.calculated) {
                // big ol skeleton
                return (
                  <Tr key={pirateIndex}>
                    <Td colSpan={100}>
                      <Skeleton height="24px">&nbsp;</Skeleton>
                    </Td>
                  </Tr>
                );
              }

              let opening =
                roundState.roundData.openingOdds[arenaId][pirateIndex + 1];
              let current =
                roundState.roundData.currentOdds[arenaId][pirateIndex + 1];

              let usedOdds = getOdds(roundState);
              let custom = usedOdds[arenaId][pirateIndex + 1];
              const useCustom =
                roundState.advanced.bigBrain &&
                roundState.advanced.customOddsMode;
              const useOdds = useCustom ? custom : current;

              let pirateBin = computePirateBinary(arenaId, pirateIndex + 1);
              let pirateWon = (winningBetBinary & pirateBin) === pirateBin;

              let probs = usedProbabilities;
              let prob = probs[arenaId][pirateIndex + 1];

              const payout = useOdds * prob - 1;
              let payoutBackground = "transparent";
              if (payout > 0) {
                payoutBackground = colors.green;
              } else if (payout <= -0.1) {
                payoutBackground = colors.red;
              }

              return (
                <Tr
                  key={pirateId}
                  backgroundColor={pirateWon ? colors.green : null}
                >
                  <StickyTd
                    backgroundColor={getPirateBgColor(opening)}
                    onClick={() => openTimelineDrawer?.(arenaId, pirateIndex)}
                    cursor="pointer"
                    title={`Click to view odds timeline for ${FULL_PIRATE_NAMES[pirateId]}`}
                  >
                    {PIRATE_NAMES[pirateId]}
                  </StickyTd>
                  {roundState.advanced.useLogitModel ? (
                    <BigBrainElement as={Td} isNumeric>
                      {displayAsPercent(
                        logitProbabilities.prob[arenaId][pirateIndex + 1],
                        1
                      )}
                    </BigBrainElement>
                  ) : (
                    <>
                      <BigBrainElement as={Td} isNumeric>
                        {displayAsPercent(
                          legacyProbabilities.min[arenaId][pirateIndex + 1],
                          1
                        )}
                      </BigBrainElement>
                      <BigBrainElement as={Td} isNumeric>
                        {displayAsPercent(
                          legacyProbabilities.max[arenaId][pirateIndex + 1],
                          1
                        )}
                      </BigBrainElement>
                      <BigBrainElement as={Td} isNumeric>
                        {displayAsPercent(
                          legacyProbabilities.std[arenaId][pirateIndex + 1],
                          1
                        )}
                      </BigBrainElement>
                    </>
                  )}
                  <CustomOddsElement as={Td} isNumeric>
                    <CustomProbsInput
                      arenaIndex={arenaId}
                      pirateIndex={pirateIndex + 1}
                      used={probs}
                    />
                  </CustomOddsElement>
                  <CustomOddsElement as={Td} isNumeric>
                    {displayAsPercent(prob, 1)}
                  </CustomOddsElement>
                  <BigBrainElement
                    as={Td}
                    backgroundColor={payoutBackground}
                    isNumeric
                  >
                    {displayAsPercent(payout, 1)}
                  </BigBrainElement>
                  {roundState.roundData?.foods ? (
                    <>
                      <BigBrainElement as={Td} isNumeric>
                        {pirateFAs[arenaId][pirateIndex]}
                      </BigBrainElement>
                      {roundState.roundData.foods[arenaId].map((foodId, i) => {
                        return (
                          <PirateFA
                            key={i}
                            pirateId={pirateId}
                            foodId={foodId}
                          />
                        );
                      })}
                    </>
                  ) : (
                    <BigBrainElement as={Td} isNumeric>
                      N/A
                    </BigBrainElement>
                  )}
                  <Td isNumeric>{opening}:1</Td>
                  <Td isNumeric whiteSpace="nowrap">
                    {current > opening && (
                      <Icon as={TriangleUpIcon} mr={1} color={colors.green} />
                    )}
                    {current < opening && (
                      <Icon as={TriangleDownIcon} mr={1} color={colors.red} />
                    )}
                    <Text as={current === opening ? "" : "b"}>{current}:1</Text>
                  </Td>
                  <CustomOddsElement as={Td}>
                    <CustomOddsInput
                      arenaIndex={arenaId}
                      pirateIndex={pirateIndex + 1}
                    />
                  </CustomOddsElement>
                  {roundState.advanced.oddsTimeline ? (
                    <BigBrainElement as={Td} px={0}>
                      <OddsTimeline
                        roundState={roundState}
                        arenaId={arenaId}
                        pirateIndex={pirateIndex}
                        onClick={() =>
                          openTimelineDrawer?.(arenaId, pirateIndex)
                        }
                      />
                    </BigBrainElement>
                  ) : null}
                  {[...Array(amountOfBets)].map((_bet, betNum) => {
                    return (
                      <Td key={betNum}>
                        <center>
                          <Radio
                            name={`bet${betNum + 1}${arenaId}`}
                            value={pirateIndex + 1}
                            onChange={() =>
                              changeBet(betNum + 1, arenaId, pirateIndex + 1)
                            }
                            isChecked={
                              allBets[currentBet][betNum + 1][arenaId] ===
                              pirateIndex + 1
                            }
                          />
                        </center>
                      </Td>
                    );
                  })}
                  <Td>
                    <Button
                      size="xs"
                      onClick={() => {
                        changeBetLine(arenaId, pirateIndex + 1);
                      }}
                    >
                      {amountOfBets}-Bet
                    </Button>
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        );
      })}
    </Table>
  );
};

const DropDownTable = (props) => {
  let { timelineHandlers, getPirateBgColor, ...rest } = props;
  const { roundState, calculations, currentBet, allBets, setAllBets } =
    useContext(RoundContext);
  const { winningBetBinary, arenaRatios } = calculations;
  const amountOfBets = Object.keys(allBets[currentBet]).length;

  const { openTimelineDrawer } = timelineHandlers;

  const colors = useTableColors();

  const changeBet = createChangeBet(allBets, currentBet, setAllBets);

  return (
    <Table size="sm" width="auto" {...rest}>
      <Thead>
        <Tr>
          {ARENA_NAMES.map((arenaName, arenaId) => {
            return (
              <Th key={arenaId}>
                {arenaName} ({displayAsPercent(arenaRatios[arenaId], 1)})
              </Th>
            );
          })}
          <Th>
            <ClearBetsButton />
          </Th>
        </Tr>
      </Thead>
      <Tbody>
        <Tr>
          {[...Array(5)].map((_, arenaId) => {
            let pirates;
            if (roundState.roundData) {
              pirates = roundState.roundData.pirates[arenaId];
            } else {
              pirates = [...Array(4)];
            }

            return (
              <Pd key={arenaId}>
                <Table size="sm" maxW="150px">
                  <Tbody>
                    {pirates.map((pirateId, pirateIndex) => {
                      if (roundState.roundData === null) {
                        // big ol skeleton
                        return (
                          <Tr key={pirateIndex}>
                            <Pd>
                              <Skeleton width="150px" height="24px">
                                &nbsp;
                              </Skeleton>
                            </Pd>
                          </Tr>
                        );
                      }

                      let opening =
                        roundState.roundData.openingOdds[arenaId][
                          pirateIndex + 1
                        ];
                      let current =
                        roundState.roundData.currentOdds[arenaId][
                          pirateIndex + 1
                        ];

                      let pirateBin = computePirateBinary(
                        arenaId,
                        pirateIndex + 1
                      );
                      let pirateWon =
                        (winningBetBinary & pirateBin) === pirateBin;

                      return (
                        <Tr
                          key={pirateId}
                          backgroundColor={pirateWon ? colors.green : null}
                        >
                          <Pd
                            whiteSpace="nowrap"
                            backgroundColor={
                              pirateWon
                                ? colors.green
                                : getPirateBgColor(opening)
                            }
                            onClick={() =>
                              openTimelineDrawer?.(arenaId, pirateIndex)
                            }
                            cursor="pointer"
                            title={`Click to view odds timeline for ${FULL_PIRATE_NAMES[pirateId]}`}
                          >
                            {PIRATE_NAMES[pirateId]}
                          </Pd>
                          <Pd isNumeric>{opening}:1</Pd>
                          <Pd isNumeric>
                            <Text as={current === opening ? "" : "b"}>
                              {current}:1
                            </Text>
                          </Pd>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
              </Pd>
            );
          })}
        </Tr>
      </Tbody>
      <Tbody>
        {[...Array(amountOfBets)].map((_bet, betNum) => {
          return (
            <Tr key={betNum}>
              {[...Array(5)].map((_, arenaId) => {
                if (roundState.roundData === null) {
                  return (
                    <Pd key={arenaId}>
                      <Skeleton height="24px">
                        <Box>&nbsp;</Box>
                      </Skeleton>
                    </Pd>
                  );
                }
                let pirateIndex = allBets[currentBet][betNum + 1][arenaId];

                return (
                  <Pd key={arenaId}>
                    <PirateSelect
                      arenaId={arenaId}
                      pirateValue={pirateIndex}
                      getPirateBgColor={getPirateBgColor}
                      onChange={(e) =>
                        changeBet(betNum + 1, arenaId, parseInt(e.target.value))
                      }
                    />
                  </Pd>
                );
              })}
            </Tr>
          );
        })}
      </Tbody>
    </Table>
  );
};

const PirateTable = (props) => {
  const { roundState } = useContext(RoundContext);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedTimeline, setSelectedTimeline] = React.useState({
    arenaId: 0,
    pirateIndex: 0,
  });
  const timelineRef = React.useRef();

  // Simplified drawer opening function
  const openTimelineDrawer = (arenaId, pirateIndex) => {
    setSelectedTimeline({ arenaId, pirateIndex });
    onOpen();
  };

  // Timeline drawer component
  const timelineDrawer = (
    <Drawer
      isOpen={isOpen}
      placement="right"
      onClose={onClose}
      finalFocusRef={timelineRef}
      size="md"
    >
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <TimelineContent
          roundState={roundState}
          arenaId={selectedTimeline.arenaId}
          pirateIndex={selectedTimeline.pirateIndex}
        />
      </DrawerContent>
    </Drawer>
  );

  // Common timeline handlers for both table modes
  const timelineHandlers = {
    openTimelineDrawer,
    timelineRef,
  };

  if (roundState.tableMode === "dropdown") {
    return (
      <>
        <DropDownTable timelineHandlers={timelineHandlers} {...props} />
        {timelineDrawer}
      </>
    );
  }

  return (
    <>
      <NormalTable timelineHandlers={timelineHandlers} {...props} />
      {timelineDrawer}
    </>
  );
};

export default function EditBets(props) {
  const { roundState, setRoundState, currentBet, allBets } =
    useContext(RoundContext);

  const { getPirateBgColor } = props;
  const colors = useTableColors();

  const anyBets = anyBetsExist(allBets[currentBet]);

  return (
    <>
      <Collapse in={roundState.viewMode}>
        <Box bgColor={colors.blue} p={4}>
          <Button
            leftIcon={<Icon as={FaPenToSquare} />}
            colorScheme="blackAlpha"
            onClick={() => {
              setRoundState({ viewMode: false });
            }}
          >
            Edit these bets
          </Button>
        </Box>
      </Collapse>

      <Collapse in={!roundState.viewMode}>
        <HorizontalScrollingBox>
          <PirateTable m={4} getPirateBgColor={getPirateBgColor} />
        </HorizontalScrollingBox>

        <BetFunctions getPirateBgColor={getPirateBgColor} />
      </Collapse>

      {anyBets && (
        <>
          <BetAmountsSettings boxShadow="md" />

          <HorizontalScrollingBox py={4}>
            <PayoutTable getPirateBgColor={getPirateBgColor} />
          </HorizontalScrollingBox>

          <HorizontalScrollingBox py={4}>
            <PayoutCharts />
          </HorizontalScrollingBox>
        </>
      )}
    </>
  );
}
