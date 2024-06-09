import { Button } from "@chakra-ui/react";
import React, { useContext } from "react";

import { makeEmptyBets, makeEmptyBetAmounts } from "../util";
import { RoundContext } from "../RoundState";

// this is the "Clear" button on top of the bet table

const ClearBetsButton = () => {
    const { roundState, setRoundState } = useContext(RoundContext);
    const amountOfBets = Object.keys(roundState.bets).length;

    const clearBets = () => {
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
