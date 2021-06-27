import {
    NumberDecrementStepper,
    NumberIncrementStepper,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
} from "@chakra-ui/react";
import { useState, useContext } from "react";
import produce from "immer";

import { RoundContext } from "../RoundState";
import { getOdds } from "../util";

// this element is the number input for custom odds

export default function CustomOddsInput(props) {
    const { roundState, setRoundState } = useContext(RoundContext);
    const { arenaIndex, pirateIndex, ...rest } = props;

    const original = getOdds(roundState);

    const [odds, setOdds] = useState(
        original[arenaIndex][pirateIndex]
    );

    function changeOdds(oddsValue) {
        setOdds(oddsValue);

        const customOdds = produce(roundState.customOdds || roundState.roundData.currentOdds, (draftCustomOdds) => {
            draftCustomOdds[arenaIndex][pirateIndex] = oddsValue;
        });
        setRoundState({ customOdds });
    }

    function verify(value) {
        // returns false if it needs to be reverted, true if the value is clean
        // the rules are simple.
        // it needs to be a valid number between 2 and 13 inclusive.
        value = parseInt(value);
        if (isNaN(value)) {
            return false;
        }
        return value >= 2 && value <= 13;
    }

    return (
        <NumberInput
            {...rest}
            value={odds}
            onChange={(value) => {
                setOdds(value);

                if (verify(value)) {
                    changeOdds(value);
                }
            }}
            onBlur={(e) => {
                let value = e.target.value;

                if (verify(value) === false) {
                    changeOdds(
                        roundState.roundData.currentOdds[arenaIndex][
                            pirateIndex
                        ]
                    );
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
