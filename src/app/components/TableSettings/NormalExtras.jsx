import { Collapse, VStack } from "@chakra-ui/react";
import React, { useContext, useState } from "react";
import {
  getTableMode,
  getBigBrainMode,
  getFaDetailsMode,
  getCustomOddsMode,
  getOddsTimelineMode,
} from "../../util";
import SectionPanel from "../SectionPanel";
import { RoundContext } from "../../RoundState";
import SettingsRow from "./SettingsRow";
import { FaSliders, FaBrain, FaTimeline, FaCookieBite } from "react-icons/fa6";
import Cookies from "universal-cookie";

const NormalExtras = (props) => {
  const { roundState, setRoundState } = useContext(RoundContext);

  const [bigBrain, setBigBrain] = useState(getBigBrainMode());
  const [faDetails, setFaDetails] = useState(getFaDetailsMode());
  const [customOddsMode, setCustomOddsMode] = useState(getCustomOddsMode());
  const [oddsTimeline, setOddsTimeline] = useState(getOddsTimelineMode());

  const usingNormal = getTableMode() === "normal";

  const toggleBigBrain = () => {
    const newValue = !bigBrain;
    setBigBrain(newValue);

    // Save to cookie
    const cookies = new Cookies();
    cookies.set("bigBrainMode", newValue);

    let currentAdvanced = roundState.advanced;
    setRoundState({
      advanced: {
        ...currentAdvanced,
        bigBrain: newValue,
      },
      customOdds: null,
      customProbs: null,
    });
  };

  const toggleCustomOddsMode = () => {
    const checked = !customOddsMode;
    setCustomOddsMode(checked);

    sessionStorage.setItem("customOddsMode", JSON.stringify(checked));

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

    sessionStorage.setItem("faDetailsMode", JSON.stringify(checked));

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

    sessionStorage.setItem("oddsTimelineMode", JSON.stringify(checked));

    setRoundState({
      advanced: {
        ...roundState.advanced,
        oddsTimeline: checked,
      },
    });
  };

  return (
    <Collapse in={usingNormal}>
      <SectionPanel title="Advanced (Table Mode)" {...props}>
        <VStack align="stretch" spacing={3} width="100%">
          <SettingsRow
            icon={FaBrain}
            label="Big Brain Mode"
            isChecked={bigBrain}
            onChange={toggleBigBrain}
            isDisabled={!usingNormal}
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
              !(roundState.roundData?.foods && bigBrain) || !usingNormal
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
              !(roundState.roundData?.foods && bigBrain) || !usingNormal
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
            isDisabled={!(bigBrain && roundState.roundData) || !usingNormal}
            colorScheme="blue"
            iconProps={{
              color: "blue.300",
            }}
          />
        </VStack>
      </SectionPanel>
    </Collapse>
  );
};

export default NormalExtras;
