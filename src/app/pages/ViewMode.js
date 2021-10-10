import { VStack, Button, Icon, useColorModeValue, HStack } from "@chakra-ui/react";
import { RoundContext } from "../RoundState";
import React, { useContext } from "react";
import HorizontalScrollingBox from "../components/HorizontalScrollingBox";
import PayoutCharts from "../components/PayoutCharts";
import PayoutTable from "../components/PayoutTable";
import SettingsBox from "../components/SettingsBox";
import CopyLinkButtons from "../components/CopyLinkButtons";
import SetAllToMaxButton from "../components/SetAllToMaxButton";
import { FaEdit } from "react-icons/fa";

export default function ViewMode() {
    const { setRoundState } = useContext(RoundContext);
    const gray = useColorModeValue("nfc.gray", "nfc.grayDark");

    return (
        <>
            <SettingsBox background={gray}>
                <HorizontalScrollingBox whiteSpace="nowrap" p={4}>
                    <HStack>
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

                            <SetAllToMaxButton width={"100%"} />
                        </VStack>

                        <CopyLinkButtons />
                    </HStack>
                </HorizontalScrollingBox>
            </SettingsBox>
            <HorizontalScrollingBox>
                <PayoutTable />
            </HorizontalScrollingBox>

            <HorizontalScrollingBox mt={4}>
                <PayoutCharts />
            </HorizontalScrollingBox>
        </>
    );
}
