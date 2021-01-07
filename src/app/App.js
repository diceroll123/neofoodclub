import React, {useEffect, useCallback} from "react"
import RoundContext from "./RoundState"
import HomePage from "./HomePage";
import {getTableMode, createBetURL, parseBetUrl, reducer} from "./util"
import useRoundData from "./useRoundData";
import firebase from "firebase/app";
import "firebase/database";

const config = {
    apiKey: "AIzaSyA1AJzRRbOTh7iVZi4DfK9lBuSJnfTTbr4",
    authDomain: "neofoodclub.firebaseapp.com",
    databaseURL: "https://neofoodclub-default-rtdb.firebaseio.com",
    projectId: "neofoodclub",
    storageBucket: "neofoodclub.appspot.com",
    messagingSenderId: "1085231429788",
    appId: "1:1085231429788:web:6a5ce4dbe8a5021e64d559",
    measurementId: "G-TPEBSBBBTR"
};

if (!firebase.apps.length) {
    firebase.initializeApp(config);
}

function App() {
    const initialState = parseBetUrl();

    const [roundState, setRoundState] = React.useReducer(reducer, {
        roundData: null,
        currentRound: null,
        currentSelectedRound: initialState.round,
        bets: initialState.bets,
        betAmounts: initialState.betAmounts,
        customOdds: null,
        customProbs: null,
        tableMode: getTableMode(),
        advanced: {
            bigBrain: true,
            faDetails: false,
            customOddsMode: false,
            oddsTimeline: false
        },
    });

    useRoundStateURLs(roundState, setRoundState);

    const [currentRound, roundData] = useRoundData(firebase, roundState.currentSelectedRound);

    // If we don't have a selected round yet, initialize it to the current round ID, once it loads in.
    useEffect(() => {
        if (roundState.currentSelectedRound === null) {
            setRoundState({currentSelectedRound: currentRound});
        }
    }, [roundState.currentSelectedRound, currentRound]);

    console.log(roundState);

    // When new round data comes in, reset the round-specific state.
    useEffect(() => {
        setRoundState({
            // TODO(matchu): We should probably also reset bets and betAmounts here,
            //               but I don't know the default values!
            customOdds: null,
            customProbs: null,
        });
    }, [roundData?.round]);

    const mergedRoundState = {
        ...roundState,
        currentRound,
        // If we have custom odds/probs for this round, use them. Otherwise, use the default values.
        customOdds: roundState.customOdds || roundData?.currentOdds || null,
        customProbs: roundState.customProbs ||
            [[1, 0, 0, 0, 0], [1, 0, 0, 0, 0], [1, 0, 0, 0, 0], [1, 0, 0, 0, 0], [1, 0, 0, 0, 0]],
        roundData,
    };

    return (
        <RoundContext.Provider value={{roundState: mergedRoundState, setRoundState}}>
            <HomePage/>
        </RoundContext.Provider>
    );
}

function useRoundStateURLs(roundState, setRoundState) {
    useEffect(() => {
        if (roundState.currentSelectedRound === null) {
            return;
        }

        window.history.replaceState(null, "", createBetURL(roundState));
    }, [roundState]);

    const onHashChange = useCallback(() => {
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
    }, [roundState.currentRound, roundState.currentSelectedRound, roundState.roundData, setRoundState]);

    useEffect(() => {
        window.addEventListener("hashchange", onHashChange);
        return () => window.removeEventListener("hashchange", onHashChange);
    }, [onHashChange]);
}

export default App;
