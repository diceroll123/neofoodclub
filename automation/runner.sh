#!/bin/sh -e

rm -rf ./output
mkdir ./output
uv run grab_rounds.py
uv run preprocessing.py
uv run final.py
