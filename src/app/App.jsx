import "firebase/database";

import React, { useEffect, useCallback, useReducer, useContext } from "react";
import firebase from "firebase/app";

import { getTableMode, createBetURL, parseBetUrl, reducer } from "./util";
import HomePage from "./HomePage";
import { RoundContext } from "./RoundState";
import useRoundData from "./useRoundData";

const config = {
    apiKey: "AIzaSyA1AJzRRbOTh7iVZi4DfK9lBuSJnfTTbr4",
    authDomain: "neofoodclub.firebaseapp.com",
    databaseURL: "https://neofoodclub-default-rtdb.firebaseio.com",
    projectId: "neofoodclub",
    storageBucket: "neofoodclub.appspot.com",
    messagingSenderId: "1085231429788",
    appId: "1:1085231429788:web:6a5ce4dbe8a5021e64d559",
    measurementId: "G-TPEBSBBBTR",
};

if (!firebase.apps.length) {
    firebase.initializeApp(config);
}

function App() {
    const { roundState, setRoundState } = useContext(RoundContext);

    useRoundStateURLs(roundState, setRoundState);

    const [currentRound, roundData] = useRoundData(
        firebase,
        roundState.currentSelectedRound
    );

    // If we don't have a selected round yet, initialize it to the current round ID, once it loads in.
    useEffect(() => {
        let data = { currentRound: parseInt(currentRound) };
        if (roundState.currentSelectedRound === null && currentRound) {
            data = { ...data, currentSelectedRound: parseInt(currentRound) };
        }

        setRoundState(data);
    }, [roundState.currentSelectedRound, currentRound]);

    useEffect(() => {
        if (currentRound && roundData) {
            setRoundState({
                roundData: roundData,
                customOdds: roundState.customOdds || roundData?.currentOdds,
                customProbs: roundState.customProbs || [
                    [1, 0, 0, 0, 0],
                    [1, 0, 0, 0, 0],
                    [1, 0, 0, 0, 0],
                    [1, 0, 0, 0, 0],
                    [1, 0, 0, 0, 0],
                ],
            });
        }
    }, [roundData]);

    return <HomePage />;
}

function useRoundStateURLs(roundState, setRoundState) {
    useEffect(() => {
        if (roundState.currentSelectedRound === null) {
            return;
        }

        window.history.replaceState(null, "", createBetURL(roundState, false));
    }, [roundState]);

    const onHashChange = useCallback(() => {
        const data = parseBetUrl();
        if (isNaN(parseInt(data.round))) {
            data.round = roundState.currentRound.toString();
        }
        setRoundState({
            currentSelectedRound: data.round,
            bets: data.bets,
            betAmounts: data.betAmounts,
            viewMode: false,
            roundData:
                parseInt(data.round) ===
                parseInt(roundState.currentSelectedRound)
                    ? roundState.roundData
                    : null,
        });
    }, [
        roundState.currentRound,
        roundState.currentSelectedRound,
        roundState.roundData,
        setRoundState,
    ]);

    useEffect(() => {
        window.addEventListener("hashchange", onHashChange);
        return () => window.removeEventListener("hashchange", onHashChange);
    }, [onHashChange]);
}

export default App;
