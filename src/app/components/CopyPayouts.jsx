import { useContext } from "react";
import RoundContext from "../RoundState";
import { useClipboard, useToast, Button, Icon, Box } from "@chakra-ui/react";
import { createBetURL, displayAsPercent } from "../util";
import { PIRATE_NAMES } from "../constants";
import SettingsBox from "./SettingsBox";
import { CopyIcon } from "@chakra-ui/icons";

// this is the "copy markdown table code"... code
// previously known as the reddit table code

const CopyPayouts = (props) => {
    const { payoutTables, betBinaries, betExpectedRatios, betOdds, ...rest } =
        props;
    const { roundState } = useContext(RoundContext);
    const toast = useToast();

    function createMarkdownTables() {
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

    const tableCode = createMarkdownTables();

    const urlClip = useClipboard(tableCode);

    // disable if there's not a bet url in the code
    let disabled = tableCode === null || tableCode.includes("&b=") === false;

    return (
        <SettingsBox mt={4} {...rest}>
            <Box p={4}>
                <Button
                    isDisabled={disabled}
                    leftIcon={<CopyIcon w="1.4em" h="1.4em" />}
                    variant="outline"
                    onClick={() => {
                        urlClip.onCopy();
                        toast.closeAll();
                        toast({
                            title: `Markdown code copied!`,
                            status: "success",
                            duration: 5000,
                            isClosable: true,
                        });
                    }}
                >
                    Copy markdown table code
                </Button>
            </Box>
        </SettingsBox>
    );
};

export default CopyPayouts;
