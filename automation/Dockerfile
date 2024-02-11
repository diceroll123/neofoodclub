FROM python:3.9-bookworm
# py3.9 because of collections.Iterable

# install requirements
COPY requirements.txt /tmp/requirements.txt
RUN pip install -r /tmp/requirements.txt

# copy the app
COPY . /app
WORKDIR /app

CMD rm -rf ./output && mkdir ./output && python -u grab_rounds.py && python preprocessing.py && python final.py
