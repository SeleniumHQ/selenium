set -ex

if [[ ! -z $CHROME ]]; then
  export CHROMEDRIVER_VERSION=`curl -s http://chromedriver.storage.googleapis.com/LATEST_RELEASE`
  curl -L -O "http://chromedriver.storage.googleapis.com/${CHROMEDRIVER_VERSION}/chromedriver_linux64.zip"
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

echo -e "[ui]\n  superconsole = disabled\n" >> .buckconfig.local

# buckw uses requests to download buck executable
pip install requests
