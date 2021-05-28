import { Flex } from "@chakra-ui/react";
import React from "react";

// this element is the gray box that contains other elements, for example the "copy markdown code" button

const SettingsBox = (props) => {
    const { background, children, ...rest } = props;
    return (
        <Flex
            align="center"
            justify="space-between"
            mx={4}
            mb={4}
            backgroundColor={background}
            borderWidth="1px"
            {...rest}
        >
            {children}
        </Flex>
    );
};

export default SettingsBox;
