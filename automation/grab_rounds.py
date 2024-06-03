import time
from pathlib import Path

import requests

# grab the current round from the API
current_round = int(requests.get("https://foodclub.neocities.org/next_round.txt").text)

# grab rounds that we don't have
limit = 90
previous_round = current_round - 1
while not Path(f"./raw_json/{previous_round}.json").exists():
    print(f"Grabbing round {previous_round}...")
    r = requests.get(f"https://foodclub.neocities.org/rounds/{previous_round}.json")
    if r.status_code == 200:
        print(f"Saving round {previous_round}...")
        Path(f"./raw_json/{previous_round}.json").write_text(r.text)
    else:
        print(f"Round {previous_round} not found")

    time.sleep(0.5)

    # don't go too far back
    # shouldn't happen but it's a good idea to have a limit
    if previous_round < current_round - limit:
        break

    previous_round -= 1
