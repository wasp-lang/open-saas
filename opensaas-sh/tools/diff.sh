#!/usr/bin/env bash

TOOLS_DIR=$(dirname "$(realpath "$0")")  # Assumes this script is in `tools/`.
cd "${TOOLS_DIR}" && cd ../..

rm -rf opensaas-sh/app_diff
"${TOOLS_DIR}/dope.sh" template/app opensaas-sh/app diff
