import React from "react"
import RoundContext from "./RoundState"
import HomePage from "./HomePage";
import {parseBetUrl, reducer} from "./util"


function App() {
    const initialState = parseBetUrl();

    const [roundState, setRoundState] = React.useReducer(reducer, {
        roundData: null,
        currentRound: null,
        currentSelectedRound: initialState.round,
        bets: initialState.bets,
        betAmounts: initialState.betAmounts,
    });

    return (
        <RoundContext.Provider value={{roundState, setRoundState}}>
            <HomePage/>
        </RoundContext.Provider>
    );
}

export default App;
