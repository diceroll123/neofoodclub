import { useColorModeValue } from "@chakra-ui/react";
import SettingsBox from "./SettingsBox";
import BetAmountsButtons from "./BetAmountsButtons";

// these are the "Set all to max" + copy url buttons

const BetAmountsSettings = (props) => {
  const { ...rest } = props;
  const gray = useColorModeValue("nfc.gray", "nfc.grayDark");

  return (
    <SettingsBox bgColor={gray} p={4} {...rest}>
      <BetAmountsButtons />
    </SettingsBox>
  );
};

export default BetAmountsSettings;
