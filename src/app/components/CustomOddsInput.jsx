import {
    NumberDecrementStepper,
    NumberIncrementStepper,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
} from "@chakra-ui/react";
import { useState, useContext } from "react";
import produce from "immer";

import RoundContext from "../RoundState";

// this element is the number input for custom odds

export default function CustomOddsInput(props) {
    const { roundState, setRoundState } = useContext(RoundContext);
    const { arenaIndex, pirateIndex, ...rest } = props;
    const [odds, setOdds] = useState(
        roundState.customOdds[arenaIndex][pirateIndex]
    );

    function changeOdds(oddsValue) {
        setOdds(oddsValue);

        const customOdds = produce(roundState.customOdds, (draftCustomOdds) => {
            draftCustomOdds[arenaIndex][pirateIndex] = oddsValue;
        });
        setRoundState({ customOdds });
    }

    return (
        <NumberInput
            {...rest}
            value={odds}
            onChange={(value) => {
                value = parseInt(value);
                let revert = false;
                if (isNaN(value)) {
                    revert = true;
                }

                if (!revert && !(value >= 2 && value <= 13)) {
                    revert = true;
                }

                if (revert) {
                    changeOdds(
                        roundState.roundData.currentOdds[arenaIndex][
                            pirateIndex
                        ]
                    );
                    return;
                }

                changeOdds(value);
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
