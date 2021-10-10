import { Image, LinkOverlay, LinkBox } from "@chakra-ui/react";

export default function NoNeoNFTs(props) {
    return (
        <>
            <LinkBox px={4} pb={4}>
                <LinkOverlay href="http://www.jellyneo.net/nfts/" isExternal>
                    <Image src="./no-neo-nfts.png" />
                </LinkOverlay>
            </LinkBox>
        </>
    )
}