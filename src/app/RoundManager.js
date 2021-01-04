import React, {useEffect} from "react";
import RoundContext from "./RoundState";
import {useToast} from "@chakra-ui/react";
import {cloneArray, createBetURL, parseBetUrl} from "./util";
import HashChange from "react-hashchange";

export const RoundManager = (props) => {
    const {firebase} = props;
    const {roundState, setRoundState} = React.useContext(RoundContext);
    const toast = useToast();

    function errorToast(title, description) {
        toast.closeAll();
        toast({
            title: title,
            description: description,
            status: "error",
            duration: 3000,
            isClosable: true
        })
    }

    useEffect(() => {
        if (roundState.currentRound === null) {
            firebase.database().ref().child("current_round").once('value', (snapshot) => {
                const currentRound = snapshot.val();
                const currentSelectedRound = roundState.currentSelectedRound || currentRound;
                setRoundState({currentRound, currentSelectedRound});
            });
            return;
        }

        const ref = firebase.database().ref().child(`rounds/${roundState.currentSelectedRound}`);

        const onValueChange = (snapshot) => {
            let newRoundData = snapshot.val();
            if (newRoundData) {
                let currentRound = roundState.currentRound;
                // if winning pirates were just added, increase the in-memory current round
                if (currentRound === roundState.currentSelectedRound && newRoundData.winners[0] > 0) {
                    currentRound += 1;
                }

                if (roundState.roundData) {
                    newRoundData = {...roundState.roundData, ...newRoundData};
                }

                // give it custom odds + probabilities properties to optionally edit later
                if (newRoundData.customOdds === undefined) {
                    newRoundData["customOdds"] = cloneArray(newRoundData.currentOdds);
                }
                if (newRoundData.customProbs === undefined) {
                    newRoundData["customProbs"] = [[1, 0, 0, 0, 0], [1, 0, 0, 0, 0], [1, 0, 0, 0, 0], [1, 0, 0, 0, 0], [1, 0, 0, 0, 0]];
                }

                setRoundState({roundData: newRoundData, currentRound});
            } else {
                errorToast(
                    `Round ${roundState.currentSelectedRound} not found.`,
                    "We don't seem to have data for this round. 🤔"
                );
            }
        };

        ref.on('value', onValueChange);

        window.history.replaceState(null, "", createBetURL(roundState));

        return () => ref.off("value", onValueChange);
    }, [
        roundState.currentSelectedRound,
        roundState.currentRound,
        roundState.bets,
        roundState.betAmounts
    ]);

    return (
        <HashChange onChange={() => {
            const data = parseBetUrl();
            if (isNaN(parseInt(data.round))) {
                data.round = roundState.currentRound;
            }
            setRoundState({
                currentSelectedRound: data.round,
                bets: data.bets,
                betAmounts: data.betAmounts,
                roundData: data.round === roundState.currentSelectedRound ? roundState.roundData : null
            });
        }}/>
    );
}
