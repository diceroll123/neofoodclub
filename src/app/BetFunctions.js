import {
    Button,
    ButtonGroup,
    Editable,
    EditableInput,
    EditablePreview,
    Menu,
    MenuDivider,
    MenuGroup,
    MenuButton,
    MenuList,
    MenuItem,
    Portal,
    Stack,
    Text,
    Wrap,
    WrapItem
} from "@chakra-ui/react";
import React, {useEffect, useState} from "react";
import RoundContext from "./RoundState";
import {anyBetsExist, cloneArray, getMaxBet} from "./util";
import {computeBinaryToPirates, computePiratesBinary} from "./maths";
import {AddIcon, CopyIcon, DeleteIcon, ChevronDownIcon} from "@chakra-ui/icons";
import {SettingsBox} from "./TheTable";

const cartesian = (...a) => a.reduce((a, b) => a.flatMap(d => b.map(e => [d, e].flat())));

const BetsSaver = (props) => {
    const {probabilities, ...rest} = props;
    const {roundState, setRoundState} = React.useContext(RoundContext);
    const [currentBet, setCurrentBet] = useState("0");

    const [allNames, setAllNames] = useState({"0": "Starting Set"});
    const [allBets, setAllBets] = useState({"0": {...roundState.bets}});

    const getNewIndex = () => (parseInt(Object.keys(allBets).slice(-1)[0]) + 1).toString();

    useEffect(() => {
        // TODO: (maybe fix?) when you switch between sets, this has the side effect of updating itself again here one time
        const newObj = {};
        newObj[currentBet] = {...roundState.bets};
        setAllBets({...allBets, ...newObj});
    }, [roundState.bets]);

    function newEmptySet() {
        const newObj = {};
        const newName = {};
        const bets = {};
        const newIndex = getNewIndex();
        for (let index = 1; index <= Object.keys(allBets[currentBet]).length; index++) {
            bets[index] = [0, 0, 0, 0, 0];
        }
        newObj[newIndex] = {...bets};
        newName[newIndex] = "New Set";

        setAllNames({...allNames, ...newName});
        setAllBets({...allBets, ...newObj});
        setRoundState({bets: {...newObj[newIndex]}});
        setCurrentBet(newIndex);
    }

    function cloneSet() {
        const newObj = {};
        const newName = {};
        const newIndex = getNewIndex();
        newObj[newIndex] = cloneArray(allBets[currentBet]);
        newName[newIndex] = `${allNames[currentBet]} (Clone)`;

        setAllNames({...allNames, ...newName});
        setAllBets({...allBets, ...newObj});
        setRoundState({bets: {...newObj[newIndex]}});
        setCurrentBet(newIndex);
    }

    function deleteSet() {
        const currentIndex = Object.keys(allBets).indexOf(currentBet);
        let useIndex = currentIndex - 1;
        if (useIndex < 0) {
            useIndex = currentIndex + 1;
        }

        const previousElement = Object.keys(allBets)[useIndex];
        const allBetsCopy = {...allBets};
        const allNamesCopy = {...allNames};
        delete allBetsCopy[currentBet];
        delete allNamesCopy[currentBet];
        setAllBets({...allBetsCopy});
        setAllNames({...allNamesCopy});
        setRoundState({bets: {...allBetsCopy[previousElement]}});
        setCurrentBet(previousElement);
    }

    function merSet() {
        const maxBet = getMaxBet(roundState.currentSelectedRound);
        if (maxBet < 50) {
            alert("Add a max bet of 50+NP at the top of the page first!");
            return;
        }

        let betCaps = {};
        let pirateCombos = {};
        let topRatios = [];

        function calculateCombination(pirates) {
            const [a, b, c, d, e] = pirates;

            let odds = roundState.roundData.currentOdds;
            let probs = probabilities.std;

            if (roundState.tableMode === "normal" && roundState.advanced.bigBrain && roundState.advanced.customOddsMode) {
                odds = roundState.roundData.customOdds;
                probs = roundState.roundData.customProbs;
            }

            const totalOdds = odds[0][a] * odds[1][b] * odds[2][c] * odds[3][d] * odds[4][e];
            const winChance = probs[0][a] * probs[1][b] * probs[2][c] * probs[3][d] * probs[4][e];
            const betCap = Math.min(Math.floor(1_000_000 / totalOdds) + 1, maxBet);
            const winnings = Math.min(maxBet * totalOdds, 1_000_000);
            const betBinary = computePiratesBinary(pirates);

            betCaps[betBinary] = betCap;
            pirateCombos[betBinary] = ((winChance * winnings / betCap) - 1) * betCap;
        }

        for (let p of cartesian([0, 1, 2, 3, 4], [0, 1, 2, 3, 4], [0, 1, 2, 3, 4], [0, 1, 2, 3, 4], [0, 1, 2, 3, 4])) {
            calculateCombination(p);
        }

        for (let key in pirateCombos) {
            topRatios.push([key, pirateCombos[key]]);
        }
        topRatios.sort((a, b) => b[1] - a[1]);

        let newBets = {};
        let newBetAmounts = {};
        for (let bet = 0; bet < Object.keys(roundState.bets).length; bet++) {
            const pirateBinary = topRatios[bet][0];
            newBets[bet + 1] = computeBinaryToPirates(pirateBinary);
            newBetAmounts[bet + 1] = betCaps[pirateBinary];
        }

        // add new bet tab... if current tab isn't empty
        const newIndex = anyBetsExist(roundState.bets) ? getNewIndex() : currentBet;
        const newObj = {};
        const newName = {};
        newObj[newIndex] = {...newBets};
        newName[newIndex] = `Max TER Set (${maxBet} NP)`;

        setAllNames({...allNames, ...newName});
        setAllBets({...allBets, ...newObj});
        setRoundState({bets: {...newBets}, betAmounts: {...newBetAmounts}});
        setCurrentBet(newIndex);
    }

    return (
        <SettingsBox mt={4} {...rest}>
            <Stack p={4}>
                <Wrap>
                    {Object.keys(allBets).map((e) => {
                        return (
                            <WrapItem>
                                <Button size="sm"
                                        variant="outline"
                                        isActive={e === currentBet}
                                        onClick={() => {
                                            setCurrentBet(e);
                                            setRoundState({bets: {...allBets[e]}});
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
                                    <MenuItem isDisabled>Gambit set (Coming Soon)</MenuItem>
                                    <MenuItem isDisabled>Bustproof set (Coming Soon)</MenuItem>
                                    <MenuItem isDisabled>Random Crazy set (Coming Soon)</MenuItem>
                                </MenuGroup>
                            </MenuList>
                        </Portal>
                    </Menu>

                    <Button leftIcon={<CopyIcon/>}
                            aria-label="Clone Current Bet Set"
                            onClick={cloneSet}>Clone</Button>
                    <Button leftIcon={<DeleteIcon/>}
                            aria-label="Delete Current Bet Set"
                            isDisabled={Object.keys(allBets).length === 1}
                            onClick={deleteSet}>Delete</Button>
                </ButtonGroup>
            </Stack>
        </SettingsBox>
    );
}

export default BetsSaver;
