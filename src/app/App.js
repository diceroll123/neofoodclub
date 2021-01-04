import React from "react"
import RoundContext from "./RoundState"
import HomePage from "./HomePage";
import {getTableMode, parseBetUrl, reducer} from "./util"
import {RoundManager} from "./RoundManager";
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

firebase.initializeApp(config);

function App() {
    const initialState = parseBetUrl();

    const [roundState, setRoundState] = React.useReducer(reducer, {
        roundData: null,
        currentRound: null,
        currentSelectedRound: initialState.round,
        bets: initialState.bets,
        betAmounts: initialState.betAmounts,
        tableMode: getTableMode(),
        advanced: {
            bigBrain: true,
            faDetails: false,
            customOddsMode: false,
            oddsTimeline: false
        },
    });

    return (
        <RoundContext.Provider value={{roundState, setRoundState}}>
            <HomePage/>
            <RoundManager firebase={firebase}/>
        </RoundContext.Provider>
    );
}

export default App;
