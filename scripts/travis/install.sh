set -ex

if [[ ! -z $CHROME ]]; then
  export CHROMEDRIVER_VERSION=`curl -s http://chromedriver.storage.googleapis.com/LATEST_RELEASE`
  curl -L -O "http://chromedriver.storage.googleapis.com/${CHROMEDRIVER_VERSION}/chromedriver_linux64.zip"
  unzip chromedriver_linux64.zip && chmod +x chromedriver && sudo mv chromedriver /usr/local/bin
fi

if [[ ! -z $MARIONETTE ]]; then
  export GECKODRIVER_DOWNLOAD=`curl -s 'https://api.github.com/repos/mozilla/geckodriver/releases/latest' | python -c "import sys, json; r = json.load(sys.stdin); print([a for a in r['assets'] if 'linux64' in a['name']][0]['browser_download_url']);"`
  curl -L -o geckodriver.tar.gz $GECKODRIVER_DOWNLOAD
  gunzip -c geckodriver.tar.gz | tar xopf -
  chmod +x geckodriver && sudo mv geckodriver /usr/local/bin
fi

if [[ ! -z $PHANTOMJS ]]; then
  phantomjs -v
fi

if [[ ! -z $TOXENV ]]; then
  pip install setuptools==28.8.0 tox==2.4.1
fi
