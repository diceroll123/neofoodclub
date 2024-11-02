#!/bin/sh -e

rm -rf ./output
mkdir ./output
uv sync
uv run grab_rounds.py
uv run preprocessing.py
uv run final.py
