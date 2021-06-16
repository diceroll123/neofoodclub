import { Chart, Scatter } from "react-chartjs-2";
import {
    HStack,
    Table,
    Tbody,
    Th,
    Thead,
    Tr,
    Skeleton,
    useColorMode,
    useColorModeValue,
} from "@chakra-ui/react";
import React, { useContext } from "react";
import annotationPlugin from "chartjs-plugin-annotation";

import {
    amountAbbreviation,
    displayAsPercent,
    numberWithCommas,
} from "../util";
import { RoundContext } from "../RoundState";
import Td from "./Td";
import TextTooltip from "./TextTooltip";

Chart.register(annotationPlugin);

// this element contains the odds/winnings tables + charts

const PayoutCharts = (props) => {
    const { calculations } = props;
    const green = useColorModeValue("nfc.green", "nfc.greenDark");
    const red = useColorModeValue("nfc.red", "nfc.redDark");
    const gray = useColorModeValue("nfc.gray", "nfc.grayDark");
    const {
        payoutTables,
        betBinaries,
        totalWinningPayoff,
        totalWinningOdds,
        winningBetBinary,
    } = calculations;
    const { roundState } = useContext(RoundContext);
    const { colorMode } = useColorMode();

    function makeChart(title, data) {
        let points = [];

        for (const dataObj in data) {
            let obj = data[dataObj];
            points.push({
                x: obj.value,
                y: obj.probability,
            });
        }

        const chartData = {
            datasets: [
                {
                    data: points,
                    borderColor: "rgb(255, 85, 85)",
                    backgroundColor: "rgb(255, 85, 85)",
                },
            ],
        };

        // this will be our "double units/profit" line
        let breakEven = 0;
        let doubleProfit = 0;
        let type = "units";

        if (title === "Odds") {
            let validBets = Object.values(betBinaries).filter((x) => x > 0);
            breakEven = validBets.length;
            doubleProfit = 2 * breakEven;
        } else if (title === "Winnings") {
            let totalBetAmount = Object.values(roundState.betAmounts).reduce(
                (a, b) => a + b
            );
            breakEven = totalBetAmount;
            doubleProfit = totalBetAmount * 2;
            type = "NP";
        }

        const options = {
            plugins: {
                legend: {
                    display: false,
                },
                annotation: {
                    annotations: {
                        doubleProfit: {
                            type: "line",
                            xMin: doubleProfit,
                            xMax: doubleProfit,
                            borderColor: "#50fa7b",
                            borderWidth: 2,
                        },
                        breakEven: {
                            type: "line",
                            xMin: breakEven,
                            xMax: breakEven,
                            borderColor: "#000",
                            borderWidth: 2,
                        },
                    },
                },
                tooltip: {
                    displayColors: false,
                    callbacks: {
                        label: function (context) {
                            return [
                                `${numberWithCommas(context.parsed.x)} ${type}`,
                                `${displayAsPercent(context.parsed.y, 3)}`,
                            ];
                        },
                    },
                },
            },
            elements: {
                point: {
                    radius: 4,
                },
            },
            interaction: {
                mode: "index",
                intersect: false,
            },
            animation: {
                duration: 0,
            },
            scales: {
                x: {
                    ticks: {
                        callback: (value, index, array) =>
                            amountAbbreviation(value),
                    },
                },
                y: {
                    min: 0.0,
                    max: 1.0 + Number.EPSILON, // epsilon because without it, anything with a value of 1.0 is cut off
                },
            },
        };

        // add custom dark mode changes to options
        if (colorMode === "dark") {
            // line color, dracula pink
            chartData.datasets[0].borderColor = "#ff79c6";

            // tick font color, white
            options.scales.x.ticks.color = "#ffffff";
            options.scales.y.ticks = { color: "#ffffff" };

            // grid line color, dracula comment color
            let gridLineColor = "#6272a4";

            options.scales.x.grid = {};
            options.scales.x.grid.borderColor = gridLineColor;
            options.scales.x.grid.color = gridLineColor;
            options.scales.y.grid = {};
            options.scales.y.grid.borderColor = gridLineColor;
            options.scales.y.grid.color = gridLineColor;
        }

        return (
            <Tr>
                <Td colSpan={4} pt={2}>
                    <Scatter data={chartData} options={options} />
                </Td>
            </Tr>
        );
    }

    function makeTable(title, data) {
        data = data || {};
        let tableRows = Object.keys(data).map((key) => {
            const dataObj = data[key];

            let bgColor = "transparent";

            if (winningBetBinary > 0) {
                if (
                    (title === "Odds" && totalWinningOdds === dataObj.value) ||
                    (title === "Winnings" &&
                        totalWinningPayoff === dataObj.value)
                ) {
                    if (dataObj.value === 0) {
                        bgColor = red;
                    } else {
                        bgColor = green;
                    }
                }
            }

            return (
                <Tr key={key} backgroundColor={bgColor}>
                    <Td isNumeric>{numberWithCommas(dataObj.value)}</Td>
                    <Td isNumeric>
                        <TextTooltip
                            text={displayAsPercent(dataObj.probability, 3)}
                            label={displayAsPercent(dataObj.probability)}
                        />
                    </Td>
                    <Td isNumeric>
                        <TextTooltip
                            text={displayAsPercent(dataObj.cumulative, 3)}
                            label={displayAsPercent(dataObj.cumulative)}
                        />
                    </Td>
                    <Td isNumeric>
                        <TextTooltip
                            text={displayAsPercent(dataObj.tail, 3)}
                            label={displayAsPercent(dataObj.tail)}
                        />
                    </Td>
                </Tr>
            );
        });

        return (
            <Skeleton isLoaded={roundState.roundData}>
                <Table
                    size="sm"
                    width="auto"
                    backgroundColor={gray}
                    borderTopLeftRadius="0.5rem"
                    borderTopRightRadius="0.5rem"
                >
                    <Thead>
                        <Tr>
                            <Th>{title}</Th>
                            <Th>Probability</Th>
                            <Th>Cumulative</Th>
                            <Th>Tail</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {tableRows}
                        {makeChart(title, data)}
                    </Tbody>
                </Table>
            </Skeleton>
        );
    }

    return (
        <HStack mx={4}>
            {makeTable("Odds", payoutTables.odds)}
            {makeTable("Winnings", payoutTables.winnings)}
        </HStack>
    );
};

export default PayoutCharts;
