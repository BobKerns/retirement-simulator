#!/usr/bin/env bash

# This script is the entry point for the web server container.
#  It is responsible for setting up the environment,
# including the existence of the user and group, and then running
# the appropriate command.

export USER_ID="${USER_ID:?"USER_ID must be set to the www user's uid"}"
export GROUP_ID="${GROUP_ID:?"GROUP_ID must be set to the www group's gid"}"

prog="${1:-pnpm}"
shift
case "$1" in
    bash)
        prog="$1"
        shift
        ;;
    update-dependencies|up)
         jq -r '((.dependencies // {}| keys), (.devDependencies // {} | keys)) | .[]' \
            package.json \
          | {
            while read -r P; do
                echo "Installing $P"
                pnpm install "$P@latest"
            done
          }
          exit 0
        ;;
esac
if [ "$1" == 'bash' ]; then
    prog="$1"
    shift
fi
(
    /usr/sbin/groupmod --gid "$GROUP_ID" "pnpm" \
    && /usr/sbin/usermod --uid "$USER_ID" --gid "$GROUP_ID" "pnpm"
 ) || (1>&2 echo "Failed to set up pnpm user and group"; exit 1)
find /app /LOGS -maxdepth 1 -mindepth 1 ! -name '.ssh' -print \
    | while read -r d ; do
        chown -R "$USER_ID":"$GROUP_ID" "$d"
    done
chown "$USER_ID":"$GROUP_ID" /app || exit 2
chown "$USER_ID":"$GROUP_ID" /LOGS || exit 3
chown -R "$USER_ID":"$GROUP_ID" /usr/local/lib/pnpm || exit 3

exec su -pP pnpm -g pnpm -c "$prog $*" || exit 4
