#!/usr/bin/env bash

TOOLS_DIR=$(dirname "$(realpath "$0")")  # Assumes this script is in `tools/`.
cd "${TOOLS_DIR}" && cd ../..

# Removes all files except for some gitignored files that we don't want to bother regenerating each time,
# like node_modules and certain .env files.
find opensaas-sh/app -mindepth 1 \( -path node_modules -o -name .env.server -o -name .env.me \) -prune -o -exec rm -rf {} +
"${TOOLS_DIR}/dope.sh" template/app opensaas-sh/app patch
