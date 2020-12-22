import React, {useEffect} from "react"
import RoundContext from "./RoundState"
import {useToast} from "@chakra-ui/react";
import 'moment-timezone';
import TheTable from "./TheTable";
import {makeBetUrl} from "./util";
import Header from "./Header";
import Footer from "./Footer";

export default function HomePage() {
    const {roundState, setRoundState} = React.useContext(RoundContext);
    const toast = useToast();

    function getCurrentRoundNumber(resolve, reject) {
        if (roundState.currentRound === null) {
            // first pass-through sets the round, then bails out
            // which starts useEffect again a second time, with a round number
            fetch("https://neofoodclub.s3.amazonaws.com/next_round.txt", {cache: "no-cache"})
                .then(response => response.text())
                .then(data => {
                    let currentRound = parseInt(data);
                    if (isNaN(currentRound) === false) {
                        setRoundState({
                            currentRound: currentRound,
                            currentSelectedRound: roundState.currentSelectedRound || currentRound
                        })
                    } else {
                        throw Error('Cannot grab current round data');
                    }
                })
                .catch(() => {
                    toast.closeAll();
                    toast({
                        title: `Current round data not found.`,
                        description: "We don't seem to know what round it currently is. 🤔",
                        status: "error",
                        duration: 3000,
                        isClosable: true
                    })
                })
                .then(reject)
        } else {
            resolve();
        }
    }

    function getRoundData(forceUpdate) {
        if (roundState.currentSelectedRound === null) {
            // this should never happen
            return;
        }

        // update if there's no data
        if (roundState.roundData === null || forceUpdate) {
            fetch(`https://neofoodclub.s3.amazonaws.com/rounds/${roundState.currentSelectedRound}.json`, {
                cache: "no-cache"
            })
                .then(response => response.json())
                .then(roundData => {
                    let currentRound = roundState.currentRound;
                    // if winning pirates were just added, increase the in-memory current round
                    if (currentRound === roundState.currentSelectedRound && roundData.winners[0] > 0) {
                        currentRound += 1;
                    }
                    setRoundState({roundData, currentRound});
                })
                .catch(() => {
                    toast.closeAll();
                    toast({
                        title: `Round ${roundState.currentSelectedRound} not found.`,
                        description: "We don't seem to have data for this round. 🤔",
                        status: "error",
                        duration: 3000,
                        isClosable: true
                    });
                });
        } else {

        }
    }

    useEffect(() => {
        // TODO: Debounce round number input
        new Promise((resolve, reject) => {
            getCurrentRoundNumber(resolve, reject);
        }).then(() => {
            getRoundData(false);
        }).catch(() => {
            // blah
        }).then(() => {
            // changing round/bets will keep the url updated
            if (roundState.currentSelectedRound === null) {
                return;
            }

            let url = window.location.pathname + "#";
            url += "round=" + roundState.currentSelectedRound;

            // check if the bet is empty before putting it in the url
            let addBets = false;
            for (const [, value] of Object.entries(roundState.bets)) {
                if (addBets === false) {
                    addBets = value.some(x => x > 0);
                }
            }

            if (addBets) {
                url += '&b=' + makeBetUrl(roundState.bets);
            }

            // TODO: Decide if the bet amounts in the url is even desired
            // TODO: add roundState.betAmounts to deps array below if so
            // check if the bet amount is valid before putting it in the url
            // let addBetAmounts = false;
            // for (const [, value] of Object.entries(roundState.betAmounts)) {
            //     if (addBetAmounts === false) {
            //         addBetAmounts = value >= 50;
            //     }
            // }
            //
            // if(addBetAmounts) {
            //     url += '&a=' + makeBetAmountsUrl(roundState.betAmounts);
            // }

            window.history.replaceState(null, "", url);
        });
    }, [
        roundState.currentSelectedRound,
        roundState.currentRound,
        roundState.roundData,
        roundState.bets,
        roundState.betAmounts
    ]);

    return (
        <>
            <Header/>

            <TheTable p={4} pt="6.5rem"/>

            <Footer mb="3rem"/>
        </>
    )
}
