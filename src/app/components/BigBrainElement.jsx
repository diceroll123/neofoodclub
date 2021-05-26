import { useContext } from "react";
import RoundContext from "../RoundState";
import { Box } from "@chakra-ui/react";

// elements inside this component will only show if the big-brain setting is on

const BigBrainElement = (props) => {
    const { roundState } = useContext(RoundContext);
    const { children, ...rest } = props;

    if (roundState.advanced.bigBrain === false) {
        return null;
    }

    return <Box {...rest}>{children}</Box>;
};

export default BigBrainElement;
