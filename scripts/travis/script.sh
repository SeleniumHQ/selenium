set -ex

if [[ $TOXENV == *"remote"* ]]; then
  ./go selenium-server-standalone
fi

if [[ ! -z $TOXENV ]]; then
  tox -c py/tox.ini
fi

if [[ ! -z $TASK ]]; then
  ./go $TASK
fi
