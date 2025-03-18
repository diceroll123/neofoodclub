import { Flex } from "@chakra-ui/react";
import React, { memo } from "react";

// this element is the gray box that contains other elements, for example the "copy markdown code" button

const SettingsBox = memo((props) => {
    const { background, children, ...rest } = props;
    return (
        <Flex
            align="center"
            justify="space-between"
            backgroundColor={background}
            {...rest}
        >
            {children}
        </Flex>
    );
});

export default SettingsBox;
