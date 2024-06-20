import {
    InputGroup,
    InputLeftAddon,
    NumberDecrementStepper,
    NumberIncrementStepper,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
} from "@chakra-ui/react";
import React, { useContext, useEffect, useState } from "react";

import { RoundContext } from "../RoundState";

// this element is the number input to say which round's data you're viewing

const RoundInput = () => {
    const { roundState, setRoundState } = useContext(RoundContext);

    const [roundNumber, setRoundNumber] = useState(
        roundState.currentSelectedRound || 0
    );
    const [hasFocus, setHasFocus] = useState(false);

    useEffect(() => {

        if (roundNumber === "") {
            return;
        }

        const timeoutId = setTimeout(() => {
            if (roundNumber === roundState.currentSelectedRound) {
                return;
            }

            let value = roundNumber;
            if (roundNumber < 1) {
                value = roundState.currentRound;
            }

            setRoundState({
                currentSelectedRound: value,
                roundData: null,
                customOdds: null,
                customProbs: null,
            });
        }, 400);

        return () => {
            clearTimeout(timeoutId);
        };

    }, [roundNumber, roundState.currentSelectedRound, roundState.currentRound, setRoundState]);

    useEffect(() => {
        setRoundNumber(roundState.currentSelectedRound || 0);
    }, [roundState.currentSelectedRound]);

    return (
        <InputGroup size="xs">
            <InputLeftAddon children="Round" />
            <NumberInput
                value={roundNumber}
                min={1}
                allowMouseWheel
                onFocus={(e) => {
                    setHasFocus(true);
                    e.target.select();
                }}
                onChange={(value) => {
                    value = parseInt(value);
                    if (isNaN(value)) {
                        setRoundNumber("");
                        return;
                    }

                    setRoundNumber(value);
                }}
                onBlur={(e) => {
                    setHasFocus(false);
                    if (e.target.value === "") {
                        setRoundNumber(roundState.currentRound);
                    }
                }}
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
};

export default RoundInput;
