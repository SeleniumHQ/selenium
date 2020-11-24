set -ex

if [[ ! -z $CHROME ]]; then
  wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
  echo "deb http://dl.google.com/linux/chrome/deb/ stable main" | sudo tee -a /etc/apt/sources.list.d/google-chrome.list
  sudo apt-get update -qqy
  sudo apt-get -qqy install google-chrome-stable
  CHROME_VERSION=$(google-chrome-stable --version)
  CHROME_FULL_VERSION=${CHROME_VERSION%%.*}
  CHROME_MAJOR_VERSION=${CHROME_FULL_VERSION//[!0-9]}
  sudo rm /etc/apt/sources.list.d/google-chrome.list
  export CHROMEDRIVER_VERSION=`curl -s https://chromedriver.storage.googleapis.com/LATEST_RELEASE_${CHROME_MAJOR_VERSION%%.*}`
  curl -L -O "https://chromedriver.storage.googleapis.com/${CHROMEDRIVER_VERSION}/chromedriver_linux64.zip"
  unzip chromedriver_linux64.zip && chmod +x chromedriver && sudo mv chromedriver /usr/local/bin
fi

if [[ ! -z $MARIONETTE ]]; then
  GECKODRIVER_URL=`curl -Ls -o /dev/null -w %{url_effective} https://github.com/mozilla/geckodriver/releases/latest`
  GECKODRIVER_VERSION=`echo $GECKODRIVER_URL | sed 's#.*/##'`
  export GECKODRIVER_DOWNLOAD="https://github.com/mozilla/geckodriver/releases/download/$GECKODRIVER_VERSION/geckodriver-$GECKODRIVER_VERSION-linux64.tar.gz"
  curl -L -o geckodriver.tar.gz $GECKODRIVER_DOWNLOAD
  gunzip -c geckodriver.tar.gz | tar xopf -
  chmod +x geckodriver && sudo mv geckodriver /usr/local/bin
fi

if [[ ! -z $TOXENV ]]; then
  pip install setuptools==28.8.0 tox==2.4.1
fi

cat <<EOM >>.bazelrc.local
# Set up caching on local disk so incremental builds are faster
# See https://bazel.build/designs/2016/09/30/repository-cache.html
build --repository_cache=~/.cache/bazel-repo
test --repository_cache=~/.cache/bazel-repo
# See https://docs.bazel.build/versions/master/remote-caching.html#disk-cache
build --disk_cache=~/.cache/bazel-disk
test --disk_cache=~/.cache/bazel-disk"

# Make output easier to read
build --curses=no
build --color=no
build --show_timestamps

EOM


curl -L -o bazelisk "https://github.com/bazelbuild/bazelisk/releases/download/v1.3.0/bazelisk-linux-amd64"
chmod +x bazelisk && sudo mv bazelisk /usr/local/bin/bazel
