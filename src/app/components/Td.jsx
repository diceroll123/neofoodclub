import { Td as OriginalTd } from "@chakra-ui/react";
import React from "react";

// this element is a chakra <Td> but with less y-padding, to make our tables a little less large

const Td = (props) => (
	<OriginalTd py={1} {...props}>
		{props.children}
	</OriginalTd>
);

export default Td;
