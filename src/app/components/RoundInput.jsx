import {
    InputGroup,
    InputLeftAddon,
    NumberDecrementStepper,
    NumberIncrementStepper,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
} from "@chakra-ui/react";
import React, {
    useContext,
    useEffect,
    useState,
    memo,
    useCallback,
    useMemo,
} from "react";

import { RoundContext } from "../RoundState";

// this element is the number input to say which round's data you're viewing

const RoundInput = memo(() => {
    const { roundState, setRoundState } = useContext(RoundContext);
    const { currentSelectedRound, currentRound } = roundState;

    const [roundNumber, setRoundNumber] = useState(currentSelectedRound || 0);
    const [hasFocus, setHasFocus] = useState(false);

    const handleChange = useCallback((value) => {
        value = parseInt(value);
        if (isNaN(value)) {
            setRoundNumber("");
            return;
        }

        setRoundNumber(value);
    }, []);

    const handleFocus = useCallback((e) => {
        setHasFocus(true);
        e.target.select();
    }, []);

    const handleBlur = useCallback(
        (e) => {
            setHasFocus(false);
            if (e.target.value === "") {
                setRoundNumber(currentRound);
            }
        },
        [currentRound]
    );

    useEffect(() => {
        if (roundNumber === "") {
            return;
        }

        const timeoutId = setTimeout(() => {
            let value = roundNumber;
            if (roundNumber < 1) {
                value = currentRound;
            }

            const isSameRound =
                parseInt(value) === parseInt(currentSelectedRound);

            if (isSameRound) {
                return;
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
    }, [roundNumber, currentSelectedRound, currentRound, setRoundState]);

    useEffect(() => {
        setRoundNumber(currentSelectedRound || 0);
    }, [currentSelectedRound]);

    const inputGroup = useMemo(
        () => (
            <InputGroup size="xs">
                <InputLeftAddon children="Round" />
                <NumberInput
                    value={roundNumber}
                    min={1}
                    allowMouseWheel
                    onFocus={handleFocus}
                    onChange={handleChange}
                    onBlur={handleBlur}
                >
                    <NumberInputField />
                    <NumberInputStepper
                        style={{ display: hasFocus ? "block" : "none" }}
                    >
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                    </NumberInputStepper>
                </NumberInput>
            </InputGroup>
        ),
        [roundNumber, hasFocus, handleFocus, handleChange, handleBlur]
    );

    return inputGroup;
});

export default RoundInput;
