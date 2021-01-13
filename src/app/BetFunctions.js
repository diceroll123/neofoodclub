import {
    Button,
    ButtonGroup,
    Editable,
    EditableInput,
    EditablePreview,
    Menu,
    MenuButton,
    MenuDivider,
    MenuGroup,
    MenuItem,
    MenuList,
    Portal,
    Stack,
    Text,
    Wrap,
    WrapItem
} from "@chakra-ui/react";
import React, {useEffect, useState} from "react";
import RoundContext from "./RoundState";
import {
    anyBetsExist,
    cloneArray,
    determineBetAmount,
    getMaxBet,
    makeEmptyBetAmounts,
    makeEmptyBets,
    shuffleArray
} from "./util";
import {computeBinaryToPirates, computePiratesBinary} from "./maths";
import {AddIcon, ChevronDownIcon, CopyIcon, DeleteIcon} from "@chakra-ui/icons";
import {SettingsBox} from "./TheTable";

const cartesian = (...a) => a.reduce((a, b) => a.flatMap(d => b.map(e => [d, e].flat())));

const BetsSaver = (props) => {
    const {probabilities, ...rest} = props;
    const {roundState, setRoundState} = React.useContext(RoundContext);
    const [currentBet, setCurrentBet] = useState("0");

    const [allNames, setAllNames] = useState({"0": "Starting Set"});
    const [allBets, setAllBets] = useState({"0": {...roundState.bets}});
    const [allBetAmounts, setAllBetAmounts] = useState({"0": {...roundState.betAmounts}});

    const getNewIndex = () => (parseInt(Object.keys(allBets).slice(-1)[0]) + 1).toString();

    const winningPiratesBinary = computePiratesBinary(roundState.roundData?.winners || [0, 0, 0, 0, 0]);

    class BetsMaker {
        #odds;
        #probs;

        constructor() {
            this.#odds = roundState.roundData.currentOdds;
            this.#probs = probabilities.std;

            if (roundState.tableMode === "normal" && roundState.advanced.bigBrain && roundState.advanced.customOddsMode) {
                this.#odds = roundState.customOdds;
                this.#probs = roundState.customProbs;
            }
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

                const totalOdds = this.#odds[0][a] * this.#odds[1][b] * this.#odds[2][c] * this.#odds[3][d] * this.#odds[4][e];
                const winChance = this.#probs[0][a] * this.#probs[1][b] * this.#probs[2][c] * this.#probs[3][d] * this.#probs[4][e];
                const betCap = Math.ceil(1_000_000 / totalOdds);
                const winnings = Math.min(maxBet * totalOdds, 1_000_000);

                betCaps[betBinary] = betCap;
                betOdds[betBinary] = totalOdds;
                if (maxBet >= 50) {
                    // Net expected
                    const maxCap = Math.min(betCap, maxBet);
                    pirateCombos[betBinary] = ((winChance * winnings / maxCap) - 1) * maxCap;
                } else {
                    // Expected return
                    pirateCombos[betBinary] = totalOdds * winChance;
                }
            }

            return {betCaps, betOdds, pirateCombos};
        }
    }

    useEffect(() => {
        // TODO: (maybe fix?) when you switch between sets, this has the side effect of updating itself again here one time
        const newBetObj = {};
        newBetObj[currentBet] = {...roundState.bets};

        const newAmountObj = {};
        newAmountObj[currentBet] = {...roundState.betAmounts};

        setAllBets({...allBets, ...newBetObj});
        setAllBetAmounts({...allBetAmounts, ...newAmountObj});
    }, [roundState.bets, roundState.betAmounts]);

    function addNewSet(name, bets, betAmounts, maybe_replace = false) {
        // will modify the current set if the current set is empty and maybe_replace is explicitly set to true
        const newIndex = maybe_replace && !anyBetsExist(roundState.bets) ? currentBet : getNewIndex();
        const newName = {};
        const newBet = {};
        const newAmount = {};
        newName[newIndex] = name;
        newBet[newIndex] = cloneArray(bets);
        newAmount[newIndex] = cloneArray(betAmounts);

        setAllNames({...allNames, ...newName});
        setAllBets({...allBets, ...newBet});
        setAllBetAmounts({...allBetAmounts, ...newAmount});
        setRoundState({
            bets: {...newBet[newIndex]},
            betAmounts: {...newAmount[newIndex]}
        });
        setCurrentBet(newIndex);
    }

    function newEmptySet() {
        const amountOfBets = Object.keys(allBets[currentBet]).length;
        addNewSet("New Set", makeEmptyBets(amountOfBets), makeEmptyBetAmounts(amountOfBets));
    }

    function cloneSet() {
        addNewSet(`${allNames[currentBet]} (Clone)`, allBets[currentBet], allBetAmounts[currentBet]);
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

        const allBetsCopy = {...allBets};
        const allBetAmountsCopy = {...allBetAmounts};
        const allNamesCopy = {...allNames};

        delete allBetsCopy[currentBet];
        delete allBetAmountsCopy[currentBet];
        delete allNamesCopy[currentBet];

        if (Object.keys(allBetsCopy).length === 0) {
            allBetsCopy[currentBet] = makeEmptyBets(10);
            allBetAmountsCopy[currentBet] = makeEmptyBetAmounts(10);
            allNamesCopy[currentBet] = "Starting Set";
        }

        setAllBets({...allBetsCopy});
        setAllBetAmounts({...allBetAmountsCopy});
        setAllNames({...allNamesCopy});
        setRoundState({
            bets: {...allBetsCopy[previousElement]},
            betAmounts: {...allBetAmountsCopy[previousElement]}
        });
        setCurrentBet(previousElement);
    }

    function merSet() {
        const maxBet = getMaxBet(roundState.currentSelectedRound);

        const maker = new BetsMaker();
        const {
            betCaps,
            pirateCombos
        } = maker.calculate([0, 1, 2, 3, 4], [0, 1, 2, 3, 4], [0, 1, 2, 3, 4], [0, 1, 2, 3, 4], [0, 1, 2, 3, 4]);

        let topRatios = Object.entries(pirateCombos).map(([k, v]) => [k, v]);
        topRatios.sort((a, b) => b[1] - a[1]);

        let newBets = {};
        let newBetAmounts = {};
        for (let bet = 0; bet < Object.keys(roundState.bets).length; bet++) {
            const pirateBinary = topRatios[bet][0];
            newBets[bet + 1] = computeBinaryToPirates(pirateBinary);
            newBetAmounts[bet + 1] = determineBetAmount(maxBet, betCaps[pirateBinary]);
        }

        addNewSet(`Max TER Set (${maxBet} NP)`, newBets, newBetAmounts, true);
    }

    function gambitSet() {
        const maxBet = getMaxBet(roundState.currentSelectedRound);

        const maker = new BetsMaker();
        const {pirateCombos} = maker.calculate([1, 2, 3, 4], [1, 2, 3, 4], [1, 2, 3, 4], [1, 2, 3, 4], [1, 2, 3, 4]);

        let topRatios = Object.entries(pirateCombos).map(([k, v]) => [k, v]);
        topRatios.sort((a, b) => b[1] - a[1]);

        // get best full bet
        const best = computeBinaryToPirates(topRatios[0][0]);

        // generate a set based on those 5 pirates
        const {bets, betAmounts} = gambitWithPirates(best);

        addNewSet(`Gambit Set (${maxBet} NP)`, bets, betAmounts, true);
    }

    function winningGambitSet() {
        if (winningPiratesBinary === 0) {
            return;
        }

        // generate a set based on winning pirates
        const {bets} = gambitWithPirates(roundState.roundData.winners);

        // don't use bet amounts here since this round is definitely over, so this set is just for show really
        const betAmounts = makeEmptyBetAmounts(Object.keys(bets).length);

        addNewSet(`Winning Gambit Set (round ${roundState.currentSelectedRound})`, bets, betAmounts, true);
    }

    function gambitWithPirates(pirates) {
        const maxBet = getMaxBet(roundState.currentSelectedRound);
        const maker = new BetsMaker();
        const {
            betCaps,
            betOdds
        } = maker.calculate([0, pirates[0]], [0, pirates[1]], [0, pirates[2]], [0, pirates[3]], [0, pirates[4]]);

        let topRatios = Object.entries(betOdds).map(([k, v]) => [k, v]);
        topRatios.sort((a, b) => b[1] - a[1]);

        let bets = {};
        let betAmounts = {};
        for (let bet = 0; bet < Object.keys(roundState.bets).length; bet++) {
            const pirateBinary = topRatios[bet][0];
            bets[bet + 1] = computeBinaryToPirates(pirateBinary);
            betAmounts[bet + 1] = determineBetAmount(maxBet, betCaps[pirateBinary]);
        }

        return {bets, betAmounts};
    }

    function randomCrazySet() {
        const maxBet = getMaxBet(roundState.currentSelectedRound);

        const maker = new BetsMaker();
        const {
            betCaps,
            betOdds
        } = maker.calculate([1, 2, 3, 4], [1, 2, 3, 4], [1, 2, 3, 4], [1, 2, 3, 4], [1, 2, 3, 4]);

        let allFullBets = Object.keys(betOdds);
        shuffleArray(allFullBets);

        let newBets = {};
        let newBetAmounts = {};
        for (let bet = 0; bet < Object.keys(roundState.bets).length; bet++) {
            const pirateBinary = allFullBets[bet];
            newBets[bet + 1] = computeBinaryToPirates(pirateBinary);
            newBetAmounts[bet + 1] = determineBetAmount(maxBet, betCaps[pirateBinary]);
        }

        addNewSet(`Crazy Set (${maxBet} NP)`, newBets, newBetAmounts, true);
    }

    return (
        <SettingsBox mt={4} {...rest}>
            <Stack p={4}>
                <Wrap>
                    {Object.keys(allBets).map((e) => {
                        return (
                            <WrapItem key={e}>
                                <Button size="sm"
                                        variant="outline"
                                        isActive={e === currentBet}
                                        onClick={() => {
                                            setCurrentBet(e);
                                            setRoundState({
                                                bets: {...allBets[e]},
                                                betAmounts: {...allBetAmounts[e]}
                                            });
                                        }}>
                                    {e === currentBet ?
                                        <Editable
                                            value={allNames[e]}
                                            onChange={(value) => {
                                                let newName = {};
                                                newName[currentBet] = value || "Unnamed Set";
                                                setAllNames({...allNames, ...newName});
                                            }}>
                                            <EditablePreview/>
                                            <EditableInput/>
                                        </Editable>
                                        : <Text>{allNames[e]}</Text>
                                    }
                                </Button>
                            </WrapItem>
                        )
                    })}
                </Wrap>
                <ButtonGroup size="sm" isAttached variant="outline">
                    <Menu>
                        <MenuButton as={Button}
                                    leftIcon={<AddIcon/>}
                                    rightIcon={<ChevronDownIcon/>}
                                    aria-label="Add New Bet Set">
                            New
                        </MenuButton>
                        <Portal>
                            <MenuList>
                                <MenuGroup>
                                    <MenuItem onClick={newEmptySet}>Empty set</MenuItem>
                                </MenuGroup>
                                <MenuDivider/>
                                <MenuGroup title="Generate a set">
                                    <MenuItem onClick={merSet}>Max TER set</MenuItem>
                                    <MenuItem onClick={gambitSet}>Gambit set</MenuItem>
                                    <MenuItem hidden={winningPiratesBinary === 0}
                                              onClick={winningGambitSet}>Winning Gambit set</MenuItem>
                                    <MenuItem onClick={randomCrazySet}>Random Crazy set</MenuItem>
                                </MenuGroup>
                                <MenuDivider/>
                                <MenuGroup title="Coming Soon">
                                    <MenuItem isDisabled>Bustproof set</MenuItem>
                                </MenuGroup>
                            </MenuList>
                        </Portal>
                    </Menu>

                    <Button leftIcon={<CopyIcon/>}
                            aria-label="Clone Current Bet Set"
                            onClick={cloneSet}>Clone</Button>
                    <Button leftIcon={<DeleteIcon/>}
                            aria-label="Delete Current Bet Set"
                            onClick={deleteSet}>{Object.keys(allBets).length === 1 ? "Clear" : "Delete"}</Button>
                </ButtonGroup>
            </Stack>
        </SettingsBox>
    );
}

export default BetsSaver;
