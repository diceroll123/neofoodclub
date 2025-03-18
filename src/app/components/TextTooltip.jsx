import { Tooltip } from "@chakra-ui/react";
import React from "react";

// this element is a custom chakra tooltip that simply has an easier way to pass in the text/label

const TextTooltip = (props) => {
    const { text, label, ...rest } = props;
    return (
        <Tooltip label={label || text} aria-label={label || text} {...rest}>
            {text}
        </Tooltip>
    );
};

export default TextTooltip;
