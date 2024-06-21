import { Box } from "@chakra-ui/react";
import React from "react";

// this is an imaginary box that makes things inside it side-scrollable

const HorizontalScrollingBox = (props) => {
  const { children, ...rest } = props;

  // Prevent position:absolute elements from escaping. Without this, elements
  // scrolled out of view will become absolutely-positioned relative to the
  // *page*, and extend the entire page's scroll area to fit them. This includes
  // normal hidden elements, like in Chakra's <Radio />!
  return (
    <Box overflowX="auto" position="relative" {...rest}>
      {children}
    </Box>
  );
};

export default HorizontalScrollingBox;
