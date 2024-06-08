import {
    useColorModeValue,
} from "@chakra-ui/react";
import SettingsBox from "./SettingsBox";
import SetAllToMaxButton from "./SetAllToMaxButton";

// these are the "Set all to max" + copy url buttons

const BetAmountsSettings = (props) => {
    const { ...rest } = props;
    const gray = useColorModeValue("nfc.gray", "nfc.grayDark");

    return (
        <SettingsBox bgColor={gray} p={4} {...rest}>
            <SetAllToMaxButton />
        </SettingsBox>
    );
};

export default BetAmountsSettings;
