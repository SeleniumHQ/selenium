set -ex

if [[ $TOXENV == *"remote"* ]]; then
  ./go selenium-server-standalone
fi

if [[ ! -z $TOXENV ]]; then
  tox -c py/tox.ini
fi

# Ordering matters here. We want rake tasks to run first
if [[ ! -z $TASK ]]; then
  ./go $TASK
fi

if [[ ! -z "$BUCK" ]]; then
  ./buckw $BUCK
fi

if [[ ! -z "$NPM" ]]; then
  ./go node:atoms
  cd javascript/node/selenium-webdriver; npm run $NPM
fi
