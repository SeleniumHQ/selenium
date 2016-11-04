if [[ ! -z $TOXENV ]]; then
  . jdk_switcher.sh && jdk_switcher use oraclejdk8
  ./go py_prep_for_install_release
fi

if [[ $TOXENV == *"remote"* ]]; then
  ./go selenium-server-standalone
fi

if [[ ! -z $TOXENV ]]; then
  tox
fi

if [[ ! -z $TASK ]]; then
  ./go $TASK
fi
