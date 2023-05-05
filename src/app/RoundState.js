import { createContext, useReducer, useState, useEffect } from "react";
import { getTableMode, reducer, parseBetUrl, calculateRoundData } from "./util";

const RoundContext = createContext(null);
const { Provider } = RoundContext;

const initialState = parseBetUrl();

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
			logitModel: false,
		},
		viewMode: initialViewMode,
	});

	const [calculations, setCalculations] = useState(
		calculateRoundData(roundState)
	);

	useEffect(() => {
		setCalculations(calculateRoundData(roundState));
	}, [
		roundState.roundData?.foods,
		roundState.roundData?.winners,
		roundState.roundData?.currentOdds,
		roundState.bets,
		roundState.betAmounts,
		roundState.customProbs,
		roundState.customOdds,
	]);

	return (
		<Provider value={{ roundState, setRoundState, calculations }}>
			{children}
		</Provider>
	);
};

export { RoundContext, StateProvider };
