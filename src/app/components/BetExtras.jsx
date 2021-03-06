import {
    Button,
    Stack,
    ButtonGroup,
    Checkbox,
    useToast,
    useClipboard,
    Icon,
    useColorModeValue,
} from "@chakra-ui/react";
import { FaLink } from "react-icons/fa";
import Cookies from "universal-cookie/es6";
import React, { useState, useContext } from "react";

import { createBetURL, anyBetsExist } from "../util";
import ExtraBox from "./ExtraBox";
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

    const origin = useWebDomain ? window.location.origin : "";

    const urlClip = useClipboard(origin + createBetURL(roundState));
    const urlAmountsClip = useClipboard(
        origin + createBetURL(roundState, false)
    );

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

    if (anyBetsExist(roundState.bets) === false) {
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
                    {urlAmountsClip.value.includes("&a=") && (
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
    const { ...rest } = props;
    const gray = useColorModeValue("nfc.gray", "nfc.grayDark");

    return (
        <SettingsBox bgColor={gray} mt={4} p={4} {...rest}>
            <Stack>
                <SetAllToMaxButton />
                <CopyLinkButtons />
            </Stack>
        </SettingsBox>
    );
};

export default BetExtras;
