import { Button } from "@chakra-ui/react";
import React, { useContext, memo, useCallback, useMemo } from "react";

import { makeEmptyBets, makeEmptyBetAmounts } from "../util";
import { RoundContext } from "../RoundState";

// this is the "Clear" button on top of the bet table

const ClearBetsButton = memo(() => {
    const { currentBet, allBets, setAllBets, allBetAmounts, setAllBetAmounts } =
        useContext(RoundContext);
    const amountOfBets = Object.keys(allBets[currentBet]).length;

    const clearBets = useCallback(() => {
        setAllBets({ ...allBets, [currentBet]: makeEmptyBets(amountOfBets) });
        setAllBetAmounts({
            ...allBetAmounts,
            [currentBet]: makeEmptyBetAmounts(amountOfBets),
        });
    }, [
        setAllBets,
        allBets,
        currentBet,
        setAllBetAmounts,
        allBetAmounts,
        amountOfBets,
    ]);

    return useMemo(
        () => (
            <Button width="100%" size="xs" onClick={clearBets}>
                Clear
            </Button>
        ),
        [clearBets]
    );
});

export default ClearBetsButton;
