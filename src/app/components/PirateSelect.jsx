
import { Select } from "@chakra-ui/react";
import React, { useContext } from "react";

import { PIRATE_NAMES } from "../constants";
import { RoundContext } from "../RoundState";

const PirateSelect = (props) => {
    let { arenaId, pirateValue, getPirateBgColor, ...rest } = props;
    const { roundState } = useContext(RoundContext);

    let pirates = roundState.roundData.pirates[arenaId];
    let openingOdds = roundState.roundData.openingOdds[arenaId];

    let pirateBg = "transparent";

    let currentOpeningOdds = openingOdds[pirateValue];
    if (currentOpeningOdds > 1) {
        pirateBg = getPirateBgColor(currentOpeningOdds);
    }

    return (
        <Select
            size="sm"
            height="1.5rem"
            backgroundColor={pirateBg}
            value={pirateValue}
            {...rest}>
            <option value="0" />
            {pirates.map(
                (pirateId, pirateIndex) => {
                    // some browsers support colored backgrounds for <option> elements, so we use that here!
                    let bgColor = getPirateBgColor(openingOdds[pirateIndex + 1]);
                    return (
                        <option
                            key={pirateId}
                            style={{ background: bgColor }}
                            value={pirateIndex + 1}>
                            {PIRATE_NAMES[pirateId]}
                        </option>
                    );
                }
            )}
        </Select>
    )
}

export default PirateSelect;