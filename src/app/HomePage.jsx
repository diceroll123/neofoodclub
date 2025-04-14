import { Box } from "@chakra-ui/react";
import React from "react";
import Footer from "./Footer";
import Header from "./Header";
import EditBets from "./components/EditBets";
import { useTableColors } from "./util";

const getPirateBgColor = (odds, colors) => {
  if ([3, 4, 5].includes(odds)) return colors.blue;
  if ([6, 7, 8, 9].includes(odds)) return colors.orange;
  if ([10, 11, 12, 13].includes(odds)) return colors.red;
  return colors.green;
};

export default function HomePage() {
  const colors = useTableColors();
  const getPirateBgColorWrapper = (odds) => getPirateBgColor(odds, colors);

  return (
    <>
      <Header />

      <Box pt="6.5rem">
        <EditBets getPirateBgColor={getPirateBgColorWrapper} />
      </Box>

      <Footer />
    </>
  );
}
