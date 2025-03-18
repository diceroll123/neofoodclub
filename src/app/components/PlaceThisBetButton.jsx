import { Button } from "@chakra-ui/react";
import React, { useEffect, useContext, useState, memo } from "react";
import { ExternalLinkIcon } from "@chakra-ui/icons";

import { RoundContext } from "../RoundState";

// this element is the "Place Bet" button inside the PayoutTable

const BetButton = (props) => {
    const { children, ...rest } = props;
    return (
        <Button size="sm" w="100%" {...rest}>
            {children}
        </Button>
    );
};

const ErrorBetButton = React.memo((props) => {
    const { children, ...rest } = props;

    return (
        <BetButton colorScheme={"red"} isDisabled {...rest}>
            {children}
        </BetButton>
    );
});

const PlaceThisBetButton = memo((props) => {
    const { bet, betNum } = props;
    const { roundState, calculations, currentBet, allBetAmounts, allBets } =
        useContext(RoundContext);
    const { betBinaries, betOdds, betPayoffs, winningBetBinary } = calculations;
    const [clicked, setClicked] = useState(false);

    useEffect(() => {
        setClicked(false);
    }, [allBets, allBetAmounts]);

    if (
        winningBetBinary > 0 ||
        roundState.currentSelectedRound < roundState.currentRound
    ) {
        return <ErrorBetButton>Round is over!</ErrorBetButton>;
    }

    if (allBetAmounts[currentBet][betNum] < 50) {
        return <ErrorBetButton>Invalid bet amount!</ErrorBetButton>;
    }

    if (
        Object.values(betBinaries).filter((b) => b === betBinaries[betNum])
            .length > 1
    ) {
        return <ErrorBetButton>Duplicate bet!</ErrorBetButton>;
    }

    const generate_bet_link = (bet, betNum) => {
        let urlString =
            "https://www.neopets.com/pirates/process_foodclub.phtml?";
        const { pirates } = roundState.roundData;
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
        urlString += `bet_amount=${allBetAmounts[currentBet][betNum]}&`;
        urlString += `total_odds=${betOdds[betNum]}&`;
        urlString += `winnings=${betPayoffs[betNum]}&`;
        urlString += "type=bet";

        // Detect if we're on a desktop environment
        const isDesktop = navigator.userAgentData
            ? navigator.userAgentData.mobile === false
            : !/Mobi|Android/i.test(navigator.userAgent);

        if (isDesktop) {
            // Use metaKey for MacOS, ctrlKey for Windows/Linux
            const isMac = navigator.userAgentData
                ? navigator.userAgentData.platform === "macOS"
                : /Mac/i.test(navigator.userAgent);

            const e = new MouseEvent("click", {
                ctrlKey: !isMac, // ctrlKey for Windows/Linux
                metaKey: isMac, // metaKey for MacOS
            });

            const a = document.createElement("a");
            a.href = urlString;
            a.target = "_blank";
            a.dispatchEvent(e);
        } else {
            // For mobile devices, fallback to window.open
            window.open(urlString, "_blank");
        }
    };

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
});

export default PlaceThisBetButton;
