const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

// Get the git commit SHA from Vercel environment
const commitSha = process.env.VERCEL_GIT_COMMIT_SHA || "development";

// Create a .env file with the git commit SHA
fs.writeFileSync(
  path.join(process.cwd(), ".env"),
  `REACT_APP_VERCEL_GIT_COMMIT_SHA=${commitSha}\n`,
  { flag: "a" }
);

console.log(`Added git commit SHA (${commitSha}) to environment variables`);

// Run vite build
const buildProcess = () => {
  return new Promise((resolve, reject) => {
    console.log("Starting Vite build...");
    exec("vite build", (error, stdout, stderr) => {
      if (error) {
        console.error(`Build error: ${error.message}`);
        reject(error);
        return;
      }
      if (stderr) {
        console.error(`Build stderr: ${stderr}`);
      }
      console.log(stdout);
      resolve();
    });
  });
};

// Run copy assets script
const copyAssetsProcess = () => {
  return new Promise((resolve, reject) => {
    console.log("Copying public assets...");
    exec("node copy-public-assets.js", (error, stdout, stderr) => {
      if (error) {
        console.error(`Copy assets error: ${error.message}`);
        reject(error);
        return;
      }
      if (stderr) {
        console.error(`Copy assets stderr: ${stderr}`);
      }
      console.log(stdout);
      resolve();
    });
  });
};

// Add react-scan if in preview environment
const addReactScan = () => {
  const isPreview = process.env.VERCEL_ENV === "preview";

  if (isPreview) {
    console.log(
      "Preview environment detected. Adding react-scan to index.html..."
    );

    const indexPath = path.join(process.cwd(), "build", "index.html");

    if (fs.existsSync(indexPath)) {
      let indexHtml = fs.readFileSync(indexPath, "utf8");

      // Check if react-scan is already in the file
      if (!indexHtml.includes("react-scan")) {
        indexHtml = indexHtml.replace(
          "</head>",
          '<script src="https://unpkg.com/react-scan/dist/auto.global.js"></script></head>'
        );

        fs.writeFileSync(indexPath, indexHtml);
        console.log("Successfully added react-scan to index.html");
      } else {
        console.log("react-scan already exists in index.html");
      }
    } else {
      console.error("build/index.html not found");
    }
  }
};

async function main() {
  try {
    await buildProcess();
    await copyAssetsProcess();
    addReactScan();
    console.log("Build completed successfully!");
  } catch (error) {
    console.error("Build process failed:", error);
    process.exit(1);
  }
}

main();
