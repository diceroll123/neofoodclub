import { Button, ButtonGroup, Icon, Heading, Stack } from "@chakra-ui/react";
import { useContext } from "react";
import { RoundContext } from "../RoundState";
import { determineBetAmount, getMaxBet } from "../util";
import { FaFillDrip, FaInfinity } from "react-icons/fa";

const SetAllToMaxButton = (props) => {
	const { roundState, setRoundState, calculations } =
		useContext(RoundContext);
	const { ...rest } = props;
	const { betBinaries, betOdds } = calculations;

	const setAllBets = (value, capped) => {
		let betAmounts = { ...roundState.betAmounts };
		for (let index in roundState.betAmounts) {
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
		setRoundState({ betAmounts });
	}

	return (
		<>
			<Stack>
				<Heading size='sm' textTransform="uppercase">Set bet amounts</Heading>
				<ButtonGroup mt={2}>
					<Button
						leftIcon={<Icon as={FaFillDrip} w="1.4em" h="1.4em" />}
						size="sm"
						colorScheme="green"
						onClick={() => {
							setAllBets(getMaxBet(roundState.currentSelectedRound), true);
						}}
						{...rest}
					>
						Capped
					</Button>
					<Button
						leftIcon={<Icon as={FaInfinity} w="1.4em" h="1.4em" />}
						size="sm"
						colorScheme="blue"
						onClick={() => {
							setAllBets(getMaxBet(roundState.currentSelectedRound), false);
						}}
						{...rest}
					>
						Uncapped
					</Button>
					<Button
						size="sm"
						onClick={() => {
							setAllBets(-1000, false);
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

export default SetAllToMaxButton;
