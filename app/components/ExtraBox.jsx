import { useColorModeValue, Box } from "@chakra-ui/react";
import React from "react";

// this element is the darker box inside settingsbox, for example the container of the normal/dropdown mode radio buttons

const ExtraBox = (props) => {
  const { children, ...rest } = props;
  const defaultBgColor = useColorModeValue("white", "gray.800");
  return (
    <Box
      p={2}
      borderWidth="1px"
      borderRadius="md"
      backgroundColor={defaultBgColor}
      {...rest}
    >
      {children}
    </Box>
  );
};

export default ExtraBox;
