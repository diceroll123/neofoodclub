#!/bin/sh -e

rm -rf ./output
mkdir ./output
python -u grab_rounds.py
python preprocessing.py
python final.py
