import { useColorMode } from "@chakra-ui/react";
import { FaMoon, FaSun, FaDesktop } from "react-icons/fa6";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import Cookies from "universal-cookie";
import SectionPanel from "../SectionPanel";
import OptionButtons from "../OptionButtons";

const ColorModeButton = () => {
  const { colorMode, setColorMode } = useColorMode();
  const cookies = useMemo(() => new Cookies(), []);

  // Check for system dark/light preference
  const getSystemPreference = useCallback(() => {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }, []);

  const [selectedMode, setSelectedMode] = useState(() => {
    // Initialize from cookie on mount
    const stored = cookies.get("colorMode");
    return stored || "system";
  });

  const options = [
    { value: "light", label: "Light", icon: FaSun, color: "yellow.300" },
    { value: "dark", label: "Dark", icon: FaMoon, color: "gray.400" },
    { value: "system", label: "System", icon: FaDesktop, color: "blue.500" },
  ];

  // Apply color mode on initial load and when selectedMode changes
  useEffect(() => {
    if (selectedMode === "system") {
      setColorMode(getSystemPreference());
    } else {
      setColorMode(selectedMode);
    }
  }, [selectedMode, getSystemPreference, setColorMode]);

  // Set up listener for system color scheme changes
  useEffect(() => {
    const handleSystemChange = (e) => {
      if (cookies.get("colorMode") === "system") {
        setColorMode(e.matches ? "dark" : "light");
      }
    };

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", handleSystemChange);

    return () => mediaQuery.removeEventListener("change", handleSystemChange);
  }, [cookies, setColorMode]);

  const handleChange = (newMode) => {
    setSelectedMode(newMode);
    cookies.set("colorMode", newMode);

    if (newMode === "system") {
      setColorMode(getSystemPreference());
    } else {
      setColorMode(newMode);
    }
  };

  return (
    <SectionPanel title="Appearance">
      <OptionButtons
        options={options}
        currentValue={selectedMode}
        onChange={handleChange}
      />
    </SectionPanel>
  );
};

export default ColorModeButton;
