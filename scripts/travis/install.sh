set -ex

if [[ ! -z $CHROME ]]; then
  sudo apt-get -y purge chromium-browser
  export CHROME_REVISION=`curl -s http://commondatastorage.googleapis.com/chromium-browser-snapshots/Linux_x64/LAST_CHANGE`
  curl -L -O "http://commondatastorage.googleapis.com/chromium-browser-snapshots/Linux_x64/${CHROME_REVISION}/chrome-linux.zip"
  unzip chrome-linux.zip
  sudo ln -sf $PWD/chrome-linux/chrome-wrapper /usr/local/bin/chrome
  export CHROMEDRIVER_VERSION=`curl -s http://chromedriver.storage.googleapis.com/LATEST_RELEASE`
  curl -L -O "http://chromedriver.storage.googleapis.com/${CHROMEDRIVER_VERSION}/chromedriver_linux64.zip"
  unzip chromedriver_linux64.zip && chmod +x chromedriver && sudo mv chromedriver /usr/local/bin
fi

if [[ ! -z $MARIONETTE ]]; then
  export GECKODRIVER_VERSION=v0.11.1
  curl -L -o geckodriver.tar.gz https://github.com/mozilla/geckodriver/releases/download/${GECKODRIVER_VERSION}/geckodriver-${GECKODRIVER_VERSION}-linux64.tar.gz
  gunzip -c geckodriver.tar.gz | tar xopf -
  chmod +x geckodriver && sudo mv geckodriver /usr/local/bin
fi

if [[ ! -z $PHANTOMJS ]]; then
  #export PHANTOMJS_NAME=phantomjs-2.1.1-linux-x86_64
  #curl -OL "https://bitbucket.org/ariya/phantomjs/downloads/${PHANTOMJS_NAME}.tar.bz2"
  #tar -xvjf $PHANTOMJS_NAME.tar.bz2
  #chmod +x $PHANTOMJS_NAME/bin/phantomjs
  phantomjs -v
fi

if [[ ! -z $TOXENV ]]; then
  pip install setuptools==28.8.0 tox==2.4.1
fi
