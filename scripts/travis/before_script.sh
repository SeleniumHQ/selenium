set -ex

if [[ "$TRAVIS_OS_NAME" == "linux" ]]; then
  sh /etc/init.d/xvfb start
fi

if [[ ! -z $TOXENV ]]; then
  ./go py_prep_for_install_release
fi
