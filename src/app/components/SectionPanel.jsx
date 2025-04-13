import { useColorModeValue, Box, Heading } from "@chakra-ui/react";
import React from "react";

const SectionPanel = (props) => {
  const { children, title, ...rest } = props;
  const defaultBgColor = useColorModeValue("white", "gray.800");
  return (
    <Box
      p={4}
      borderWidth="1px"
      borderRadius="md"
      backgroundColor={defaultBgColor}
      width="100%"
      py={3}
      {...rest}
    >
      <Heading size="xs" mb={3} textTransform="uppercase">
        {title}
      </Heading>

      {children}
    </Box>
  );
};

export default SectionPanel;
