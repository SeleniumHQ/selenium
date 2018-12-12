set -ex

if [[ ! -z $TOXENV ]]; then
  . jdk_switcher.sh && jdk_switcher use oraclejdk8
fi

if [[ $TOXENV == *"remote"* ]]; then
  ./go selenium-server-standalone
fi

if [[ ! -z $TOXENV ]]; then
  tox -c python/tox.ini
fi

# Ordering matters here. We want rake tasks to run first
if [[ ! -z $TASK ]]; then
  ./go $TASK
fi

if [[ ! -z "$BUCK" ]]; then
  ./buckw $BUCK
fi
