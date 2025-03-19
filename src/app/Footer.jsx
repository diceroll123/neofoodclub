import {
    Box,
    Center,
    Stack,
    Text,
    Heading,
    Divider,
    Link,
    Container,
    useColorModeValue,
    SimpleGrid,
    Flex,
} from "@chakra-ui/react";
import React, { memo, useMemo } from "react";
import NeopointIcon from "./images/np-icon.svg";
import { VercelCredit } from "./components/VercelCredit";

const Logo = memo(function Logo() {
    return (
        <Stack direction="row">
            <Box as="img" src={NeopointIcon} height="1.5em" width="1.5em" />
            <Heading
                as="h1"
                fontFamily="heading"
                fontWeight="bold"
                fontSize="xl"
            >
                NeoFoodClub
            </Heading>
        </Stack>
    );
});

const ListHeader = memo(function ListHeader(props) {
    return (
        <Text fontWeight={"500"} fontSize={"lg"} mb={2}>
            {props.children}
        </Text>
    );
});

const KoFiButtion = memo(function KoFiButtion() {
    return (
        <>
            <Link href="https://ko-fi.com/dice" isExternal>
                <img
                    height="36"
                    style={{ border: "0px", height: "36px" }}
                    src="https://storage.ko-fi.com/cdn/kofi1.png?v=3"
                    border="0"
                    alt="Buy Me a Coffee at ko-fi.com"
                />
            </Link>
        </>
    );
});

const Footer = memo(function Footer() {
    const boxBg = useColorModeValue("gray.50", "gray.900");
    const boxColor = useColorModeValue("gray.700", "gray.200");
    const dividerBorderColor = useColorModeValue("gray.200", "gray.700");

    const columns = useMemo(() => ({ base: 1, sm: 2, md: 3 }), []);

    const beforeProps = useMemo(
        () => ({
            content: '""',
            borderBottom: "1px solid",
            borderColor: dividerBorderColor,
            flexGrow: 1,
            mr: 8,
        }),
        [dividerBorderColor]
    );

    const afterProps = useMemo(
        () => ({
            content: '""',
            borderBottom: "1px solid",
            borderColor: dividerBorderColor,
            flexGrow: 1,
            ml: 8,
        }),
        [dividerBorderColor]
    );

    const memoizedKoFiButton = useMemo(() => <KoFiButtion />, []);
    const memoizedLogo = useMemo(() => <Logo />, []);
    const memoizedVercelCredit = useMemo(() => <VercelCredit />, []);

    const memoizedFoodClubLinks = useMemo(
        () => (
            <Stack align={"flex-start"}>
                <ListHeader>Food Club Links</ListHeader>
                <Link
                    isExternal
                    href="https://www.neopets.com/pirates/foodclub.phtml?type=bet"
                >
                    Place Bets
                </Link>
                <Link
                    isExternal
                    href="https://www.neopets.com/pirates/foodclub.phtml?type=current_bets"
                >
                    Current Bets
                </Link>
                <Link
                    isExternal
                    href="https://www.neopets.com/pirates/foodclub.phtml?type=collect"
                >
                    Collect Winnings
                </Link>
                <Link
                    isExternal
                    href="https://www.neopets.com/gamescores.phtml?game_id=88"
                >
                    High Score List
                </Link>
            </Stack>
        ),
        []
    );

    const memoizedNeoFoodClubStuff = useMemo(
        () => (
            <Stack align={"flex-start"}>
                <ListHeader>NeoFoodClub Stuff</ListHeader>
                <Link isExternal href="https://foodclub.neocities.org/">
                    Classic NeoFoodClub
                </Link>
                <Link
                    isExternal
                    href="https://github.com/diceroll123/neofoodclub"
                >
                    Source Code
                </Link>
            </Stack>
        ),
        []
    );

    const memoizedSupportUs = useMemo(
        () => (
            <Stack align={"flex-start"}>
                <ListHeader>Support us</ListHeader>
                {memoizedKoFiButton}
            </Stack>
        ),
        [memoizedKoFiButton]
    );

    const memoizedFooterText = useMemo(
        () => (
            <Text pt={6} fontSize={"sm"} textAlign={"center"}>
                Website, design, and code &copy; neofood.club
                <br />
                This is an unofficial Neopets fansite with no
                affiliation/endorsement with Neopets.
                <br /> Images/Names &copy; Neopets, Inc. All rights reserved.
                Used With Permission
            </Text>
        ),
        []
    );

    return (
        <>
            <Divider />
            <Box bg={boxBg} color={boxColor}>
                <Container as={Stack} maxW={"6xl"} py={10}>
                    <SimpleGrid columns={columns} spacing={8}>
                        {memoizedFoodClubLinks}
                        {memoizedNeoFoodClubStuff}
                        {memoizedSupportUs}
                    </SimpleGrid>
                </Container>
                <Box py={10}>
                    <Flex
                        align={"center"}
                        _before={beforeProps}
                        _after={afterProps}
                    >
                        {memoizedLogo}
                    </Flex>
                    {memoizedFooterText}
                    <Center>{memoizedVercelCredit}</Center>
                </Box>
            </Box>
        </>
    );
});

export default Footer;
