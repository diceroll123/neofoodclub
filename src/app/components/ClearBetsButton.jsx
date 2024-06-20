import { Button } from "@chakra-ui/react";
import React, { useContext } from "react";

import { makeEmptyBets, makeEmptyBetAmounts } from "../util";
import { RoundContext } from "../RoundState";

// this is the "Clear" button on top of the bet table

const ClearBetsButton = () => {
    const { currentBet,
        allBets, setAllBets,
        allBetAmounts, setAllBetAmounts
    } = useContext(RoundContext);
    const amountOfBets = Object.keys(allBets[currentBet]).length;

    const clearBets = () => {
        setAllBets({ ...allBets, [currentBet]: makeEmptyBets(amountOfBets) });
        setAllBetAmounts({ ...allBetAmounts, [currentBet]: makeEmptyBetAmounts(amountOfBets) });
    }

    return (
        <Button width="100%" size="xs" onClick={clearBets}>
            Clear
        </Button>
    );
};

export default ClearBetsButton;
