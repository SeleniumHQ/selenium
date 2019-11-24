set -ex

# sh /etc/init.d/xvfb start

if [[ ! -z $TOXENV ]]; then	
  ./go py_prep_for_install_release	
fi
