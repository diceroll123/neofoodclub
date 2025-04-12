import { FaGlobe } from "react-icons/fa6";
import Cookies from "universal-cookie";
import React, { useContext, useState } from "react";
import { getUseWebDomain } from "../../util";
import { RoundContext } from "../../RoundState";
import SectionPanel from "../SectionPanel";
import SettingsRow from "./SettingsRow";

const CopyWithDomain = () => {
  const { setRoundState } = useContext(RoundContext);
  const cookies = new Cookies();
  const [useWebDomain, toggleUseWebDomain] = useState(getUseWebDomain());

  const handleToggle = () => {
    let checked = !useWebDomain;
    toggleUseWebDomain(checked);
    cookies.set("useWebDomain", checked);
    setRoundState({ useWebDomain: checked });
  };

  return (
    <SectionPanel title="Copy Settings">
      <SettingsRow
        icon={FaGlobe}
        label="Copy domain with bets"
        isChecked={useWebDomain}
        onChange={handleToggle}
        colorScheme="blue"
        tooltipText={`Include domain when copying bets\n(${window.location.origin}/)`}
        iconProps={{
          color: "blue.300",
        }}
      />
    </SectionPanel>
  );
};

export default CopyWithDomain;
