# Build/run the docker container
docker compose run --rm nfc_values

# copy file from ./output/javascript.js to ../src/app/constants_logit.js
cp ./output/javascript.js ../src/app/constants_logit.js

# stage the changes
git add ./output/
git add ./raw_json/
git add ../src/app/constants_logit.js

# check if the files exist before committing or pushing
if [ ! -f ./output/javascript.js ]; then
    exit 1
fi

# commit the changes
git commit -m "Auto-update logit constants"

# push the changes
git push
