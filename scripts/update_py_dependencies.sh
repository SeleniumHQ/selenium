#!/usr/bin/env bash
#
# This script updates the development dependencies used for the Python bindings.
#
# When you run it, it will:
# - create and activate a temporary virtual env
# - install the current package dependencies from `py/requirements.txt`
# - upgrade the package dependencies to the latest versions available on PyPI
# - run `pip freeze` to generate a new `py/requirements.txt` file
# - run `bazel run //py:requirements.update` to generate a new `py/requirements_lock.txt` file
# - deactivate and remove the temporary virtual env
#
# After running this script, you should also manually check package dependency versions in
# `py/pyproject.toml`, `py/tox.ini` and `py/BUILD.bazel`, and update those if needed.
#
# Once all dependencies are updated, create a new Pull Request with the changes.

set -e

REQUIREMENTS_FILE="./py/requirements.txt"
VENV="./temp_virtualenv"

cd "$(git rev-parse --show-toplevel)"

if [[ ! -f "${REQUIREMENTS_FILE}" ]]; then
    echo "can't find: ${REQUIREMENTS_FILE}"
    exit 1
fi

if [[ -d "${VENV}" ]]; then
    echo "${VENV} already exists"
    exit 1
fi

echo "creating virtual env: ${VENV}"
python3 -m venv "${VENV}"

echo "activating virtual env"
source "${VENV}/bin/activate"

echo "upgrading pip"
python -m pip install --upgrade pip > /dev/null

echo "installing dev dependencies from: ${REQUIREMENTS_FILE}"
pip install -r "${REQUIREMENTS_FILE}" > /dev/null

echo "upgrading outdated dependencies ..."
echo
pip list --outdated | while read -r line; do
    if [[ ! "${line}" =~ "Version Latest" && ! "${line}" =~ "----" ]]; then
        read -ra fields <<< "${line}"
        package="${fields[0]}"
        echo "upgrading ${package} from ${fields[1]} to ${fields[2]}"
        pip install --upgrade "${package}==${fields[2]}" > /dev/null
    fi
done

echo
echo "generating new ${REQUIREMENTS_FILE}"
pip freeze > "${REQUIREMENTS_FILE}"
# `pip freeze` doesn't show package "extras", so we explicitly add it here for urllib3
if [[ "${OSTYPE}" == "linux"* ]]; then
    sed -i "s/urllib3/urllib3[socks]/g" "${REQUIREMENTS_FILE}" # GNU sed
else
    sed -i "" "s/urllib3/urllib3[socks]/g" "${REQUIREMENTS_FILE}"
fi

echo "generating new lock file"
bazel run //py:requirements.update

echo
echo "deleting virtual env: ${VENV}"
deactivate
rm -rf "${VENV}"

echo
git status

echo
echo "done!"
