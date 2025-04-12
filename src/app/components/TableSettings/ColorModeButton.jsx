import { useColorMode } from "@chakra-ui/react";
import { FaMoon, FaSun, FaDesktop } from "react-icons/fa6";
import React, { useEffect } from "react";
import Cookies from "universal-cookie";
import SectionPanel from "../SectionPanel";
import OptionButtons from "../OptionButtons";

const ColorModeButton = () => {
  const { setColorMode } = useColorMode();
  const cookies = new Cookies();

  // Get preferred mode (returns 'light', 'dark', or 'system')
  const getPreferredMode = () => {
    const stored = cookies.get("colorMode");
    return stored || options[options.length - 1].value; // use the last one, whether it's system or dark
  };

  const preferredMode = getPreferredMode();

  // Handle system preference changes
  useEffect(() => {
    const handleSystemChange = (e) => {
      if (preferredMode === "system") {
        setColorMode(e.matches ? "dark" : "light");
      }
    };

    if (preferredMode === "system") {
      const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)");
      setColorMode(isDarkMode.matches ? "dark" : "light");

      // Listen for system preference changes
      isDarkMode.addEventListener("change", handleSystemChange);
      return () => isDarkMode.removeEventListener("change", handleSystemChange);
    }
  }, [preferredMode, setColorMode]);

  const handleChange = (newMode) => {
    cookies.set("colorMode", newMode);

    if (newMode === "system") {
      const isDarkMode = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      setColorMode(isDarkMode ? "dark" : "light");
    } else {
      setColorMode(newMode);
    }
  };

  const options = [
    { value: "light", label: "Light", icon: FaSun, color: "yellow.300" },
    { value: "dark", label: "Dark", icon: FaMoon, color: "gray.400" },
    // { value: "system", label: "System", icon: FaDesktop, color: "blue.500" },  // TODO:  investigate lag
  ];

  return (
    <SectionPanel title="Appearance">
      <OptionButtons
        options={options}
        currentValue={preferredMode}
        onChange={handleChange}
      />
    </SectionPanel>
  );
};

export default ColorModeButton;
