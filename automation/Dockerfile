FROM python:3.9-bookworm
# py3.9 because of collections.Iterable

COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

ENV PYTHONUNBUFFERED=1

# copy the app
COPY . /app
WORKDIR /app
