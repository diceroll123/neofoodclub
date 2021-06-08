import { createContext, useReducer } from "react";
import {
	getTableMode,
	reducer,
	parseBetUrl,
	makeEmptyBets,
	makeEmptyBetAmounts,
} from "./util";

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
		},
		viewMode: initialViewMode,
	});

	return (
		<Provider value={{ roundState: roundState, setRoundState }}>
			{children}
		</Provider>
	);
};

export { RoundContext, StateProvider };
