import { VStack, Button, Icon } from "@chakra-ui/react";
import { RoundContext } from "../RoundState";
import React, { useContext } from "react";
import { calculateRoundData } from "../util";
import HorizontalScrollingBox from "../components/HorizontalScrollingBox";
import PayoutCharts from "../components/PayoutCharts";
import PayoutTable from "../components/PayoutTable";
import SettingsBox from "../components/SettingsBox";
import SetAllToMaxButton from "../components/SetAllToMaxButton";
import { FaEdit } from "react-icons/fa";

export default function ViewMode(props) {
    const { roundState, setRoundState } = useContext(RoundContext);
    const { blue, green, red, orange, yellow, grayAccent, getPirateBgColor } =
        props;

    let {
        probabilities,
        pirateFAs,
        arenaRatios,
        betOdds,
        betPayoffs,
        betProbabilities,
        betExpectedRatios,
        betNetExpected,
        betMaxBets,
        betBinaries,
        payoutTables,
        winningBetBinary,
        totalBetAmounts,
        totalBetExpectedRatios,
        totalBetNetExpected,
        totalWinningPayoff,
        totalWinningOdds,
        totalEnabledBets,
    } = calculateRoundData(roundState);

    return (
        <>
            <SettingsBox mt={4} background={grayAccent}>
                <HorizontalScrollingBox whiteSpace="nowrap" p={4}>
                    <VStack>
                        <Button
                            leftIcon={<Icon as={FaEdit} />}
                            colorScheme="blue"
                            size="sm"
                            onClick={() => {
                                setRoundState({ viewMode: false });
                            }}
                            width={"100%"}
                        >
                            Edit these bets
                        </Button>

                        <SetAllToMaxButton
                            betOdds={betOdds}
                            betBinaries={betBinaries}
                            width={"100%"}
                        />
                    </VStack>
                </HorizontalScrollingBox>
            </SettingsBox>
            <HorizontalScrollingBox>
                <PayoutTable
                    betBinaries={betBinaries}
                    betProbabilities={betProbabilities}
                    betExpectedRatios={betExpectedRatios}
                    betNetExpected={betNetExpected}
                    betOdds={betOdds}
                    betMaxBets={betMaxBets}
                    betPayoffs={betPayoffs}
                    winningBetBinary={winningBetBinary}
                    getPirateBgColor={getPirateBgColor}
                    orange={orange}
                    red={red}
                    yellow={yellow}
                    green={green}
                    totalBetAmounts={totalBetAmounts}
                    totalBetExpectedRatios={totalBetExpectedRatios}
                    totalBetNetExpected={totalBetNetExpected}
                    totalWinningPayoff={totalWinningPayoff}
                    totalWinningOdds={totalWinningOdds}
                    totalEnabledBets={totalEnabledBets}
                />
            </HorizontalScrollingBox>

            <HorizontalScrollingBox mt={4}>
                <PayoutCharts
                    payoutTables={payoutTables}
                    betBinaries={betBinaries}
                    grayAccent={grayAccent}
                    totalWinningPayoff={totalWinningPayoff}
                    totalWinningOdds={totalWinningOdds}
                    winningBetBinary={winningBetBinary}
                    red={red}
                    green={green}
                />
            </HorizontalScrollingBox>
        </>
    );
}
