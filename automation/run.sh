#!/bin/bash
set -e

# Get the directory of the current script
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

# Ensure output directory exists
mkdir -p output

# Build and run the pipeline
docker compose build
docker compose run --rm pipeline

# check if the files exist before committing or pushing
if [ ! -f "$DIR/output/javascript.js" ]; then
    echo "Error: javascript.js was not generated"
    exit 1
fi

# Copy to frontend
cp "$DIR/output/javascript.js" "$DIR/../src/app/constants_logit.js"

# Stage and commit changes
git add "$DIR/output/" "$DIR/raw_json/" "$DIR/../src/app/constants_logit.js"
git commit -m "Auto-update logit constants"
git push
