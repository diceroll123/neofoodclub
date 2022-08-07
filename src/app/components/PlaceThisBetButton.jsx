import { Button } from "@chakra-ui/react";
import React, { useEffect, useContext, useState } from "react";
import { ExternalLinkIcon } from "@chakra-ui/icons";

import { RoundContext } from "../RoundState";

// this element is the "Place Bet" button inside the PayoutTable

const BetButton = (props) => {
    const { children, ...rest } = props;
    return <Button size="sm" w="100%" {...rest}>{children}</Button>
}

const ErrorBetButton = (props) => {
    const { children, ...rest } = props;

    return (
        <BetButton colorScheme={"red"} isDisabled {...rest}>
            {children}
        </BetButton>
    );
}

const PlaceThisBetButton = (props) => {
    const { bet, betNum } = props;
    const { roundState, calculations } = useContext(RoundContext);   
    const { betBinaries, betOdds, betPayoffs, winningBetBinary } = calculations;
    const [clicked, setClicked] = useState(false);

    useEffect(() => {
        setClicked(false);
    }, [roundState.bets]);

    if (
        winningBetBinary > 0 ||
        roundState.currentSelectedRound < roundState.currentRound
    ) {
        return (
            <ErrorBetButton>
                Round is over!
            </ErrorBetButton>
        );
    }

    if (roundState.betAmounts[betNum] < 50) {
        return (
            <ErrorBetButton>
                Invalid bet amount!
            </ErrorBetButton>
        );
    }

    if (
        Object.values(betBinaries).filter((b) => b === betBinaries[betNum])
            .length > 1
    ) {
        return (
            <ErrorBetButton>
                Duplicate bet!
            </ErrorBetButton>
        );
    }

    function generate_bet_link(bet, betNum) {
        let urlString =
            "https://www.neopets.com/pirates/process_foodclub.phtml?";
        const pirates = roundState.roundData.pirates;
        for (let i = 0; i < 5; i++) {
            if (bet[i] !== 0) {
                urlString += `winner${i + 1}=${pirates[i][bet[i] - 1]}&`;
            }
        }
        for (let i = 0; i < 5; i++) {
            if (bet[i] !== 0) {
                urlString += `matches[]=${i + 1}&`;
            }
        }
        urlString += `bet_amount=${roundState.betAmounts[betNum]}&`;
        urlString += `total_odds=${betOdds[betNum]}&`;
        urlString += `winnings=${betPayoffs[betNum]}&`;
        urlString += "type=bet";
        return window.open(urlString);
    }

    return (
        <BetButton
            rightIcon={<ExternalLinkIcon />}
            onClick={() => {
                generate_bet_link(bet, betNum);
                setClicked(true);
            }}
            colorScheme={clicked ? undefined : "green"}
        >
            {clicked ? "Bet placed!" : "Place bet!"}
        </BetButton>
    );
};

export default PlaceThisBetButton;
