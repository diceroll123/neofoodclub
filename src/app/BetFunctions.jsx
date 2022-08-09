import {
    Flex,
    Button,
    ButtonGroup,
    Editable,
    EditableInput,
    EditablePreview,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Modal,
    ModalBody,
    ModalContent,
    ModalCloseButton,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Stack,
    Text,
    Wrap,
    Spacer,
    WrapItem,
    Icon,
    useDisclosure,
    HStack,
} from "@chakra-ui/react";
import { FaCopy, FaPlus, FaTrash, FaChevronDown, FaMagic, FaShapes, FaRandom } from "react-icons/fa";
import React, { useContext, useEffect, useState } from "react";

import {
    anyBetsExist,
    cloneArray,
    determineBetAmount,
    getMaxBet,
    getOdds,
    getProbs,
    makeEmptyBetAmounts,
    makeEmptyBets,
    shuffleArray,
    sortedIndices,
    generateRandomPirateIndex,
    generateRandomIntegerInRange,
} from "./util";
import { computeBinaryToPirates, computePiratesBinary } from "./maths";
import { RoundContext } from "./RoundState";
import PirateSelect from "./components/PirateSelect";
import SettingsBox from "./components/SettingsBox";

const cartesian = (...a) =>
    a.reduce((a, b) => a.flatMap((d) => b.map((e) => [d, e].flat())));

const BuildSetMenu = (props) => {
    const { addNewSet, gambitWithPirates, getPirateBgColor, tenbetSet } = props;
    const { roundState } = useContext(RoundContext);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [mode, setMode] = React.useState(''); // currently can only be "Ten-bet" or "Gambit"
    const [pirateIndices, setPirateIndices] = React.useState([0, 0, 0, 0, 0]); // indices of the pirates to be included in the set
    const [min, setMin] = React.useState(0); // minimum pirate amount
    const [max, setMax] = React.useState(0); // maximum pirate amount
    const [buildButtonEnabled, setBuildButtonEnabled] = React.useState(false); // whether the build button is enabled, if we're within min/max to do so

    const maxBet = getMaxBet(roundState.currentSelectedRound);

    const handleChange = (arenaIndex, pirateIndex) => {
        let newPirateIndices = cloneArray(pirateIndices);
        newPirateIndices[arenaIndex] = pirateIndex;
        setPirateIndices(newPirateIndices);
    }

    useEffect(() => {
        recount();
    }, [pirateIndices]);

    const recount = () => {
        // count the amount of non-zero elements in pirateIndices
        let amount = pirateIndices.reduce((a, b) => a + (b !== 0 ? 1 : 0), 0);
        setBuildButtonEnabled(amount >= min && amount <= max);
    }

    const handleTenBetClick = () => {
        setMode('Ten-bet');
        // reset state
        setMin(1);
        setMax(3);
        setPirateIndices([0, 0, 0, 0, 0]);
        onOpen();
    }

    const handleGambitClick = () => {
        setMode('Gambit');
        // reset state
        setMin(5);
        setMax(5);
        setPirateIndices([0, 0, 0, 0, 0]);
        onOpen();
    }

    const handleBuildClick = () => {
        if (mode === 'Ten-bet') {
            const { bets, betAmounts } = tenbetSet(pirateIndices);
            addNewSet(`Custom Ten-bet Set (${maxBet} NP)`, bets, betAmounts, true);
        } else if (mode === 'Gambit') {
            const { bets, betAmounts } = gambitWithPirates(pirateIndices);

            addNewSet(`Custom Gambit Set (${maxBet} NP)`, bets, betAmounts, true);
        }
        onClose();
    }

    return (
        <>
            <Menu>
                <MenuButton
                    as={Button}
                    leftIcon={<Icon as={FaShapes} />}
                    rightIcon={
                        <Icon
                            as={FaChevronDown}
                            w="0.75em"
                            h="0.75em"
                        />
                    }
                    aria-label="Generate New Bet Set">
                    Build set
                </MenuButton>
                <MenuList>
                    <MenuItem onClick={handleGambitClick}>
                        Gambit set
                    </MenuItem>
                    <MenuItem onClick={handleTenBetClick}>
                        Ten-bet set
                    </MenuItem>
                </MenuList>
            </Menu>

            <Modal isCentered
                size="2xl"
                isOpen={isOpen}
                onClose={onClose}
                motionPreset='slideInBottom'>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Custom {mode} builder</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <HStack>
                            {[...Array(5)].map((_e, arenaIndex) => {
                                return (
                                    <PirateSelect
                                        arenaId={arenaIndex}
                                        pirateValue={pirateIndices[arenaIndex]}
                                        getPirateBgColor={getPirateBgColor}
                                        onChange={(e) =>
                                            handleChange(arenaIndex, parseInt(e.target.value))
                                        }
                                    />
                                );
                            })}
                        </HStack>
                    </ModalBody>
                    <ModalFooter>
                        <Flex width="2xl">
                            <Button
                                leftIcon={<Icon as={FaRandom} />}
                                mr={3}
                                onClick={() => {
                                    // generate a full set of random indices
                                    let newIndices = [
                                        generateRandomPirateIndex(),
                                        generateRandomPirateIndex(),
                                        generateRandomPirateIndex(),
                                        generateRandomPirateIndex(),
                                        generateRandomPirateIndex()
                                    ];

                                    // remove random indices as needed
                                    if (max - min > 0) {
                                        let indices = [0, 1, 2, 3, 4];
                                        shuffleArray(indices);
                                        let rand = generateRandomIntegerInRange(max - min, max + min);
                                        let randomIndices = indices.slice(0, rand);
                                        // set these indices to 0
                                        randomIndices.forEach((index) => {
                                            newIndices[index] = 0;
                                        });
                                    }

                                    // this allows us to stay within the boundaries without having per-algorithm functions to do this

                                    setPirateIndices(newIndices);
                                }}>
                                Randomize
                            </Button>
                            {
                                pirateIndices.some((e) => e !== 0) && (
                                    <Button
                                        leftIcon={<Icon as={FaTrash} />}
                                        onClick={() => { setPirateIndices([0, 0, 0, 0, 0]) }}>
                                        Clear
                                    </Button>
                                )
                            }
                            <Spacer />
                            <Button
                                disabled={!buildButtonEnabled}
                                variant="solid"
                                colorScheme='blue'
                                mr={3}
                                onClick={() => { handleBuildClick() }}>
                                Build {mode} set
                            </Button>
                            <Button variant="solid" onClick={onClose}>Cancel</Button>
                        </Flex>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}

const BetFunctions = (props) => {

    const { blue, orange, red, green, yellow, gray, getPirateBgColor, ...rest } = props;
    const { roundState, setRoundState, calculations } = useContext(RoundContext);
    const { probabilities, arenaRatios } = calculations;
    const [currentBet, setCurrentBet] = useState("0");

    const [allNames, setAllNames] = useState({ 0: "Starting Set" });
    const [allBets, setAllBets] = useState({ 0: { ...roundState.bets } });
    const [allBetAmounts, setAllBetAmounts] = useState({
        0: { ...roundState.betAmounts },
    });

    const getNewIndex = () =>
        (parseInt(Object.keys(allBets).slice(-1)[0]) + 1).toString();

    const winningPiratesBinary = computePiratesBinary(
        roundState.roundData?.winners || [0, 0, 0, 0, 0]
    );

    const positiveArenas = arenaRatios.filter((x) => x > 0).length;

    class BetsMaker {
        #odds;
        #probs;

        constructor() {
            this.#odds = getOdds(roundState);
            this.#probs = getProbs(roundState) || probabilities.std;
        }

        calculate(...pirates) {
            const maxBet = getMaxBet(roundState.currentSelectedRound);
            let betCaps = {};
            let betOdds = {};
            let pirateCombos = {};

            for (let p of cartesian(...pirates)) {
                const [a, b, c, d, e] = p;
                const betBinary = computePiratesBinary(p);

                if (betBinary === 0) {
                    // empty bet, SKIP!
                    continue;
                }

                const totalOdds =
                    this.#odds[0][a] *
                    this.#odds[1][b] *
                    this.#odds[2][c] *
                    this.#odds[3][d] *
                    this.#odds[4][e];
                const winChance =
                    this.#probs[0][a] *
                    this.#probs[1][b] *
                    this.#probs[2][c] *
                    this.#probs[3][d] *
                    this.#probs[4][e];
                const betCap = Math.ceil(1_000_000 / totalOdds);
                const winnings = Math.min(maxBet * totalOdds, 1_000_000);

                betCaps[betBinary] = betCap;
                betOdds[betBinary] = totalOdds;
                if (maxBet >= 50) {
                    // Net expected
                    const maxCap = Math.min(betCap, maxBet);
                    pirateCombos[betBinary] =
                        ((winChance * winnings) / maxCap - 1) * maxCap;
                } else {
                    // Expected return
                    pirateCombos[betBinary] = totalOdds * winChance;
                }
            }

            return { betCaps, betOdds, pirateCombos };
        }
    }

    useEffect(() => {
        // TODO: (maybe fix?) when you switch between sets, this has the side effect of updating itself again here one time
        setAllBets({ ...allBets, [currentBet]: { ...roundState.bets } });
        setAllBetAmounts({
            ...allBetAmounts,
            [currentBet]: { ...roundState.betAmounts },
        });
    }, [roundState.bets, roundState.betAmounts]);

    useEffect(() => {
        // Erase set names when selected round number changes
        setAllNames({ 0: "Starting Set" });
        setAllBets({ 0: { ...roundState.bets } });
    }, [roundState.currentSelectedRound]);

    function addNewSet(name, bets, betAmounts, maybe_replace = false) {
        // will modify the current set if the current set is empty and maybe_replace is explicitly set to true
        const newIndex =
            maybe_replace && !anyBetsExist(roundState.bets)
                ? currentBet
                : getNewIndex();

        const clonedBets = cloneArray(bets);
        const clonedBetAmounts = cloneArray(betAmounts);

        setAllNames({ ...allNames, [newIndex]: name });
        setAllBets({ ...allBets, [newIndex]: clonedBets });
        setAllBetAmounts({ ...allBetAmounts, [newIndex]: clonedBetAmounts });
        setRoundState({
            bets: { ...clonedBets },
            betAmounts: { ...clonedBetAmounts },
        });
        setCurrentBet(newIndex);
    }

    function newEmptySet() {
        const amountOfBets = Object.keys(allBets[currentBet]).length;
        addNewSet(
            "New Set",
            makeEmptyBets(amountOfBets),
            makeEmptyBetAmounts(amountOfBets)
        );
    }

    function cloneSet() {
        addNewSet(
            `${allNames[currentBet]} (Clone)`,
            allBets[currentBet],
            allBetAmounts[currentBet]
        );
    }

    function deleteSet() {
        const currentIndex = Object.keys(allBets).indexOf(currentBet);
        let useIndex = currentIndex - 1;
        if (useIndex < 0) {
            useIndex = currentIndex + 1;
        }

        if (Object.keys(allBets).length === 1) {
            useIndex = 0;
        }
        const previousElement = Object.keys(allBets)[useIndex];

        const allBetsCopy = { ...allBets };
        const allBetAmountsCopy = { ...allBetAmounts };
        const allNamesCopy = { ...allNames };

        delete allBetsCopy[currentBet];
        delete allBetAmountsCopy[currentBet];
        delete allNamesCopy[currentBet];

        if (Object.keys(allBetsCopy).length === 0) {
            allBetsCopy[currentBet] = makeEmptyBets(10);
            allBetAmountsCopy[currentBet] = makeEmptyBetAmounts(10);
            allNamesCopy[currentBet] = "Starting Set";
        }

        setAllBets({ ...allBetsCopy });
        setAllBetAmounts({ ...allBetAmountsCopy });
        setAllNames({ ...allNamesCopy });
        setRoundState({
            bets: { ...allBetsCopy[previousElement] },
            betAmounts: { ...allBetAmountsCopy[previousElement] },
        });
        setCurrentBet(previousElement);
    }

    function merSet() {
        const maxBet = getMaxBet(roundState.currentSelectedRound);

        const maker = new BetsMaker();
        const { betCaps, pirateCombos } = maker.calculate(
            [0, 1, 2, 3, 4],
            [0, 1, 2, 3, 4],
            [0, 1, 2, 3, 4],
            [0, 1, 2, 3, 4],
            [0, 1, 2, 3, 4]
        );

        let topRatios = Object.entries(pirateCombos).map(([k, v]) => [k, v]);
        topRatios.sort((a, b) => b[1] - a[1]);

        let newBets = {};
        let newBetAmounts = {};
        for (let bet = 0; bet < Object.keys(roundState.bets).length; bet++) {
            const pirateBinary = topRatios[bet][0];
            newBets[bet + 1] = computeBinaryToPirates(pirateBinary);
            newBetAmounts[bet + 1] = determineBetAmount(
                maxBet,
                betCaps[pirateBinary]
            );
        }

        addNewSet(`Max TER Set (${maxBet} NP)`, newBets, newBetAmounts, true);
    }

    function tenbetSet(tenbetIndices) {
        const maxBet = getMaxBet(roundState.currentSelectedRound);
        const tenbetBinary = computePiratesBinary(tenbetIndices);

        const maker = new BetsMaker();
        const { betCaps, pirateCombos } = maker.calculate(
            [0, 1, 2, 3, 4],
            [0, 1, 2, 3, 4],
            [0, 1, 2, 3, 4],
            [0, 1, 2, 3, 4],
            [0, 1, 2, 3, 4]
        );

        let topRatios = Object.entries(pirateCombos).map(([k, v]) => [k, v]);
        topRatios.sort((a, b) => b[1] - a[1]);

        let bets = {};
        let betAmounts = {};
        let bet = 0;
        while (Object.keys(bets).length < Object.keys(roundState.bets).length) {
            const pirateBinary = topRatios[bet][0];
            if ((pirateBinary & tenbetBinary) == tenbetBinary) {
                const index = Object.keys(bets).length + 1;

                bets[index] = computeBinaryToPirates(
                    pirateBinary
                );

                betAmounts[index] = determineBetAmount(
                    maxBet,
                    betCaps[pirateBinary]
                );
            }
            bet += 1;
        }
        return { bets, betAmounts };
    }

    function gambitSet() {
        const maxBet = getMaxBet(roundState.currentSelectedRound);

        const maker = new BetsMaker();
        const { pirateCombos } = maker.calculate(
            [1, 2, 3, 4],
            [1, 2, 3, 4],
            [1, 2, 3, 4],
            [1, 2, 3, 4],
            [1, 2, 3, 4]
        );

        let topRatios = Object.entries(pirateCombos).map(([k, v]) => [k, v]);
        topRatios.sort((a, b) => b[1] - a[1]);

        // get best full bet
        const best = computeBinaryToPirates(topRatios[0][0]);

        // generate a set based on those 5 pirates
        const { bets, betAmounts } = gambitWithPirates(best);

        addNewSet(`Gambit Set (${maxBet} NP)`, bets, betAmounts, true);
    }

    function bustproofSet() {
        const maxBet = getMaxBet(roundState.currentSelectedRound);
        const maker = new BetsMaker();
        const { betOdds } = maker.calculate(
            [0, 1, 2, 3, 4],
            [0, 1, 2, 3, 4],
            [0, 1, 2, 3, 4],
            [0, 1, 2, 3, 4],
            [0, 1, 2, 3, 4]
        );

        let bets = makeEmptyBets(10);
        let betAmounts = makeEmptyBetAmounts(10);

        // reverse it, because it's least -> greatest
        const bestArenas = sortedIndices(arenaRatios).reverse();
        const [bestArena, secondBestArena, thirdBestArena] = bestArenas;

        function getBestPirates(arenaIndex) {
            return sortedIndices(
                roundState.roundData.currentOdds[arenaIndex]
            ).reverse();
        }

        if (positiveArenas === 1) {
            // If only one arena is positive, we place 1 bet on each of the pirates of that arena. Total bets = 4.

            for (let x = 1; x < 5; x++) {
                bets[x][bestArena] = x;
            }
        } else if (positiveArenas === 2) {
            // If two arenas are positive, we place 1 bet on each of the three worst pirates of the best arena and
            // 1 bet on each of the pirates of the second arena + the best pirate of the best arena. Total bets = 7

            const bestPiratesInBestArena = getBestPirates(bestArena);

            const [
                fourthBestInBest,
                thirdBestInBest,
                secondBestInBest,
                bestInBest,
            ] = bestPiratesInBestArena;

            bets[1][bestArena] = secondBestInBest;
            bets[2][bestArena] = thirdBestInBest;
            bets[3][bestArena] = fourthBestInBest;

            for (let x = 1; x < 5; x++) {
                bets[x + 3][bestArena] = bestInBest;
                bets[x + 3][secondBestArena] = x;
            }
        } else {
            // If three arenas are positive, we place 1 bet on each of the three worst pirates of the best arena,
            // If four or more arenas are positive, we only play the three best arenas, seen below
            // 1 bet on each of the three worst pirates of the second arena + the best pirate of the best arena,
            // and 1 bet on each of the pirates of the third arena + the best pirate of the best arena + the best pirate
            // of the second arena. Total bets = 10.

            const bestPiratesInBestArena = getBestPirates(bestArena);

            const [
                fourthBestInBest,
                thirdBestInBest,
                secondBestInBest,
                bestInBest,
            ] = bestPiratesInBestArena;

            bets[1][bestArena] = secondBestInBest;
            bets[2][bestArena] = thirdBestInBest;
            bets[3][bestArena] = fourthBestInBest;

            //

            const bestPiratesInSecondBestArena =
                getBestPirates(secondBestArena);

            for (let [index, value] of bestPiratesInSecondBestArena
                .slice(0, 3)
                .entries()) {
                bets[index + 4][bestArena] = bestInBest;
                bets[index + 4][secondBestArena] = value;
            }

            //
            const bestInSecondBest = bestPiratesInSecondBestArena[3];

            for (let x = 1; x < 5; x++) {
                bets[x + 6][bestArena] = bestInBest;
                bets[x + 6][secondBestArena] = bestInSecondBest;
                bets[x + 6][thirdBestArena] = x;
            }
        }

        // make per-bet maxbets
        if (maxBet >= 50) {
            let odds = [];
            let bins = [];
            for (const pirates of Object.values(bets)) {
                let bin = computePiratesBinary(pirates);
                if (bin === 0) {
                    continue;
                }
                odds.push(betOdds[bin]);
                bins.push(bin);
            }

            let lowestOdds = Math.min(...odds);

            for (let [index, value] of bins.entries()) {
                betAmounts[index + 1] = Math.floor(
                    (maxBet * lowestOdds) / betOdds[value]
                );
            }
        }

        addNewSet(
            `Bustproof Set (round ${roundState.currentSelectedRound})`,
            bets,
            betAmounts,
            true
        );
    }

    function winningGambitSet() {
        if (winningPiratesBinary === 0) {
            return;
        }

        // generate a set based on winning pirates
        const { bets } = gambitWithPirates(roundState.roundData.winners);

        // don't use bet amounts here since this round is definitely over, so this set is just for show really
        const betAmounts = makeEmptyBetAmounts(Object.keys(bets).length);

        addNewSet(
            `Winning Gambit Set (round ${roundState.currentSelectedRound})`,
            bets,
            betAmounts,
            true
        );
    }

    function gambitWithPirates(pirates) {
        const maxBet = getMaxBet(roundState.currentSelectedRound);
        const maker = new BetsMaker();
        const { betCaps, betOdds } = maker.calculate(
            [0, pirates[0]],
            [0, pirates[1]],
            [0, pirates[2]],
            [0, pirates[3]],
            [0, pirates[4]]
        );

        let topRatios = Object.entries(betOdds).map(([k, v]) => [k, v]);
        topRatios.sort((a, b) => b[1] - a[1]);

        let bets = {};
        let betAmounts = {};
        for (let bet = 0; bet < Object.keys(roundState.bets).length; bet++) {
            const pirateBinary = topRatios[bet][0];
            bets[bet + 1] = computeBinaryToPirates(pirateBinary);
            betAmounts[bet + 1] = determineBetAmount(
                maxBet,
                betCaps[pirateBinary]
            );
        }

        return { bets, betAmounts };
    }

    function randomCrazySet() {
        const maxBet = getMaxBet(roundState.currentSelectedRound);

        const maker = new BetsMaker();
        const { betCaps, betOdds } = maker.calculate(
            [1, 2, 3, 4],
            [1, 2, 3, 4],
            [1, 2, 3, 4],
            [1, 2, 3, 4],
            [1, 2, 3, 4]
        );

        let allFullBets = Object.keys(betOdds);
        shuffleArray(allFullBets);

        let newBets = {};
        let newBetAmounts = {};
        for (let bet = 0; bet < Object.keys(roundState.bets).length; bet++) {
            const pirateBinary = allFullBets[bet];
            newBets[bet + 1] = computeBinaryToPirates(pirateBinary);
            newBetAmounts[bet + 1] = determineBetAmount(
                maxBet,
                betCaps[pirateBinary]
            );
        }

        addNewSet(`Crazy Set (${maxBet} NP)`, newBets, newBetAmounts, true);
    }

    return (
        <SettingsBox bgColor={gray} mt={4} {...rest}>
            <Stack p={4}>
                <Wrap>
                    <WrapItem>
                        <ButtonGroup size="sm" isAttached variant="outline">
                            <Button
                                leftIcon={<Icon as={FaPlus} />}
                                aria-label=""
                                onClick={newEmptySet}
                            >
                                New set
                            </Button>

                            <Button
                                leftIcon={<Icon as={FaCopy} />}
                                aria-label="Clone Current Bet Set"
                                onClick={cloneSet}
                            >
                                Clone
                            </Button>

                            <Button
                                leftIcon={<Icon as={FaTrash} />}
                                aria-label="Delete Current Bet Set"
                                onClick={deleteSet}
                            >
                                {Object.keys(allBets).length === 1 ? "Clear" : "Delete"}
                            </Button>
                        </ButtonGroup>
                    </WrapItem>

                    <WrapItem>
                        <ButtonGroup size="sm" isAttached variant="outline">
                            <Menu>
                                <MenuButton
                                    as={Button}
                                    leftIcon={<Icon as={FaMagic} />}
                                    rightIcon={
                                        <Icon
                                            as={FaChevronDown}
                                            w="0.75em"
                                            h="0.75em"
                                        />
                                    }
                                    aria-label="Generate New Bet Set"
                                >
                                    Generate set
                                </MenuButton>
                                <MenuList>
                                    <MenuItem onClick={merSet}>
                                        Max TER set
                                    </MenuItem>
                                    <MenuItem onClick={gambitSet}>
                                        Gambit set
                                    </MenuItem>
                                    <MenuItem
                                        hidden={winningPiratesBinary === 0}
                                        onClick={winningGambitSet}
                                    >
                                        Winning Gambit set
                                    </MenuItem>
                                    <MenuItem onClick={randomCrazySet}>
                                        Random Crazy set
                                    </MenuItem>
                                    <MenuItem
                                        onClick={bustproofSet}
                                        isDisabled={positiveArenas === 0}
                                    >
                                        Bustproof Set
                                    </MenuItem>
                                </MenuList>
                            </Menu>

                            <BuildSetMenu
                                addNewSet={addNewSet}
                                gambitWithPirates={gambitWithPirates}
                                getPirateBgColor={getPirateBgColor}
                                tenbetSet={tenbetSet}
                            />

                        </ButtonGroup>
                    </WrapItem>
                </Wrap>

                <Wrap>
                    {Object.keys(allBets).map((e) => {
                        return (
                            <WrapItem key={e}>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    isActive={e === currentBet}
                                    onClick={() => {
                                        setCurrentBet(e);
                                        setRoundState({
                                            bets: { ...allBets[e] },
                                            betAmounts: { ...allBetAmounts[e] },
                                        });
                                    }}
                                >
                                    {e === currentBet ? (
                                        <Editable
                                            value={allNames[e]}
                                            onChange={(value) =>
                                                setAllNames({
                                                    ...allNames,
                                                    [currentBet]: value,
                                                })
                                            }
                                            onBlur={(e) => {
                                                let name = e.target.value;
                                                if (name === "") {
                                                    name = "Unnamed Set";
                                                }
                                                setAllNames({
                                                    ...allNames,
                                                    [currentBet]: name,
                                                });
                                            }}
                                        >
                                            <EditablePreview />
                                            <EditableInput />
                                        </Editable>
                                    ) : (
                                        <Text>{allNames[e]}</Text>
                                    )}
                                </Button>
                            </WrapItem>
                        );
                    })}
                </Wrap>
            </Stack>
        </SettingsBox>
    );
};

export default BetFunctions;
