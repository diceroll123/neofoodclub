import { VStack } from "@chakra-ui/react";
import React, { useContext, useState } from "react";
import { getTableMode } from "../../util";
import SectionPanel from "../SectionPanel";
import { RoundContext } from "../../RoundState";
import SettingsRow from "./SettingsRow";
import { FaSliders, FaBrain, FaTimeline, FaCookieBite } from "react-icons/fa6";

const NormalExtras = (props) => {
  const { roundState, setRoundState } = useContext(RoundContext);

  const [bigBrain, setBigBrain] = useState(true);
  const [faDetails, setFaDetails] = useState(false);
  const [customOddsMode, setCustomOddsMode] = useState(false);
  const [oddsTimeline, setOddsTimeline] = useState(false);

  const notUsingNormal = getTableMode() !== "normal";

  const toggleBigBrain = () => {
    setBigBrain((v) => !v);
    let currentAdvanced = roundState.advanced;
    setRoundState({
      advanced: {
        ...currentAdvanced,
        bigBrain: !bigBrain,
      },
      customOdds: null,
      customProbs: null,
    });
  };

  const toggleCustomOddsMode = () => {
    const checked = !customOddsMode;
    setCustomOddsMode(checked);
    setRoundState({
      advanced: {
        ...roundState.advanced,
        customOddsMode: checked,
      },
      customOdds: null,
      customProbs: null,
    });
  };

  const toggleFaDetails = () => {
    const checked = !faDetails;
    setFaDetails(checked);
    setRoundState({
      advanced: {
        ...roundState.advanced,
        faDetails: checked,
      },
    });
  };

  const toggleOddsTimeline = () => {
    const checked = !oddsTimeline;
    setOddsTimeline(checked);
    setRoundState({
      advanced: {
        ...roundState.advanced,
        oddsTimeline: checked,
      },
    });
  };

  return (
    <SectionPanel title="Advanced (Table Mode)" {...props}>
      <VStack align="stretch" spacing={3} width="100%">
        <SettingsRow
          icon={FaBrain}
          label="Big Brain Mode"
          isChecked={bigBrain}
          onChange={toggleBigBrain}
          isDisabled={notUsingNormal}
          colorScheme="pink"
          iconProps={{
            color: "pink.300",
          }}
        />

        <SettingsRow
          icon={FaTimeline}
          label="Odds Timeline"
          isChecked={oddsTimeline}
          onChange={toggleOddsTimeline}
          isDisabled={
            !(roundState.roundData?.foods && bigBrain) || notUsingNormal
          }
          colorScheme="purple"
          iconProps={{
            color: "purple.300",
          }}
        />

        <SettingsRow
          icon={FaCookieBite}
          label="FA Details"
          isChecked={faDetails}
          onChange={toggleFaDetails}
          isDisabled={
            !(roundState.roundData?.foods && bigBrain) || notUsingNormal
          }
          colorScheme="orange"
          iconProps={{
            color: "orange",
          }}
        />

        <SettingsRow
          icon={FaSliders}
          label="Custom probs/odds"
          isChecked={customOddsMode}
          onChange={toggleCustomOddsMode}
          isDisabled={!(bigBrain && roundState.roundData) || notUsingNormal}
          colorScheme="blue"
          iconProps={{
            color: "blue.300",
          }}
        />
      </VStack>
    </SectionPanel>
  );
};

export default NormalExtras;
