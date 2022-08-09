import { Box, useColorModeValue } from "@chakra-ui/react";
import React, { useContext } from "react";
import { RoundContext } from "./RoundState";
import Footer from "./Footer";
import Header from "./Header";
import ViewMode from "./pages/ViewMode";
import EditBets from "./pages/EditBets";
import NoNeoNFTs from "./components/NoNeoNFTs";

export default function HomePage() {
    const { roundState } = useContext(RoundContext);

    // we'll keep the colors here and bring them down
    const blue = useColorModeValue("nfc.blue", "nfc.blueDark");
    const orange = useColorModeValue("nfc.orange", "nfc.orangeDark");
    const red = useColorModeValue("nfc.red", "nfc.redDark");
    const green = useColorModeValue("nfc.green", "nfc.greenDark");
    const yellow = useColorModeValue("nfc.yellow", "nfc.yellowDark");
    const gray = useColorModeValue("nfc.gray", "nfc.grayDark");

    function getPirateBgColor(odds) {
        if ([3, 4, 5].includes(odds)) return blue;
        if ([6, 7, 8, 9].includes(odds)) return orange;
        if ([10, 11, 12, 13].includes(odds)) return red;

        return green;
    }

    return (
        <>
            <Header />

            <Box pt="6.5rem">
                <NoNeoNFTs />
                {roundState.viewMode ?
                    <ViewMode
                        blue={blue}
                        green={green}
                        orange={orange}
                        red={red}
                        yellow={yellow}
                        gray={gray}
                        getPirateBgColor={getPirateBgColor}
                    /> :
                    <EditBets
                        blue={blue}
                        green={green}
                        orange={orange}
                        red={red}
                        yellow={yellow}
                        gray={gray}
                        getPirateBgColor={getPirateBgColor}
                    />}
            </Box>

            <Footer />
        </>
    );
}
