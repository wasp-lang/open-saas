# Open SaaS Tools

This directory contains utilities for managing derived projects that are built on top of the Open SaaS template.

## dope.sh - Diff Or Patch Executor

The `dope.sh` script allows you to easily create a diff between two projects (base and derived), or to patch those diffs onto the base project to get the derived one. This is useful when a derived project has only small changes on top of the base project and you want to keep it in a directory in the same repo as the main project.

### Usage

```bash
./dope.sh <BASE_DIR> <DERIVED_DIR> <ACTION>
```

- `<BASE_DIR>`: The base project directory (e.g., `../template/`)
- `<DERIVED_DIR>`: The derived project directory (e.g., `app/`)
- `<ACTION>`: Either `diff` or `patch`
  - `diff`: Creates a diff between the base and derived directories
  - `patch`: Applies existing diffs onto the base directory to recreate the derived directory

### Workflow

Since derived apps (like opensaas-sh) are just the Open SaaS template with some small tweaks, and we want to keep them up to date as the template changes, we don't version the actual app code in git. Instead, we version the diffs between it and the template in an `app_diff/` directory.

The typical workflow is:

1. Run `dope.sh` with `patch` action to generate `app/` from `../template/` and `app_diff/`:
   ```bash
   ./dope.sh ../template app patch
   ```

2. If there are any conflicts (normally due to updates to the template), modify `app/` until you resolve them. Make any additional changes as needed.

3. Generate new `app_diff/` based on the current updated `app/` by running:
   ```bash
   ./dope.sh ../template app diff
   ```

### Running on MacOS

If you're running the `dope.sh` script on Mac, you need to install:

- `grealpath` (packaged within `coreutils`)
- `gpatch`
- `diffutils`

```sh
brew install coreutils  # contains grealpath
brew install gpatch
brew install diffutils
```

The script will automatically detect macOS and use `gpatch` instead of the default `patch` command.
