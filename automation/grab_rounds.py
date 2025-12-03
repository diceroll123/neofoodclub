# /// script
# requires-python = ">=3.12"
# dependencies = [
#     "requests",
# ]
# ///
from pathlib import Path

import requests

# directory where this script lives
SCRIPT_DIR = Path(__file__).resolve().parent
RAW_JSON_DIR = SCRIPT_DIR / "raw_json"

# grab the current round from the API
current_round = int(requests.get("https://cdn.neofood.club/current_round.txt").text)

# grab rounds that we don't have
limit = 90
previous_round = current_round - 1
while not (RAW_JSON_DIR / f"{previous_round}.json").exists():
    print(f"Grabbing round {previous_round}...")
    r = requests.get(f"https://cdn.neofood.club/rounds/{previous_round}.json")
    if r.status_code == 200:
        print(f"Saving round {previous_round}...")
        (RAW_JSON_DIR / f"{previous_round}.json").write_text(r.text)
    else:
        print(f"Round {previous_round} not found")

    # don't go too far back
    # shouldn't happen but it's a good idea to have a limit
    if previous_round < current_round - limit:
        break

    previous_round -= 1
