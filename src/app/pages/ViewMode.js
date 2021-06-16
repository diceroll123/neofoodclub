import { VStack, Button, Icon, useColorModeValue } from "@chakra-ui/react";
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
    const gray = useColorModeValue("nfc.gray", "nfc.grayDark");

    let calculations = calculateRoundData(roundState);

    return (
        <>
            <SettingsBox mt={4} background={gray}>
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
                            calculations={calculations}
                            width={"100%"}
                        />
                    </VStack>
                </HorizontalScrollingBox>
            </SettingsBox>
            <HorizontalScrollingBox>
                <PayoutTable calculations={calculations} />
            </HorizontalScrollingBox>

            <HorizontalScrollingBox mt={4}>
                <PayoutCharts calculations={calculations} />
            </HorizontalScrollingBox>
        </>
    );
}
