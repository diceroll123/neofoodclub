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
    }, [roundState.betAmounts]);

    return (
        <NumberInput
            {...rest}
            value={tempMaxBet.toString()}
            onChange={(value) => setTempMaxBet(value)}
            onBlur={(e) => {
                let value = parseInt(e.target.value);
                if (value === tempMaxBet) {
                    // don't save over it if it's the same
                    return;
                }

                if (isNaN(value) || value < 50) {
                    value = -1000;
                }

                setTempMaxBet(value);

                let betAmounts = { ...roundState.betAmounts };
                betAmounts[betIndex + 1] = value;
                setRoundState({ betAmounts });
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
