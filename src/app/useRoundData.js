import { useState, useEffect } from "react";
import { useToast } from "@chakra-ui/react";

export default function useRoundData(currentSelectedRound) {
  const toast = useToast();

  const [currentRound, setCurrentRound] = useState(null);
  const [roundData, setRoundData] = useState(null);

  // When the page first loads, if there's no round selected yet, get the current round number
  useEffect(() => {
    const fetchCurrentRound = async () => {
      const currentRoundResponse = await fetch(
        `https://neofoodclub.b-cdn.net/current_round.txt`
      );
      const currentRoundData = await currentRoundResponse.text();
      if (/\d+/.test(currentRoundData)) {
        setCurrentRound(parseInt(currentRoundData));
      }
    };
    fetchCurrentRound();
  }, []);

  // Once a round is selected, we should poll its data!
  useEffect(() => {
    if (!currentSelectedRound) {
      return;
    }

    let dontLoop = false;

    const fetchRoundData = async () => {
      if (dontLoop) {
        return;
      }
      try {
        const response = await fetch(
          `https://neofoodclub.b-cdn.net/rounds/${currentSelectedRound}.json`
        );
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error);
        }
        setRoundData(data);

        if (data?.winners[0] > 0) {
          // we don't need to keep polling if the round has ended
          dontLoop = true;
          if (currentSelectedRound === currentRound) {
            setCurrentRound(currentSelectedRound + 1);
          }
        }
      } catch (error) {
        toast({
          title: `Failed to fetch round ${currentSelectedRound}`,
          description: "Please try again later.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    };

    fetchRoundData(); // Fetch immediately when the round is selected
    let interval = setInterval(fetchRoundData, 5000);

    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearInterval(interval);
      } else {
        fetchRoundData(); // Fetch immediately when the page becomes visible
        interval = setInterval(fetchRoundData, 5000);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [toast, currentSelectedRound, currentRound, setRoundData]);

  return [currentRound, roundData];
}
