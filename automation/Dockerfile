FROM ghcr.io/astral-sh/uv:python3.9-bookworm-slim
# py3.9 because of collections.Iterable

ENV PYTHONUNBUFFERED=1

# copy the app
COPY . /app
WORKDIR /app
