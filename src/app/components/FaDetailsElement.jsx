import { Box } from "@chakra-ui/react";
import React, { useContext, memo } from "react";

import { RoundContext } from "../RoundState";

// this element will only show children (which are only expected to be food data in the normal table) if they exist and the FA checkbox is checked

const FaDetailsElement = memo(function FaDetailselement(props) {
    const { roundState } = useContext(RoundContext);
    const { children, ...rest } = props;

    if (roundState.advanced.bigBrain === false) {
        return null;
    }

    if (roundState.advanced.faDetails === false) {
        return null;
    }

    if (
        roundState.roundData === null ||
        roundState.roundData.foods === undefined
    ) {
        return null;
    }

    return (
        <Box maxWidth="55px" {...rest}>
            {children}
        </Box>
    );
});

export default FaDetailsElement;
