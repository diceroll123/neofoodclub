import {
    NumberDecrementStepper,
    NumberIncrementStepper,
    NumberInput,
    NumberInputField,
    NumberInputStepper
} from "@chakra-ui/react";
import React from "react";

export default function BetAmountInput(props) {
    const {...rest} = props;
    return (
        <NumberInput
            {...rest}
            onFocus={(e) => e.target.select()}
            size="sm"
            min={-1000}
            max={500000}
            allowMouseWheel
            width="80px">
            <NumberInputField/>
            <NumberInputStepper width="16px">
                <NumberIncrementStepper/>
                <NumberDecrementStepper/>
            </NumberInputStepper>
        </NumberInput>
    )
}
