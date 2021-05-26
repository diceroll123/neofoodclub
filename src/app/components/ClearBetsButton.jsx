import { useContext } from "react";
import RoundContext from "../RoundState";
import { Button } from "@chakra-ui/react";
import { makeEmptyBets, makeEmptyBetAmounts } from "../util";

// this is the "Clear" button on top of the bet table

const ClearBetsButton = () => {
    const { roundState, setRoundState } = useContext(RoundContext);
    const amountOfBets = Object.keys(roundState.bets).length;

    function clearBets() {
        setRoundState({
            bets: { ...makeEmptyBets(amountOfBets) },
            betAmounts: { ...makeEmptyBetAmounts(amountOfBets) },
        });
    }

    return (
        <Button width="100%" size="xs" onClick={clearBets}>
            Clear
        </Button>
    );
};

export default ClearBetsButton;
