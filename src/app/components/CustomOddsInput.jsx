import React, { useState, useContext, useEffect } from "react";
import {
    NumberDecrementStepper,
    NumberIncrementStepper,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
} from "@chakra-ui/react";
import { produce } from "immer";

import { RoundContext } from "../RoundState";
import { getOdds } from "../util";

// this element is the number input for custom odds

export default function CustomOddsInput(props) {
    const { roundState, setRoundState } = useContext(RoundContext);
    const { arenaIndex, pirateIndex, ...rest } = props;

    const original = getOdds(roundState);

    const [odds, setOdds] = useState(original[arenaIndex][pirateIndex]);

    useEffect(() => {
        if (!verify(odds)) {
            return;
        }

        const timeoutId = setTimeout(() => {
            if (odds === original[arenaIndex][pirateIndex]) {
                return;
            }

            const customOdds = produce(
                roundState.customOdds || roundState.roundData.currentOdds,
                (draftCustomOdds) => {
                    draftCustomOdds[arenaIndex][pirateIndex] = odds;
                }
            );
            setRoundState({ customOdds });
        }, 400);

        return () => {
            clearTimeout(timeoutId);
        };
    }, [
        odds,
        arenaIndex,
        pirateIndex,
        original,
        roundState.customOdds,
        setRoundState,
        roundState.roundData.currentOdds,
    ]);

    const verify = (value) => {
        // returns false if it needs to be reverted, true if the value is clean
        // the rules are simple.
        // it needs to be a valid number between 2 and 13 inclusive.
        value = parseInt(value);
        if (isNaN(value)) {
            return false;
        }
        return value >= 2 && value <= 13;
    };

    return (
        <NumberInput
            {...rest}
            value={odds}
            onChange={(value) => {
                setOdds(value);
            }}
            onBlur={(e) => {
                if (!verify(e.target.value)) {
                    setOdds(original[arenaIndex][pirateIndex]);
                }
            }}
            onFocus={(e) => e.target.select()}
            size="sm"
            min={2}
            max={13}
            allowMouseWheel
            width="80px"
        >
            <NumberInputField />
            <NumberInputStepper width="16px">
                <NumberIncrementStepper />
                <NumberDecrementStepper />
            </NumberInputStepper>
        </NumberInput>
    );
}
