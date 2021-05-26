import { useState, useContext } from "react";
import RoundContext from "../RoundState";
import { determineBetAmount, getMaxBet, createBetURL } from "../util";
import {
    Button,
    Stack,
    ButtonGroup,
    Checkbox,
    HStack,
    useToast,
    useClipboard,
} from "@chakra-ui/react";
import SettingsBox from "./SettingsBox";
import ExtraBox from "./ExtraBox";
import HorizontalScrollingBox from "./HorizontalScrollingBox";
import Cookies from "universal-cookie/es6";
import { LinkIcon } from "@chakra-ui/icons";

// these are the "Set all to max" + copy url buttons

const CopyLinkButtons = () => {
    const toast = useToast();
    const cookies = new Cookies();
    const { roundState } = useContext(RoundContext);
    const [useWebDomain, toggleUseWebDomain] = useState(
        cookies.get("useWebDomain") === "true"
    );

    const betURL = createBetURL(roundState);
    const amountsBetUrl = createBetURL(roundState, false);
    const origin = useWebDomain ? window.location.origin : "";

    const urlClip = useClipboard(origin + betURL);
    const urlAmountsClip = useClipboard(origin + amountsBetUrl);

    function copier(clip, title) {
        clip.onCopy();
        toast.closeAll();
        toast({
            title: title,
            status: "success",
            duration: 1300,
            isClosable: true,
        });
    }

    if (betURL.includes("&b=") === false) {
        return null;
    }

    return (
        <ExtraBox whiteSpace="nowrap">
            <Stack>
                <ButtonGroup size="sm" isAttached variant="outline">
                    <Button
                        mr="-px"
                        leftIcon={<LinkIcon />}
                        onClick={() => copier(urlClip, "Bet URL copied!")}
                    >
                        Copy URL
                    </Button>
                    {amountsBetUrl.includes("&a=") && (
                        <Button
                            onClick={() =>
                                copier(
                                    urlAmountsClip,
                                    "Bet URL + Amounts copied!"
                                )
                            }
                        >
                            + Amounts
                        </Button>
                    )}
                </ButtonGroup>
                <Checkbox
                    isChecked={useWebDomain}
                    onChange={(e) => {
                        let checked = e.target.checked;
                        toggleUseWebDomain(checked);
                        cookies.set("useWebDomain", checked);
                    }}
                >
                    Include website domain
                </Checkbox>
            </Stack>
        </ExtraBox>
    );
};

const BetExtras = (props) => {
    const { betOdds, betBinaries, ...rest } = props;
    const { roundState, setRoundState } = useContext(RoundContext);

    function setAllBets(value) {
        let betAmounts = { ...roundState.betAmounts };
        for (let index in roundState.betAmounts) {
            if (betBinaries[index] > 0) {
                betAmounts[index] = determineBetAmount(
                    value,
                    Math.ceil(1000000 / betOdds[index])
                );
            } else {
                betAmounts[index] = -1000;
            }
        }
        setRoundState({ betAmounts });
    }

    return (
        <SettingsBox mt={4} {...rest}>
            <HorizontalScrollingBox whiteSpace="nowrap" p={4}>
                <HStack>
                    <Button
                        minWidth="unset"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            setAllBets(
                                getMaxBet(roundState.currentSelectedRound)
                            );
                        }}
                    >
                        Set all to max
                    </Button>
                    <CopyLinkButtons />
                </HStack>
            </HorizontalScrollingBox>
        </SettingsBox>
    );
};

export default BetExtras;
