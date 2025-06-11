#!/bin/sh
set -e

USER_ID="${UID:-1000}"
GROUP_ID="${GID:-1000}"
USER_NAME="billy"

# create group with the desired GID if one doesn't already exist
if ! getent group "$GROUP_ID" >/dev/null 2>&1; then
    addgroup --gid "$GROUP_ID" "$USER_NAME"
fi

# create user if it doesn't exist
existing_user=$(getent passwd "$USER_ID" | cut -d: -f1 || true)
if [ -z "$existing_user" ]; then
    adduser --disabled-password --gecos "" --uid "$USER_ID" --gid "$GROUP_ID" "$USER_NAME"
    run_user="$USER_NAME"
else
    run_user="$existing_user"
fi

chown -R "$USER_ID":"$GROUP_ID" /app

exec gosu "$run_user" "$@"
