import React, { useContext, useState, useEffect } from "react";
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

  // we multiply by 100 to make it visibly a percentage

  const verify = (value) => {
    return !isNaN(parseFloat(value));
  };

  useEffect(() => {
    if (!verify(prob)) {
      return;
    }

    if (prob === used[arenaIndex][pirateIndex] * 100) {
      return;
    }

    const timeoutId = setTimeout(() => {
      const customProbs = produce(used, (draftCustomProbs) => {
        draftCustomProbs[arenaIndex][pirateIndex] = prob / 100;
      });
      setRoundState({ customProbs });
    }, 400);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [prob, arenaIndex, pirateIndex, used, setRoundState]);

  return (
    <NumberInput
      {...rest}
      value={prob}
      onChange={(value) => {
        setProb(value);
      }}
      onBlur={(e) => {
        if (e.target.value === "") {
          setProb(used[arenaIndex][pirateIndex] * 100);
        }
      }}
      onFocus={(e) => e.target.select()}
      size="sm"
      allowMouseWheel
      width="100px"
    >
      <NumberInputField />
      <NumberInputStepper width="16px">
        <NumberIncrementStepper />
        <NumberDecrementStepper />
      </NumberInputStepper>
    </NumberInput>
  );
}
