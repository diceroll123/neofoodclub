import { Box } from "@chakra-ui/react";
import React, { useContext } from "react";
import { RoundContext } from "./RoundState";
import Footer from "./Footer";
import Header from "./Header";
import ViewMode from "./pages/ViewMode";
import EditBets from "./pages/EditBets";
import NoNeoNFTs from "./components/NoNeoNFTs";

export default function HomePage() {
    const { roundState } = useContext(RoundContext);

    return (
        <>
            <Header />

            <Box pt="6.5rem">
                <NoNeoNFTs />
                {roundState.viewMode ? <ViewMode /> : <EditBets />}
            </Box>

            <Footer />
        </>
    );
}
