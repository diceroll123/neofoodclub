import React from "react"
import RoundContext from "./RoundState"
import HomePage from "./HomePage";
import {useReducer} from "react";
import {parseBetUrl, reducer} from "./util"



function App() {
    const initialState = parseBetUrl();

    const [roundState, setRoundState] = useReducer(reducer, {
        roundData: null,
        currentRound: null,
        currentSelectedRound: initialState.round,
        bet: initialState.bet,
        betAmount: initialState.betAmount,
    });

    return (
        <RoundContext.Provider value={{roundState, setRoundState}}>
            <HomePage/>
        </RoundContext.Provider>
    );
}

export default App;
