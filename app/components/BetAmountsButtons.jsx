import {
  Button,
  ButtonGroup,
  Icon,
  Heading,
  Stack,
  Tooltip,
} from "@chakra-ui/react";
import { useContext } from "react";
import { RoundContext } from "../RoundState";
import { determineBetAmount, getMaxBet } from "../util";
import { FaFillDrip, FaInfinity } from "react-icons/fa";

const BetAmountsButtons = (props) => {
  const {
    roundState,
    calculations,
    currentBet,
    allBetAmounts,
    setAllBetAmounts,
  } = useContext(RoundContext);
  const { ...rest } = props;
  const { betBinaries, betOdds } = calculations;

  const setBetAmounts = (value, capped) => {
    let betAmounts = { ...allBetAmounts[currentBet] };
    for (let index in allBetAmounts[currentBet]) {
      if (betBinaries[index] > 0) {
        if (capped) {
          betAmounts[index] = determineBetAmount(
            value,
            Math.ceil(1000000 / betOdds[index])
          );
        } else {
          betAmounts[index] = value;
        }
      } else {
        betAmounts[index] = -1000;
      }
    }
    setAllBetAmounts({ ...allBetAmounts, [currentBet]: betAmounts });
  };

  return (
    <>
      <Stack>
        <Heading size="sm" textTransform="uppercase">
          Set bet amounts
        </Heading>
        <ButtonGroup mt={2}>
          <Tooltip
            label="Sets all bet amounts to whichever is lower: your max bet amount, or the value in the MAXBET column below + 1. This prevents you from betting more than necessary to earn 1M NP from the bet, given the current odds."
            openDelay="600"
            placement="top"
          >
            <Button
              leftIcon={<Icon as={FaFillDrip} w="1.4em" h="1.4em" />}
              size="sm"
              colorScheme="green"
              onClick={() => {
                setBetAmounts(getMaxBet(roundState.currentSelectedRound), true);
              }}
              {...rest}
            >
              Capped
            </Button>
          </Tooltip>
          <Tooltip
            label="Sets all bet amounts your max bet, regardless of overflow with the MAXBET column below. This is generally used by people who would like to maximize profits in the event of odds changing."
            openDelay="600"
            placement="top"
          >
            <Button
              leftIcon={<Icon as={FaInfinity} w="1.4em" h="1.4em" />}
              size="sm"
              colorScheme="blue"
              onClick={() => {
                setBetAmounts(
                  getMaxBet(roundState.currentSelectedRound),
                  false
                );
              }}
              {...rest}
            >
              Uncapped
            </Button>
          </Tooltip>
          <Button
            size="sm"
            onClick={() => {
              setBetAmounts(-1000, false);
            }}
            colorScheme="red"
            {...rest}
          >
            Clear
          </Button>
        </ButtonGroup>
      </Stack>
    </>
  );
};

export default BetAmountsButtons;
