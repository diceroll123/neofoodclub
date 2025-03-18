import React, {
    useContext,
    useState,
    useEffect,
    useCallback,
    useMemo,
    useRef,
} from "react";
import {
    NumberDecrementStepper,
    NumberIncrementStepper,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
} from "@chakra-ui/react";
import { produce } from "immer";

import { RoundContext } from "../RoundState";

// this element is the number input for custom probabilities

export default function CustomProbsInput(props) {
    const { setRoundState } = useContext(RoundContext);
    const { arenaIndex, pirateIndex, used, ...rest } = props;
    const [prob, setProb] = useState(used[arenaIndex][pirateIndex] * 100);
    const timeoutRef = useRef(null);
    const usedValue = used[arenaIndex][pirateIndex];

    // we multiply by 100 to make it visibly a percentage

    const verify = useCallback((value) => {
        return !isNaN(parseFloat(value));
    }, []);

    const handleChange = useCallback((value) => {
        setProb(value);
    }, []);

    const handleBlur = useCallback(
        (e) => {
            if (e.target.value === "") {
                setProb(usedValue * 100);
            }
        },
        [usedValue]
    );

    const handleFocus = useCallback((e) => {
        e.target.select();
    }, []);

    useEffect(() => {
        if (!verify(prob)) {
            return;
        }

        if (prob === usedValue * 100) {
            return;
        }

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            const customProbs = produce(used, (draftCustomProbs) => {
                draftCustomProbs[arenaIndex][pirateIndex] = prob / 100;
            });
            setRoundState({ customProbs });
        }, 400);

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [prob, arenaIndex, pirateIndex, usedValue, used, setRoundState, verify]);

    const memoizedNumberInputField = useMemo(() => <NumberInputField />, []);
    const memoizedNumberIncrementStepper = useMemo(
        () => <NumberIncrementStepper />,
        []
    );

    return (
        <NumberInput
            {...rest}
            value={prob}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            size="sm"
            allowMouseWheel
            width="100px"
        >
            {memoizedNumberInputField}
            <NumberInputStepper width="16px">
                {memoizedNumberIncrementStepper}
                <NumberDecrementStepper />
            </NumberInputStepper>
        </NumberInput>
    );
}
