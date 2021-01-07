import React, {useState} from "react";
import {
    NumberDecrementStepper,
    NumberIncrementStepper,
    NumberInput,
    NumberInputField,
    NumberInputStepper
} from "@chakra-ui/react";
import produce from "immer";
import RoundContext from "./RoundState";

export default function CustomProbsInput(props) {
    const {roundState, setRoundState} = React.useContext(RoundContext);
    const {arenaIndex, pirateIndex, probabilities, ...rest} = props;
    const [prob, setProb] = useState(probabilities.used[arenaIndex][pirateIndex] * 100);

    // we multiply by 100 to make it visibly a percentage

    function changeProbs(probValue) {
        setProb(probValue);

        const customProbs = produce(roundState.customProbs, draftCustomProbs => {
            draftCustomProbs[arenaIndex][pirateIndex] = probValue / 100;
        });
        setRoundState({customProbs});
    }

    return (
        <NumberInput
            {...rest}
            value={prob}
            onChange={(value) => {
                const cleanValue = parseFloat(value);

                if (isNaN(cleanValue) || value.charAt(value.length - 1) === ".") {
                    setProb(value);
                } else {
                    changeProbs(cleanValue);
                }
            }}
            onBlur={(e) => {
                if (e.target.value === "") {
                    changeProbs(probabilities.used[arenaIndex][pirateIndex] * 100);
                }
            }}
            onFocus={(e) => e.target.select()}
            size="sm"
            allowMouseWheel
            width="100px">
            <NumberInputField/>
            <NumberInputStepper width="16px">
                <NumberIncrementStepper/>
                <NumberDecrementStepper/>
            </NumberInputStepper>
        </NumberInput>
    )
}
