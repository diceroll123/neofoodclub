import React, { useEffect, useContext } from 'react';
import { RoundContext } from "./RoundState";
import { anyBetsExist, parseBetUrl } from './util';

function removeHtmlTags(str) {
    return str.replace(/<\/?[^>]+(>|$)/g, "");
}

const DropZone = ({ children }) => {
    const {
        addNewSet, allBets
    } = useContext(RoundContext);

    useEffect(() => {
        const handleDrop = (e) => {
            e.preventDefault();
            const url = e.dataTransfer.getData('text/uri-list');

            const parsed = parseBetUrl(url.split("#")[1]);

            if (!anyBetsExist(parsed.bets)) {
                return;
            }

            const dropped = e.dataTransfer.getData('text/html');
            let name = removeHtmlTags(dropped || "").trim();

            if (name.startsWith("http")) {
                name = `Dropped Set [Round ${parsed.round}]`;
            }

            addNewSet(name, parsed.bets, parsed.betAmounts, true);
        };

        const handleDragOver = (e) => {
            e.preventDefault();
        };

        document.addEventListener('drop', handleDrop);
        document.addEventListener('dragover', handleDragOver);

        return () => {
            document.removeEventListener('drop', handleDrop);
            document.removeEventListener('dragover', handleDragOver);
        };
    }, [addNewSet, allBets]);

    return (
        <>
            {children}
        </>
    );
};

export default DropZone;
