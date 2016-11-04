set -ex

sh /etc/init.d/xvfb start

if [[ ! -z $TOXENV ]]; then
  . jdk_switcher.sh && jdk_switcher use oraclejdk8
  ./go py_prep_for_install_release
fi
