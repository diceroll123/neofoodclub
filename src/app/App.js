import React from "react"
import RoundContext from "./RoundState"
import HomePage from "./HomePage";
import {useReducer} from "react";

function reducer(state, item) {
    return {...state, ...item}
}

function App() {
    const [roundState, setRoundState] = useReducer(reducer, {
        roundData: null,
        currentRound: null,
        currentSelectedRound: null
    });
    return (
        <RoundContext.Provider value={{roundState, setRoundState}}>
            <HomePage/>
        </RoundContext.Provider>
    );
}

export default App;
