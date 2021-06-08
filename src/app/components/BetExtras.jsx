import {
    Button,
    Stack,
    ButtonGroup,
    Checkbox,
    HStack,
    useToast,
    useClipboard,
    Icon,
} from "@chakra-ui/react";
import { FaLink } from "react-icons/fa";
import Cookies from "universal-cookie/es6";
import React, { useState, useContext } from "react";

import { createBetURL } from "../util";
import ExtraBox from "./ExtraBox";
import HorizontalScrollingBox from "./HorizontalScrollingBox";
import { RoundContext } from "../RoundState";
import SettingsBox from "./SettingsBox";
import SetAllToMaxButton from "./SetAllToMaxButton";

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
                <ButtonGroup size="sm" isAttached>
                    <Button
                        mr="-px"
                        leftIcon={<Icon as={FaLink} />}
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

    return (
        <SettingsBox mt={4} {...rest}>
            <HorizontalScrollingBox whiteSpace="nowrap" p={4}>
                <HStack>
                    <SetAllToMaxButton
                        betOdds={betOdds}
                        betBinaries={betBinaries}
                    />
                    <CopyLinkButtons />
                </HStack>
            </HorizontalScrollingBox>
        </SettingsBox>
    );
};

export default BetExtras;
