set -ex

sh /etc/init.d/xvfb start &

for i in 1 2 3 4 5 6 7 8 9
do
    xdpyinfo >/dev/null 2>&1
    if [ $? -eq 0 ]; then
        break
    fi
    sleep 0.5
done


if [[ ! -z $TOXENV ]]; then
  . jdk_switcher.sh && jdk_switcher use oraclejdk8
  ./go py_prep_for_install_release
fi
