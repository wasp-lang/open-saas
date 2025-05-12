#!/usr/bin/env bash
#
# Diff Or Patch Executor
#
# Allows you to easily create a diff between the two projects (base and derived), or to patch those diffs onto the base project to get the derived one.
# Useful when derived project has only small changes on top of base project and you want to keep it in a dir in the same repo as main project.

# Determine the patch command to use based on OS
PATCH_CMD="patch"
if [[ "$(uname)" == "Darwin" ]]; then
    # On macOS, require gpatch to be installed
    if command -v gpatch &> /dev/null; then
        PATCH_CMD="gpatch"
    else
        echo "Error: GNU patch (gpatch) not found. On MacOS, this script requires GNU patch."
        echo "Install it with: brew install gpatch"
        exit 1
    fi
fi

# List all the source files in the specified dir.
# "Source" files are any files that are not gitignored.
list_source_files() {
    local dir=$1
    (cd "${dir}" && git ls-files --cached --others --exclude-standard | sort)
}

# Check if the required arguments are provided.
if [ "$#" -ne 3 ]; then
    echo "Usage: $0 <BASE_DIR> <DERIVED_DIR> <ACTION>"
    echo "<ACTION> should be either 'diff' to get the diff between the specified dirs or 'patch' to apply such existing diff onto base dir."
    exit 1
fi

BASE_DIR=$1
DERIVED_DIR=$2
ACTION=$3

DIFF_DIR="${DERIVED_DIR}_diff"
DIFF_DIR_DELETIONS="${DIFF_DIR}/deletions"

# Based on base dir and derived dir, creates a diff dir that contains the diff between the two dirs.
recreate_diff_dir() {
    mkdir -p "${DIFF_DIR}"

    # List all the source files in the base and derived dirs. We skip gitignored files.
    local BASE_FILES
    BASE_FILES=$(list_source_files "${BASE_DIR}") # File paths relative to the base dir.
    local DERIVED_FILES
    DERIVED_FILES=$(list_source_files "${DERIVED_DIR}") # File paths relative to the derived dir.

    # For each source file in the derived dir, generate a .diff file between it and the
    # corresponding source file in the base dir.
    while IFS= read -r filepath; do
        local derivedFilepath="${DERIVED_DIR}/${filepath}"
        local baseFilepath="${BASE_DIR}/${filepath}"

        local filepathToBeUsedAsBase="${baseFilepath}"
        # If the file is not one of the source files in base dir (e.g. is gitignored or doesn't exist),
        # then we set it to /dev/null to indicate it doesn't exist for our purposes.
        if ! echo "${BASE_FILES}" | grep -q "^${filepath}$"; then
            filepathToBeUsedAsBase="/dev/null"
        fi

        local DIFF_OUTPUT
        DIFF_OUTPUT=$(diff -Nu --label "${baseFilepath}" --label "${derivedFilepath}" "${filepathToBeUsedAsBase}" "${derivedFilepath}")
        if [ $? -eq 1 ]; then
            mkdir -p "${DIFF_DIR}/$(dirname "${filepath}")"
            echo "${DIFF_OUTPUT}" > "${DIFF_DIR}/${filepath}.diff"
            echo "Generated ${DIFF_DIR}/${filepath}.diff"
        fi
    done <<< "${DERIVED_FILES}"

    local FILES_ONLY_IN_BASE
    FILES_ONLY_IN_BASE=$(comm -23 <(echo "${BASE_FILES}") <(echo "${DERIVED_FILES}"))
    echo "${FILES_ONLY_IN_BASE}" > "${DIFF_DIR_DELETIONS}"

    echo "DONE: generated ${DIFF_DIR}/"
}

RED_COLOR='\033[0;31m'
GREEN_COLOR='\033[0;32m'
RESET_COLOR='\033[0m'

# Patches the diff dir onto the base dir to get the derived dir.
recreate_derived_dir() {
    mkdir -p "${DERIVED_DIR}"

    local BASE_FILES
    BASE_FILES=$(list_source_files "${BASE_DIR}") # File paths relative to the base dir.

    # Copy all the source files from the base dir over to the derived dir.
    while IFS= read -r filepath; do
        mkdir -p "${DERIVED_DIR}/$(dirname ${filepath})"
        cp "${BASE_DIR}/${filepath}" "${DERIVED_DIR}/${filepath}"
    done <<< "${BASE_FILES}"

    # For each .diff file in diff dir, apply the patch to the corresponding base file in the derived dir.
    #local num_patches_failed
    local num_patches_failed=0
    while IFS= read -r diff_filepath; do
        local derived_filepath
        derived_filepath="${diff_filepath#${DIFF_DIR}/}"
        derived_filepath="${derived_filepath%.diff}"

        local patch_output
        local patch_exit_code
        patch_output=$("${PATCH_CMD}" --no-backup-if-mismatch --merge "${DERIVED_DIR}/${derived_filepath}" < "${diff_filepath}")
        patch_exit_code=$?
        if [ ${patch_exit_code} -eq 0 ]; then
          echo "${patch_output}"
          echo -e "${GREEN_COLOR}[OK]${RESET_COLOR}"
        else
          echo "${patch_output}"
          echo -e "${RED_COLOR}[Failed with exit code ${patch_exit_code}]${RESET_COLOR}"
          num_patches_failed=$((num_patches_failed + 1))
        fi
        echo ""
    done < <(find "${DIFF_DIR}" -name "*.diff")

    # Delete any files that exist in the base dir but shouldn't exist in the derived dir.
    # TODO: also allow deletion of dirs.
    if [ -f "${DIFF_DIR_DELETIONS}" ]; then
        while IFS= read -r filepath; do
            local derived_dir_filepath
            local rm_exit_code
            derived_dir_filepath="${DERIVED_DIR}/${filepath}"
            rm "${derived_dir_filepath}"
            rm_exit_code=$?
            if [ ${rm_exit_code} -eq 0 ]; then
              echo "Deleted ${derived_dir_filepath}"
              echo -e "${GREEN_COLOR}[OK]${RESET_COLOR}"
            else
              echo "Failed to delete ${derived_dir_filepath}"
              echo -e "${RED_COLOR}[Failed with exit code ${rm_exit_code}]${RESET_COLOR}"
            fi
            echo ""
        done < "${DIFF_DIR_DELETIONS}"
    fi

    echo "DONE: generated ${DERIVED_DIR}/"

    if [ ${num_patches_failed} -gt 0 ]; then
        echo -e "${RED_COLOR}${num_patches_failed} patches failed, look into generated files for merge conflicts.${RESET_COLOR}"
        exit 1;
    else
        echo -e "${GREEN_COLOR}All patches successfully applied.${RESET_COLOR}"
    fi

}

if [ "$ACTION" == "diff" ]; then
    recreate_diff_dir
elif [ "$ACTION" == "patch" ]; then
    recreate_derived_dir
else
    echo "Invalid action specified. Use 'diff' to get a diff between specified dirs or 'patch' to patch the existing diff onto base dir."
    exit 1
fi
