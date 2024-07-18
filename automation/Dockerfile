FROM python:3.9-bookworm
# py3.9 because of collections.Iterable

ADD --chmod=755 https://astral.sh/uv/install.sh /install.sh
RUN /install.sh && rm /install.sh

# install requirements
COPY requirements.txt /tmp/requirements.txt
RUN /root/.cargo/bin/uv pip install --system --no-cache -r /tmp/requirements.txt

# copy the app
COPY . /app
WORKDIR /app
