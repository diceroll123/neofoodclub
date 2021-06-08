import { Box, useTheme, useColorModeValue } from "@chakra-ui/react";
import React, { useContext } from "react";
import { RoundContext } from "./RoundState";
import Footer from "./Footer";
import Header from "./Header";
import ViewMode from "./pages/ViewMode";
import EditBets from "./pages/EditBets";

export default function HomePage() {
    const { roundState, setRoundState } = useContext(RoundContext);
    const theme = useTheme();
    const grayAccent = useColorModeValue(
        theme.colors.gray["50"],
        theme.colors.gray["700"]
    );
    // the dark values are effectively "375"
    const green = useColorModeValue(theme.colors.green["200"], "#50C17F");
    const blue = useColorModeValue(theme.colors.blue["200"], "#4BA0E4");
    const orange = useColorModeValue(theme.colors.orange["200"], "#F0923E");
    const red = useColorModeValue(theme.colors.red["200"], "#F76C6C");
    const yellow = useColorModeValue(theme.colors.yellow["200"], "#EFCF50");

    function getPirateBgColor(openingOdds) {
        // for the cell that has the pirate name in the big table
        if ([3, 4, 5].includes(openingOdds)) return blue;
        if ([6, 7, 8, 9].includes(openingOdds)) return orange;
        if ([10, 11, 12, 13].includes(openingOdds)) return red;
        return green;
    }

    return (
        <>
            <Header />

            <Box pt="6.5rem">
                {roundState.viewMode ? (
                    <ViewMode
                        green={green}
                        red={red}
                        orange={orange}
                        blue={blue}
                        yellow={yellow}
                        grayAccent={grayAccent}
                        getPirateBgColor={getPirateBgColor}
                    />
                ) : (
                    <EditBets
                        green={green}
                        red={red}
                        orange={orange}
                        blue={blue}
                        yellow={yellow}
                        grayAccent={grayAccent}
                        getPirateBgColor={getPirateBgColor}
                    />
                )}
            </Box>

            <Footer />
        </>
    );
}
