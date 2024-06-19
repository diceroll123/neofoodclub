import {
    NumberDecrementStepper,
    NumberIncrementStepper,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
} from "@chakra-ui/react";
import React, { useEffect, useState, useContext } from "react";

import { RoundContext } from "../RoundState";

// this is the number input element next to bets

export default function BetAmountInput(props) {
    const { roundState, setRoundState } = useContext(RoundContext);
    const { betIndex, ...rest } = props;

    const [tempMaxBet, setTempMaxBet] = useState(
        roundState.betAmounts[betIndex + 1]
    );

    useEffect(() => {
        setTempMaxBet(roundState.betAmounts[betIndex + 1]);
    }, [betIndex, roundState.betAmounts]);

    useEffect(() => {

        let value = parseInt(tempMaxBet);

        const timeoutId = setTimeout(() => {
            let betAmounts = { ...roundState.betAmounts };
            betAmounts[betIndex + 1] = value;
            setRoundState({ betAmounts });
        }, 200);

        return () => {
            clearTimeout(timeoutId);
        };

    }, [tempMaxBet]);

    return (
        <NumberInput
            {...rest}
            value={tempMaxBet.toString()}
            onChange={(value) => setTempMaxBet(value)}
            onBlur={(e) => {
                let value = parseInt(e.target.value);
                if (isNaN(value) || value < 50) {
                    value = -1000;
                }

                value = Math.min(value, 500000);

                setTempMaxBet(value);
            }}
            onFocus={(e) => e.target.select()}
            size="sm"
            min={-1000}
            max={500000}
            allowMouseWheel
            width="90px"
        >
            <NumberInputField />
            <NumberInputStepper width="16px">
                <NumberIncrementStepper />
                <NumberDecrementStepper />
            </NumberInputStepper>
        </NumberInput>
    );
}
