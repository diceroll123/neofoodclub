FROM ghcr.io/astral-sh/uv:python3.13-bookworm-slim

RUN apt-get update && apt-get install -y git

ENV PYTHONUNBUFFERED=1

# copy the app
COPY . /app
WORKDIR /app
