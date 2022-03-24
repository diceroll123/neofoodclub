import {
    Tooltip,
    useColorModeValue,
} from "@chakra-ui/react";
import { anyBetsDuplicate } from "../util";
import { RoundContext } from "../RoundState";
import React, { useContext } from "react";


const DuplicateBetTooltip = (props) => {
    const { children, ...rest } = props;
    const { calculations } = useContext(RoundContext);
    const { betBinaries } = calculations;

    const hasDuplicates = anyBetsDuplicate(betBinaries);

    return (
        <Tooltip
            label="You have duplicate bets!"
            bg={useColorModeValue("red.300", "nfc.redDark")}
            isDisabled={!hasDuplicates}
            {...rest}
        >
            {children}
        </Tooltip>)
}

export default DuplicateBetTooltip;
