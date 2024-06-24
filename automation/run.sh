# Build the docker container
docker build -t nfc_values .

# Run the docker container
docker run --rm -v $(pwd):/app nfc_values

# copy file from ./output/javascript.js to ../app/constants_logit.js
cp ./output/javascript.js ../app/constants_logit.js

# stage the changes
git add ./output/
git add ../app/constants_logit.js

# commit the changes
git commit -m "Auto-update logit constants"

# push the changes
git push
