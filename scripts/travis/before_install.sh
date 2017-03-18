set -ex

if [[ ! -z $TOXENV ]]; then
  sudo apt-get update
  sudo apt-get install oracle-java8-installer
  curl -O https://raw.githubusercontent.com/michaelklishin/jdk_switcher/master/jdk_switcher.sh
fi
