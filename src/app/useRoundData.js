import {useState, useEffect} from "react";
import {useToast} from "@chakra-ui/react";

export default function useRoundData(firebase, currentSelectedRound) {
    const toast = useToast();

    const [currentRound, setCurrentRound] = useState(null);
    const [roundData, setRoundData] = useState(null);

    // When the page first loads, if there's no round selected yet, get the current round number
    // from Firebase.
    useEffect(() => {
        firebase.database().ref().child("current_round").once('value', (snapshot) => {
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

        const onValueChange = (snapshot) => {
            let newRoundData = snapshot.val();
            if (newRoundData) {
                setRoundData(newRoundData);

                // And, if this this *seems* like the current round but it has winning pirates, then
                // that means it just ended, and there should be a new current round now. Increment
                // the counter, so the user can navigate to it if they want!
                if (currentRound === currentSelectedRound && newRoundData.winners[0] > 0) {
                    setCurrentRound(currentRound => currentRound + 1);
                }
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
        };

        ref.on('value', onValueChange);
        return () => ref.off("value", onValueChange);
    }, [
        toast,
        firebase,
        currentSelectedRound,
    ]);

    return [currentRound, roundData];
}
