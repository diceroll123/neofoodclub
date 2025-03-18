import { Td as OriginalTd } from "@chakra-ui/react";
import React from "react";

// this element is a chakra <Td> but with less y-padding, to make our tables a little less large

const Td = React.memo(function Td({ children, style, ...otherProps }) {
    return (
        <OriginalTd py={1} style={style} {...otherProps}>
            {children}
        </OriginalTd>
    );
});

export default Td;
