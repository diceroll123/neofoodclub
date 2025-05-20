import { useColorMode } from "@chakra-ui/react";
import { FaMoon, FaSun } from "react-icons/fa6";
import React from "react";
import SectionPanel from "../SectionPanel";
import OptionButtons from "../OptionButtons";

const ColorModeButton = () => {
  const { colorMode, setColorMode } = useColorMode();

  const options = [
    { value: "light", label: "Light", icon: FaSun, color: "yellow.300" },
    { value: "dark", label: "Dark", icon: FaMoon, color: "gray.400" },
    // { value: "system", label: "System", icon: FaDesktop, color: "blue.500" },
  ];

  return (
    <SectionPanel title="Appearance">
      <OptionButtons
        options={options}
        currentValue={colorMode}
        onChange={setColorMode}
      />
    </SectionPanel>
  );
};

export default ColorModeButton;
