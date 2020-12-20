import React from "react";
import RoundContext from "./RoundState";
import {
    NumberDecrementStepper,
    NumberIncrementStepper,
    NumberInput,
    NumberInputField,
    NumberInputStepper
} from "@chakra-ui/react";

export default function RoundInput() {
    const {roundState, setRoundState} = React.useContext(RoundContext);

    return (
        <NumberInput isDisabled={roundState.currentSelectedRound === null}
                     value={roundState.currentSelectedRound || 1}
                     min={1}
                     max={roundState.currentRound}
                     allowMouseWheel
                     width="90px"
                     onChange={(value) => setRoundState({
                         currentSelectedRound: parseInt(value),
                         roundData: null
                     })}>
            <NumberInputField/>
            <NumberInputStepper>
                <NumberIncrementStepper/>
                <NumberDecrementStepper/>
            </NumberInputStepper>
        </NumberInput>
    )
}
