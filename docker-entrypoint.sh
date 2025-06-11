#!/bin/sh
set -e

USER_ID="${UID:-1000}"
GROUP_ID="${GID:-1000}"

# create group if it doesn't exist
if ! getent group billy >/dev/null 2>&1; then
    addgroup --gid "$GROUP_ID" billy
fi

# create user if it doesn't exist
if ! id -u billy >/dev/null 2>&1; then
    adduser --disabled-password --gecos "" --uid "$USER_ID" --gid "$GROUP_ID" billy
fi

chown -R billy:billy /app

exec gosu billy "$@"
