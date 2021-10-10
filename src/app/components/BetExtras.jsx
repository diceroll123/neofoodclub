import {
    Stack,
    useColorModeValue,
} from "@chakra-ui/react";
import SettingsBox from "./SettingsBox";
import SetAllToMaxButton from "./SetAllToMaxButton";
import CopyLinkButtons from "./CopyLinkButtons";

// these are the "Set all to max" + copy url buttons

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
