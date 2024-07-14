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
        `https://cdn.neofood.club/current_round.txt`
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

    const currentSelectedRoundInt = parseInt(currentSelectedRound);

    let dontLoop = false;
    let intervalMs = 5000;

    if (currentSelectedRoundInt === currentRound) {
      // If the selected round is the current round, we poll every 5 seconds
      intervalMs = 5000;
    } else if (currentSelectedRoundInt === currentRound - 1) {
      // If the selected round is the previous round, we poll every minute
      intervalMs = 60000;
    }

    const fetchRoundData = async () => {
      if (dontLoop) {
        return;
      }
      try {
        const response = await fetch(
          `https://cdn.neofood.club/rounds/${currentSelectedRoundInt}.json`
        );
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error);
        }
        setRoundData(data);

        if (data?.winners[0] > 0) {
          if (currentSelectedRoundInt === currentRound) {
            setCurrentRound(currentSelectedRoundInt + 1);
          }

          if (currentSelectedRoundInt < currentRound - 1) {
            // if the round is older than the previous round, we stop polling
            dontLoop = true;
          }
        }
      } catch (error) {
        toast({
          title: `Failed to fetch round ${currentSelectedRoundInt}`,
          description: "Please try again later.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    };

    fetchRoundData(); // Fetch immediately when the round is selected
    let interval = setInterval(fetchRoundData, intervalMs);

    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearInterval(interval);
      } else {
        fetchRoundData(); // Fetch immediately when the page becomes visible
        interval = setInterval(fetchRoundData, intervalMs);
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
