import {
    Box,
    Divider,
    Icon,
    Text,
    HStack,
    Link,
    Tooltip,
} from "@chakra-ui/react";
import { FaGithub, FaCoffee } from "react-icons/fa";
import React from "react";

function FooterLink(props) {
    const { icon, href, label } = props;
    return (
        <Tooltip label={label} aria-label={label}>
            <Link href={href} isExternal>
                <Icon as={icon} fontSize="xl" color="gray.400" />
            </Link>
        </Tooltip>
    );
}

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

function Footer(props) {
    return (
        <Box as="footer" mb="3rem" mt={12} textAlign="center" {...props}>
            <Divider />
            <Box pt={6}>
                <Text fontSize="sm">
                    Made by{" "}
                    <Link href="https://github.com/diceroll123" isExternal>
                        diceroll123
                    </Link>
                </Text>
                <HStack m={4} spacing="12px" justify="center">
                    {links.map((link) => (
                        <FooterLink key={link.href} {...link} />
                    ))}
                </HStack>
                <Text fontSize="sm">
                    Website, design, and code © neofood.club
                </Text>
                <Text fontSize="sm">
                    This is an unofficial Neopets fansite with no
                    affiliation/endorsement with Neopets.
                </Text>
                <Text fontSize="sm">
                    © Neopets, Inc. All rights reserved. Used With Permission
                </Text>
            </Box>
        </Box>
    );
}

export default Footer;
