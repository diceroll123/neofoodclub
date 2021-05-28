import { FaCode, FaMarkdown } from "react-icons/fa";
import {
    useClipboard,
    useToast,
    Button,
    ButtonGroup,
    Icon,
    Box,
} from "@chakra-ui/react";
import React, { useContext } from "react";

import { PIRATE_NAMES } from "../constants";
import { createBetURL, displayAsPercent } from "../util";
import RoundContext from "../RoundState";
import SettingsBox from "./SettingsBox";

// this is the "copy markdown/html"... code
// previously known as the reddit table code

const CopyPayouts = (props) => {
    const { payoutTables, betBinaries, betExpectedRatios, betOdds, ...rest } =
        props;
    const { roundState } = useContext(RoundContext);
    const toast = useToast();

    function createMarkdownTables() {
        // specifically meant to not be posted on Neopets, so it includes a URL.
        if (payoutTables.odds === undefined) {
            return null;
        }

        let totalTER = 0;
        let betCount = 0;
        let lines = [];
        // bet table
        lines.push(
            `[${roundState.currentSelectedRound}](${
                window.location.origin
            }${createBetURL(
                roundState
            )})|Shipwreck|Lagoon|Treasure|Hidden|Harpoon|Odds`
        );
        lines.push(":-:|-|-|-|-|-|-:");

        for (let betNum in roundState.bets) {
            totalTER += betExpectedRatios[betNum];
            if (betBinaries[betNum] > 0) {
                betCount += 1;
                let str = `${betNum}`;
                for (let i = 0; i < 5; i++) {
                    str += "|";
                    let pirateId =
                        roundState.roundData.pirates[i][
                            roundState.bets[betNum][i] - 1
                        ];
                    if (pirateId) {
                        str += PIRATE_NAMES[pirateId];
                    }
                }
                lines.push(`${str}|${betOdds[betNum]}:1`);
            }
        }
        lines.push("\n");
        // stats
        lines.push(`TER: ${totalTER.toFixed(3)}`);
        lines.push("\n");
        lines.push("Odds|Probability|Cumulative|Tail");
        lines.push("--:|--:|--:|--:");
        payoutTables.odds.forEach((item) => {
            lines.push(
                `${item.value}:${betCount}|${displayAsPercent(
                    item.probability,
                    3
                )}|${displayAsPercent(item.cumulative, 3)}|${displayAsPercent(
                    item.tail,
                    3
                )}`
            );
        });

        return lines.join("\n");
    }

    function createHtmlTables() {
        // specifically meant to be posted on Neopets, so it includes the bet hash
        if (payoutTables.odds === undefined) {
            return null;
        }

        // bet table
        let html =
            "<table><thead><tr><th>Bet</th><th>Shipwreck</th><th>Lagoon</th><th>Treasure</th><th>Hidden</th><th>Harpoon</th></tr></thead><tbody>";

        for (let betNum in roundState.bets) {
            if (betBinaries[betNum] > 0) {
                let str = `<tr><td>${betNum}</td>`;
                for (let i = 0; i < 5; i++) {
                    str += "<td>";
                    let pirateId =
                        roundState.roundData.pirates[i][
                            roundState.bets[betNum][i] - 1
                        ];
                    if (pirateId) {
                        str += PIRATE_NAMES[pirateId];
                    }
                    str += "</td>";
                }
                html += str;
                html += "</tr>";
            }
        }

        const hash = createBetURL(roundState);
        html += `</tbody><tfoot><tr><td colspan="6">${hash}</td></tr></tfoot></table>`;

        return html;
    }

    const markdown = createMarkdownTables();
    const markdownClip = useClipboard(markdown);

    const html = createHtmlTables();
    const htmlClip = useClipboard(html);

    return (
        <SettingsBox mt={4} {...rest}>
            <Box p={4}>
                <ButtonGroup isAttached>
                    <Button
                        leftIcon={<Icon as={FaMarkdown} w="1.4em" h="1.4em" />}
                        variant="outline"
                        onClick={() => {
                            markdownClip.onCopy();
                            toast.closeAll();
                            toast({
                                title: `Table Markdown copied!`,
                                status: "success",
                                duration: 2000,
                                isClosable: true,
                            });
                        }}
                    >
                        Copy Markdown
                    </Button>
                    <Button
                        leftIcon={<Icon as={FaCode} w="1.4em" h="1.4em" />}
                        variant="outline"
                        onClick={() => {
                            htmlClip.onCopy();
                            toast.closeAll();
                            toast({
                                title: `Table HTML copied!`,
                                status: "success",
                                duration: 2000,
                                isClosable: true,
                            });
                        }}
                    >
                        Copy HTML
                    </Button>
                </ButtonGroup>
            </Box>
        </SettingsBox>
    );
};

export default CopyPayouts;