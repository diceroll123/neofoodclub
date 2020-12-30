import {useContext, useState} from "react";
import RoundContext from "./RoundState";
import {
    NumberDecrementStepper,
    NumberIncrementStepper,
    NumberInput,
    NumberInputField,
    NumberInputStepper
} from "@chakra-ui/react";

export default function RoundInput() {
    const {roundState, setRoundState} = useContext(RoundContext);

    const [timeoutId, setTimeoutId] = useState(null);
    const [roundNumber, setRoundNumber] = useState(roundState.currentSelectedRound || 0);

    function changeCurrentSelectedRound(value) {
        value = parseInt(value);
        if (value > 0) {
            setRoundState({
                currentSelectedRound: value,
                roundData: null
            });
        }
    }

    return (
        <NumberInput
            size="sm"
            isDisabled={roundNumber === 0}
            value={roundNumber}
            min={1}
            max={roundState.currentRound}
            allowMouseWheel
            width="80px"
            onChange={(value) => {
                setRoundNumber(value);

                // debounce number input to 300ms
                if (timeoutId && typeof timeoutId === "number") {
                    clearTimeout(timeoutId);
                }

                setTimeoutId(
                    setTimeout(() => {
                        setTimeoutId(null);
                        changeCurrentSelectedRound(value);
                    }, 300)
                );
            }}>
            <NumberInputField/>
            <NumberInputStepper>
                <NumberIncrementStepper/>
                <NumberDecrementStepper/>
            </NumberInputStepper>
        </NumberInput>
    )
}
