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

    const [timeoutId, setTimeoutId] = useState(null);
    const [roundNumber, setRoundNumber] = useState(
        roundState.currentSelectedRound || 0
    );
    const [hasFocus, setHasFocus] = useState(false);

    function changeCurrentSelectedRound(value) {
        if (value === roundState.currentSelectedRound) {
            return;
        }

        if (value > 0) {
            setRoundState({
                currentSelectedRound: value,
                roundData: null,
                customOdds: null,
                customProbs: null,
            });
        }
    }

    useEffect(() => {
        const currentSelected = roundState.currentSelectedRound;
        if (currentSelected !== null && currentSelected !== roundNumber) {
            setRoundNumber(currentSelected);
        }
    }, [roundState.currentSelectedRound]);

    return (
        <InputGroup size="xs">
            <InputLeftAddon children="Round" />
            <NumberInput
                isDisabled={roundNumber === 0}
                value={roundNumber}
                min={1}
                max={roundState.currentRound}
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

                    // debounce number input to 300ms
                    if (timeoutId && typeof timeoutId === "number") {
                        clearTimeout(timeoutId);
                    }

                    setTimeoutId(
                        setTimeout(() => {
                            setTimeoutId(null);
                            changeCurrentSelectedRound(value);
                        }, 400)
                    );
                }}
                onBlur={(e) => {
                    setHasFocus(false);
                    if (e.target.value === "") {
                        setRoundNumber(roundState.currentRound);
                        changeCurrentSelectedRound(roundState.currentRound);
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
