import { Select } from "@chakra-ui/react";
import React, { useContext } from "react";

import { PIRATE_NAMES, ARENA_NAMES } from "../constants";
import { RoundContext } from "../RoundState";

const PirateSelect = (props) => {
    let {
        arenaId,
        pirateValue,
        getPirateBgColor,
        showArenaName = false,
        ...rest
    } = props;

    // showArenaName will fill the arena name into the select option as a placeholder if set to true
    // only used this way for the bet builder tool.

    const { roundState } = useContext(RoundContext);

    let pirates = roundState.roundData.pirates[arenaId];
    let openingOdds = roundState.roundData.openingOdds[arenaId];

    let pirateBg = "transparent";

    let currentOpeningOdds = openingOdds[pirateValue];
    if (currentOpeningOdds > 1) {
        pirateBg = getPirateBgColor(currentOpeningOdds);
    }

    let useArenaName = showArenaName && pirateValue === 0;

    return (
        <Select
            size="sm"
            height="1.5rem"
            backgroundColor={pirateBg}
            value={pirateValue}
            {...rest}
        >
            <option disabled={useArenaName} hidden={useArenaName} value="0">
                {useArenaName ? ARENA_NAMES[arenaId] : ""}
            </option>
            <option hidden={!useArenaName} value="0"></option>
            {pirates.map((pirateId, pirateIndex) => {
                // some browsers support colored backgrounds for <option> elements, so we use that here!
                let bgColor = getPirateBgColor(openingOdds[pirateIndex + 1]);
                return (
                    <option
                        key={pirateId}
                        style={{ background: bgColor }}
                        value={pirateIndex + 1}
                    >
                        {PIRATE_NAMES[pirateId]}
                    </option>
                );
            })}
        </Select>
    );
};

export default PirateSelect;
