import {
    ButtonGroup,
    IconButton,
    Box,
    Stack,
    Text,
    Tooltip,
    Heading,
    Icon,
    Divider,
} from "@chakra-ui/react";
import * as React from "react";
import NeopointIcon from "./images/np-icon.svg";
import { FaGithub, FaCoffee } from "react-icons/fa";

const links = [
    {
        icon: FaCoffee,
        label: "Donate/Buy me a coffee",
        href: "https://paypal.me/diceroll123",
    },
    {
        icon: FaGithub,
        label: "GitHub",
        href: "https://github.com/diceroll123/neofoodclub",
    },
];

function Logo() {
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
}

const Copyright = (props) => (
    <Text fontSize="sm" {...props}>
        Website, design, and code &copy; neofood.club
        <br />
        This is an unofficial Neopets fansite with no affiliation/endorsement
        with Neopets.
        <br /> Images/Names &copy; Neopets, Inc. All rights reserved. Used With
        Permission
    </Text>
);

function FooterButton(props) {
    const { icon, href, label } = props;
    return (
        <Tooltip label={label} aria-label={label}>
            <IconButton
                as="a"
                href={href}
                fontSize="xl"
                icon={<Icon as={icon} />}
            />
        </Tooltip>
    );
}

function FooterButtons(props) {
    return (
        <ButtonGroup variant="ghost" color="gray.400" {...props}>
            {links.map((link) => (
                <FooterButton key={link.href} {...link} />
            ))}
        </ButtonGroup>
    );
}

function Footer(props) {
    return (
        <>
            <Divider pt={6} />
            <Box
                as="footer"
                role="contentinfo"
                mx="auto"
                maxW="7xl"
                py="12"
                px={{ base: "4", md: "8" }}
            >
                <Stack>
                    <Stack
                        direction="row"
                        spacing="4"
                        align="center"
                        justify="space-between"
                    >
                        <Logo />
                        <FooterButtons />
                    </Stack>
                    {<Copyright alignSelf={{ base: "center", sm: "start" }} />}
                </Stack>
            </Box>
        </>
    );
}

export default Footer;
