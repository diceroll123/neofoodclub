import { useEffect, useContext, useState } from "react";
import { Button } from "@chakra-ui/react";
import RoundContext from "../RoundState";

// this element is the "Place Bet" button inside the PayoutTable

const PlaceThisBetButton = (props) => {
    const { betOdds, betPayoffs, bet, betNum, betBinaries, winningBetBinary } =
        props;
    const { roundState } = useContext(RoundContext);
    const [clicked, setClicked] = useState(false);

    useEffect(() => {
        setClicked(false);
    }, [roundState.bets]);

    if (
        winningBetBinary > 0 ||
        roundState.currentSelectedRound < roundState.currentRound
    ) {
        return (
            <Button size="xs" isDisabled>
                Round is over!
            </Button>
        );
    }

    if (roundState.betAmounts[betNum] < 50) {
        return (
            <Button size="xs" isDisabled>
                Invalid bet amount!
            </Button>
        );
    }

    if (
        Object.values(betBinaries).filter((b) => b === betBinaries[betNum])
            .length > 1
    ) {
        return (
            <Button size="xs" isDisabled>
                Duplicate bet!
            </Button>
        );
    }

    function generate_bet_link(bet, betNum) {
        let urlString =
            "http://www.neopets.com/pirates/process_foodclub.phtml?";
        for (let i = 0; i < 5; i++) {
            if (bet[i] !== 0) {
                urlString += `winner${i + 1}=${
                    roundState.roundData.pirates[i][bet[i] - 1]
                }&`;
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
        <Button
            size="sm"
            onClick={() => {
                generate_bet_link(bet, betNum);
                setClicked(true);
            }}
        >
            {clicked ? "Bet placed!" : "Place this bet!"}
        </Button>
    );
};

export default PlaceThisBetButton;
