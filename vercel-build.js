const fs = require("fs");
const path = require("path");

// Get the git commit SHA from Vercel environment
const commitSha = process.env.VERCEL_GIT_COMMIT_SHA || "development";

// Create a .env file with the git commit SHA
fs.writeFileSync(
  path.join(process.cwd(), ".env"),
  `REACT_APP_VERCEL_GIT_COMMIT_SHA=${commitSha}\n`,
  { flag: "a" }
);

console.log(`Added git commit SHA (${commitSha}) to environment variables`);
