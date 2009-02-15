export PYTHONPATH=$PYTHONPATH:firefox/lib-src
export webdriver_test_htmlroot="common/src/web/"
python setup.py install
python firefox/test/py/api_examples.py
python firefox/test/py/firefox_launcher_tests.py