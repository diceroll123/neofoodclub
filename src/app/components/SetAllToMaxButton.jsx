import { Button, Icon } from "@chakra-ui/react";
import { useContext } from "react";
import { RoundContext } from "../RoundState";
import { determineBetAmount, getMaxBet } from "../util";
import { FaFillDrip } from "react-icons/fa";

const SetAllToMaxButton = (props) => {
	const { roundState, setRoundState, calculations } =
		useContext(RoundContext);
	const { ...rest } = props;
	const { betBinaries, betOdds } = calculations;

	function setAllBets(value) {
		let betAmounts = { ...roundState.betAmounts };
		for (let index in roundState.betAmounts) {
			if (betBinaries[index] > 0) {
				betAmounts[index] = determineBetAmount(
					value,
					Math.ceil(1000000 / betOdds[index])
				);
			} else {
				betAmounts[index] = -1000;
			}
		}
		setRoundState({ betAmounts });
	}

	return (
		<Button
			leftIcon={<Icon as={FaFillDrip} />}
			size="sm"
			colorScheme="green"
			onClick={() => {
				setAllBets(getMaxBet(roundState.currentSelectedRound));
			}}
			{...rest}
		>
			Set bet amounts to max
		</Button>
	);
};

export default SetAllToMaxButton;
