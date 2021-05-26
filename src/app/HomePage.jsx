import React from "react";
import TheTable from "./TheTable";
import Header from "./Header";
import Footer from "./Footer";
import { Box, useTheme, useColorModeValue } from "@chakra-ui/react";
import TableSettings from "./components/TableSettings";

export default function HomePage() {
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

    return (
        <>
            <Header />

            <Box pt="6.5rem">
                <TableSettings background={grayAccent} />

                <TheTable
                    green={green}
                    red={red}
                    orange={orange}
                    blue={blue}
                    yellow={yellow}
                    grayAccent={grayAccent}
                />
            </Box>

            <Footer />
        </>
    );
}
