import React from "react"
import RoundContext from "./RoundState"
import HomePage from "./HomePage";
import {getTableMode, parseBetUrl, reducer} from "./util"
import {RoundManager} from "./RoundManager";


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
            oddsTimeline: false
        },
    });

    return (
        <RoundContext.Provider value={{roundState, setRoundState}}>
            <HomePage/>
            <RoundManager/>
        </RoundContext.Provider>
    );
}

export default App;
