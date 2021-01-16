import {useState, useEffect} from "react";
import {useToast} from "@chakra-ui/react";

export default function useRoundData(firebase, currentSelectedRound) {
    const toast = useToast();

    const [currentRound, setCurrentRound] = useState(null);
    const [roundData, setRoundData] = useState(null);

    // When the page first loads, if there's no round selected yet, get the current round number
    // from Firebase.
    useEffect(() => {
        firebase.database().ref().child("current_round").once('value').then((snapshot) => {
            const newCurrentRound = snapshot.val();
            setCurrentRound(newCurrentRound);
        });
    }, [firebase]);

    // Once a round is selected, we should subscribe to its data!
    useEffect(() => {
        if (!currentSelectedRound) {
            return;
        }

        const ref = firebase.database().ref().child(`rounds/${currentSelectedRound}`);

        const update = (snapshot, name) => {
            const value = snapshot.val();
            if (value === null) {
                // invalid round is the only way this will happen
                return;
            }
            setRoundData(roundData => {
                return {
                    ...roundData,
                    [name]: snapshot.val()
                }
            })
        }

        const onWinnersChange = (snapshot) => {
            update(snapshot, "winners");

            // And, if this this *seems* like the current round but it has winning pirates, then
            // that means it just ended, and there should be a new current round now. Increment
            // the counter, so the user can navigate to it if they want!
            if (currentRound === currentSelectedRound && snapshot.val()[0] > 0) {
                setCurrentRound(currentRound => currentRound + 1);
            }
        };
        const winnersRef = ref.child("winners");

        const onCurrentOddsChange = (snapshot) => update(snapshot, "currentOdds");
        const currentOddsRef = ref.child("currentOdds");

        const onTimestampChange = (snapshot) => update(snapshot, "timestamp");
        const timestampRef = ref.child("timestamp");

        const onLastChangeChange = (snapshot) => update(snapshot, "lastChange");
        const lastChangeRef = ref.child("lastChange");

        // get the entire round state once
        ref.once('value').then((snapshot) => {
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
                    isClosable: true
                });
            }
        }).then(() => {
            // after getting round state...

            if ([currentRound, currentRound - 1].includes(parseInt(currentSelectedRound)) === false) {
                // we don't need live data for old rounds
                // but allow live update on the previous round just in case!
                return;
            }

            // and now we grab the changeable data points rather than the entire state every time
            winnersRef.on('value', onWinnersChange);
            currentOddsRef.on('value', onCurrentOddsChange);
            timestampRef.on('value', onTimestampChange);
            lastChangeRef.on('value', onLastChangeChange);
        });

        return () => {
            winnersRef.off('value', onWinnersChange);
            currentOddsRef.off('value', onCurrentOddsChange);
            timestampRef.off('value', onTimestampChange);
            lastChangeRef.off('value', onLastChangeChange);
        };

    }, [
        toast,
        firebase,
        currentSelectedRound,
    ]);

    return [currentRound, roundData];
}
