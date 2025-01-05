# Get the directory of the current script
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Change to the script's directory
cd "$DIR"

# Build/run the docker container
docker compose run --rm nfc_values

# copy file from ./output/javascript.js to ../src/app/constants_logit.js
cp "$DIR/output/javascript.js" "$DIR/../src/app/constants_logit.js"

# stage the changes
git add "$DIR/output/"
git add "$DIR/raw_json/"
git add "$DIR/../src/app/constants_logit.js"

# check if the files exist before committing or pushing
if [ ! -f "$DIR/output/javascript.js" ]; then
    exit 1
fi

# commit the changes
git commit -m "Auto-update logit constants"

# push the changes
git push
