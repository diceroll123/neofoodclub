import React, { useEffect, useCallback, useContext, useMemo } from "react";

import { makeBetURL, parseBetUrl } from "./util";
import HomePage from "./HomePage";
import { RoundContext } from "./RoundState";
import useRoundData from "./useRoundData";

function App() {
  const { roundState, setRoundState } = useContext(RoundContext);

  useRoundStateURLs();

  const [currentRound, roundData] = useRoundData(
    roundState.currentSelectedRound
  );

  useEffect(() => {
    setRoundState({
      currentRound: currentRound,
      roundData: roundData,
    });
  }, [currentRound, setRoundState, roundData]);

  return <HomePage />;
}

function useRoundStateURLs() {
  const {
    roundState,
    setRoundState,
    currentBet,
    allBetAmounts,
    allBets,
    setAllBetAmounts,
    setAllBets,
  } = useContext(RoundContext);

  const url = useMemo(() => {
    if (roundState.currentSelectedRound === null) {
      return "";
    }
    return makeBetURL(
      roundState.currentSelectedRound,
      allBets[currentBet],
      allBetAmounts[currentBet],
      true
    );
  }, [roundState.currentSelectedRound, allBets, allBetAmounts, currentBet]);

  useEffect(() => {
    if (url) {
      window.history.replaceState(null, "", url);
    }
  }, [url]);

  const onHashChange = useCallback(() => {
    const data = parseBetUrl(window.location.hash.slice(1));
    if (isNaN(parseInt(data.round))) {
      data.round = roundState.currentRound.toString();
    }

    const isSameRound =
      parseInt(data.round) === parseInt(roundState.currentSelectedRound);

    setRoundState({
      currentSelectedRound: data.round,
      customOdds: isSameRound ? roundState.customOdds : null,
      customProbs: isSameRound ? roundState.customProbs : null,
      viewMode: false,
      roundData: isSameRound ? roundState.roundData : null,
    });

    if (data.bets !== allBets[currentBet]) {
      setAllBets((prevBets) => ({ ...prevBets, [currentBet]: data.bets }));
    }
    if (data.betAmounts !== allBetAmounts[currentBet]) {
      setAllBetAmounts((prevAmounts) => ({
        ...prevAmounts,
        [currentBet]: data.betAmounts,
      }));
    }
  }, [
    roundState,
    setRoundState,
    allBets,
    allBetAmounts,
    setAllBets,
    setAllBetAmounts,
    currentBet,
  ]);

  useEffect(() => {
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [onHashChange]);
}

export default App;
