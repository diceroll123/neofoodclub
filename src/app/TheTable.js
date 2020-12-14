import {SkeletonText, Box} from "@chakra-ui/react";

export default function TheTable() {
    return (
        <Box mt={8}>
            <SkeletonText noOfLines={40}/>
        </Box>
    )
}
