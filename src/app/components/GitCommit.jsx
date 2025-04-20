import { Box, Link, Text, Code } from "@chakra-ui/react";
import React from "react";

export function GitCommit() {
  const commitHash =
    process.env.REACT_APP_VERCEL_GIT_COMMIT_SHA || "development";
  const shortHash = commitHash.substring(0, 7);

  return (
    <Text fontSize="xs" color="gray.500">
      Commit:
      {commitHash !== "development" ? (
        <Link
          href={`https://github.com/diceroll123/neofoodclub/commit/${commitHash}`}
          isExternal
          ml={1}
        >
          <Code>{shortHash}</Code>
        </Link>
      ) : (
        <Box as="span" ml={1}>
          {shortHash}
        </Box>
      )}
    </Text>
  );
}
