import { Box } from "@chakra-ui/react";
import React, { useContext, memo } from "react";

import { RoundContext } from "../RoundState";

// elements inside this component will only show if the big-brain setting is on

const BigBrainElement = memo(function BigBrainElement(props) {
    const { roundState } = useContext(RoundContext);
    const { children, ...rest } = props;

    if (roundState.advanced.bigBrain === false) {
        return null;
    }

    return <Box {...rest}>{children}</Box>;
});

export default BigBrainElement;
