import { createContext, useReducer, useState, useEffect } from "react";
import { getTableMode, reducer, parseBetUrl, calculateRoundData, getUseWebDomain, getUseLogitModel } from "./util";

const RoundContext = createContext(null);
const { Provider } = RoundContext;

const initialState = parseBetUrl(window.location.hash.slice(1));

const initialViewMode =
	Object.values(initialState.bets).filter((x) => x.some((val) => val > 0))
		.length > 0;

const StateProvider = ({ children }) => {
	const [roundState, setRoundState] = useReducer(reducer, {
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
			oddsTimeline: false,
			useLogitModel: getUseLogitModel(),
		},
		viewMode: initialViewMode,
		useWebDomain: getUseWebDomain(),
	});

	const [calculations, setCalculations] = useState(
		calculateRoundData(roundState)
	);

	useEffect(() => {
		setCalculations(calculateRoundData(roundState));
	}, [roundState]);

	return (
		<Provider value={{ roundState, setRoundState, calculations }}>
			{children}
		</Provider>
	);
};

export { RoundContext, StateProvider };
