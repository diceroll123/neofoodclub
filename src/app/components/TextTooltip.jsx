import { Tooltip } from "@chakra-ui/react";
import React, { memo } from "react";

// this element is a custom chakra tooltip that simply has an easier way to pass in the text/label

const TextTooltip = memo((props) => {
    const { text, label, ...rest } = props;
    return (
        <Tooltip label={label || text} aria-label={label || text} {...rest}>
            {text}
        </Tooltip>
    );
});

export default TextTooltip;
