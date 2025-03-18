import React, { useEffect, useContext, memo } from "react";
import { RoundContext } from "./RoundState";
import { anyBetsExist, parseBetUrl } from "./util";
import { useToast } from "@chakra-ui/react";

function removeHtmlTags(str) {
    return str.replace(/<\/?[^>]+(>|$)/g, "");
}

const DropZone = memo(({ children }) => {
    const toast = useToast();
    const { addNewSet } = useContext(RoundContext);

    useEffect(() => {
        const handleDrop = (e) => {
            const url = e.dataTransfer.getData("text/uri-list");

            const parsed = parseBetUrl(url.split("#")[1]);

            if (!anyBetsExist(parsed.bets)) {
                return;
            }

            e.preventDefault();

            const dropped = e.dataTransfer.getData("text/html");
            let name = removeHtmlTags(dropped || "").trim();

            if (name.startsWith("http")) {
                name = `Dropped Set [Round ${parsed.round}]`;
            }

            addNewSet(name, parsed.bets, parsed.betAmounts, true);
            toast({
                title: `Dropped bet imported!`,
                duration: 2000,
                isClosable: true,
            });
        };

        const handleDragOver = (e) => {
            e.preventDefault();
        };

        document.addEventListener("drop", handleDrop);
        document.addEventListener("dragover", handleDragOver);

        return () => {
            document.removeEventListener("drop", handleDrop);
            document.removeEventListener("dragover", handleDragOver);
        };
    }, [addNewSet, toast]);

    return <>{children}</>;
});

export default DropZone;
