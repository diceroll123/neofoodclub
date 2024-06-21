import { useState, useEffect } from "react";
import { useToast } from "@chakra-ui/react";
import {
  getDatabase,
  ref,
  get,
  child,
  goOffline,
  goOnline,
  off,
  onValue,
} from "firebase/database";

export default function useRoundData(firebase, currentSelectedRound) {
  const toast = useToast();

  const [currentRound, setCurrentRound] = useState(null);
  const [roundData, setRoundData] = useState(null);

  // When the page first loads, if there's no round selected yet, get the current round number
  // from Firebase.
  useEffect(() => {
    get(child(ref(getDatabase(firebase)), "current_round")).then((snapshot) => {
      const newCurrentRound = snapshot.val();
      setCurrentRound(parseInt(newCurrentRound));
    });
  }, [firebase]);

  // Once a round is selected, we should subscribe to its data!
  useEffect(() => {
    if (!currentSelectedRound || !currentRound) {
      return;
    }

    const dbRef = ref(getDatabase(firebase), `rounds/${currentSelectedRound}`);

    const update = (snapshot, name) => {
      const value = snapshot.val();
      if (value === null) {
        // invalid round is the only way this will happen
        return;
      }
      setRoundData((roundData) => {
        // skip the re-render if it's not needed
        if (
          roundData &&
          JSON.stringify(roundData[name]) === JSON.stringify(value)
        ) {
          return roundData;
        }

        return {
          ...roundData,
          [name]: value,
        };
      });
    };

    const onWinnersChange = (snapshot) => {
      update(snapshot, "winners");

      // And, if this this *seems* like the current round but it has winning pirates, then
      // that means it just ended, and there should be a new current round now. Increment
      // the counter, so the user can navigate to it if they want!
      if (currentRound === currentSelectedRound && snapshot.val()[0] > 0) {
        setCurrentRound((currentRound) => currentRound + 1);
      }
    };
    const winnersRef = child(dbRef, "winners");
    const currentOddsRef = child(dbRef, "currentOdds");
    const timestampRef = child(dbRef, "timestamp");
    const lastChangeRef = child(dbRef, "lastChange");

    const isCurrentOrPreviousRound = () => {
      return [currentRound, currentRound - 1].includes(
        parseInt(currentSelectedRound)
      );
    };

    const addFirebaseHandlers = () => {
      // grab the changeable data points rather than the entire state every time
      goOnline(getDatabase(firebase));
    };

    const removeFirebaseHandlers = () => {
      goOffline(getDatabase(firebase));
    };

    // get the entire round state once
    get(dbRef)
      .then((snapshot) => {
        let newRoundData = snapshot.val();
        if (newRoundData) {
          setRoundData(newRoundData);
        } else {
          toast.closeAll();
          toast({
            title: `Round ${currentSelectedRound} not found.`,
            description: "We don't seem to have data for this round. 🤔",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        }
      })
      .then(() => {
        // after getting round state, add listeners if this is current/previous round
        if (isCurrentOrPreviousRound()) {
          onValue(winnersRef, onWinnersChange);
          onValue(currentOddsRef, (snapshot) =>
            update(snapshot, "currentOdds")
          );
          onValue(timestampRef, (snapshot) => update(snapshot, "timestamp"));
          onValue(lastChangeRef, (snapshot) => update(snapshot, "lastChange"));
        }
      });

    window.addEventListener("blur", removeFirebaseHandlers);
    window.addEventListener("focus", addFirebaseHandlers);

    return () => {
      window.removeEventListener("blur", removeFirebaseHandlers);
      window.removeEventListener("focus", addFirebaseHandlers);
      off(winnersRef);
      off(currentOddsRef);
      off(timestampRef);
      off(lastChangeRef);
    };
  }, [toast, firebase, currentSelectedRound, currentRound]);

  return [currentRound, roundData];
}
