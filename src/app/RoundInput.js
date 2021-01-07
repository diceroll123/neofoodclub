import {useContext, useEffect, useState} from "react";
import RoundContext from "./RoundState";
import {
    NumberDecrementStepper,
    NumberIncrementStepper,
    NumberInput,
    NumberInputField,
    NumberInputStepper
} from "@chakra-ui/react";
import {makeEmptyBetAmounts, makeEmptyBets} from "./util";

export default function RoundInput() {
    const {roundState, setRoundState} = useContext(RoundContext);

    const [timeoutId, setTimeoutId] = useState(null);
    const [roundNumber, setRoundNumber] = useState(roundState.currentSelectedRound || 0);

    function changeCurrentSelectedRound(value) {
        if (value > 0) {
            const amountOfBets = Object.keys(roundState.bets).length;
            setRoundState({
                currentSelectedRound: value,
                roundData: null,
                bets: makeEmptyBets(amountOfBets),
                betAmounts: makeEmptyBetAmounts(amountOfBets),
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
        <NumberInput
            size="sm"
            isDisabled={roundNumber === 0}
            value={roundNumber}
            min={1}
            max={roundState.currentRound}
            allowMouseWheel
            width="80px"
            onFocus={(e) => e.target.select()}
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
                if (e.target.value === "") {
                    setRoundNumber(roundState.currentRound);
                    changeCurrentSelectedRound(roundState.currentRound);
                }
            }}>
            <NumberInputField/>
            <NumberInputStepper>
                <NumberIncrementStepper/>
                <NumberDecrementStepper/>
            </NumberInputStepper>
        </NumberInput>
    )
}
