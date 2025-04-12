import { createContext, useReducer, useState, useEffect } from "react";
import {
  getTableMode,
  reducer,
  parseBetUrl,
  calculateRoundData,
  getUseWebDomain,
  getUseLogitModel,
  anyBetsExist,
  cloneArray,
  getBigBrainMode,
  getFaDetailsMode,
  getCustomOddsMode,
  getOddsTimelineMode,
} from "./util";
import DropZone from "./DropZone";

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
    customOdds: null,
    customProbs: null,
    tableMode: getTableMode(),
    advanced: {
      bigBrain: getBigBrainMode(),
      faDetails: getFaDetailsMode(),
      customOddsMode: getCustomOddsMode(),
      oddsTimeline: getOddsTimelineMode(),
      useLogitModel: getUseLogitModel(),
    },
    viewMode: initialViewMode,
    useWebDomain: getUseWebDomain(),
  });

  const [currentBet, setCurrentBet] = useState("0");
  const [allNames, setAllNames] = useState({ 0: "Starting Set" });
  const [allBets, setAllBets] = useState({ 0: { ...initialState.bets } });
  const [allBetAmounts, setAllBetAmounts] = useState({
    0: { ...initialState.betAmounts },
  });

  const [calculations, setCalculations] = useState(
    calculateRoundData(
      roundState,
      allBets[currentBet],
      allBetAmounts[currentBet]
    )
  );

  useEffect(() => {
    let bets = allBets[currentBet];
    let betAmounts = allBetAmounts[currentBet];

    setCalculations(calculateRoundData(roundState, bets, betAmounts));
  }, [roundState, currentBet, allBets, allBetAmounts]);

  const addNewSet = (name, bets, betAmounts, maybe_replace = false) => {
    // will modify the current set if the current set is empty and maybe_replace is explicitly set to true

    const newIndex =
      maybe_replace && !anyBetsExist(allBets[currentBet])
        ? currentBet
        : (parseInt(Object.keys(allBets).slice(-1)[0]) + 1).toString();

    const clonedBets = cloneArray(bets);
    const clonedBetAmounts = cloneArray(betAmounts);

    setAllNames({ ...allNames, [newIndex]: name });
    setAllBets({ ...allBets, [newIndex]: clonedBets });
    setAllBetAmounts({ ...allBetAmounts, [newIndex]: clonedBetAmounts });
    setCurrentBet(newIndex);
  };

  return (
    <Provider
      value={{
        roundState,
        setRoundState,
        calculations,
        addNewSet,
        currentBet,
        setCurrentBet,
        allNames,
        setAllNames,
        allBets,
        setAllBets,
        allBetAmounts,
        setAllBetAmounts,
      }}
    >
      <DropZone>{children}</DropZone>
    </Provider>
  );
};

export { RoundContext, StateProvider };
