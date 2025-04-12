import Cookies from "universal-cookie";
import React, { useContext } from "react";
import { RoundContext } from "../../RoundState";
import SectionPanel from "../SectionPanel";
import SettingsRow from "./SettingsRow";
import { FaVial } from "react-icons/fa6";

const LogitModelToggle = () => {
  const { roundState, setRoundState } = useContext(RoundContext);
  const cookies = new Cookies();

  const handleToggle = () => {
    cookies.set("useLogitModel", !roundState.advanced.useLogitModel);
    setRoundState({
      advanced: {
        ...roundState.advanced,
        useLogitModel: !roundState.advanced.useLogitModel,
      },
    });
  };

  return (
    <SectionPanel title="Probability Model">
      <SettingsRow
        icon={FaVial}
        label="Experimental Model"
        isChecked={roundState.advanced.useLogitModel}
        onChange={handleToggle}
        tooltipText="The experimental model uses multinomial logit to predict the probabilities and should yield better TER, especially for smaller max bets."
        colorScheme="green"
        iconProps={{
          color: "green.500",
        }}
      />
    </SectionPanel>
  );
};

export default LogitModelToggle;
