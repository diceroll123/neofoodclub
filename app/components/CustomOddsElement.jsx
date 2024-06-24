import { Box } from "@chakra-ui/react";
import React, { useContext } from "react";

import { RoundContext } from "../RoundState";

// elements inside of this element will only show when custom mode is on

const CustomOddsElement = (props) => {
  const { roundState } = useContext(RoundContext);
  const { children, ...rest } = props;

  if (roundState.advanced.bigBrain === false) {
    return null;
  }

  if (roundState.advanced.customOddsMode === false) {
    return null;
  }

  if (roundState.roundData === null) {
    return null;
  }

  return <Box {...rest}>{children}</Box>;
};

export default CustomOddsElement;
