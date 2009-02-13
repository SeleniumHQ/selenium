export PYTHONPATH=$PYTHONPATH:firefox/lib-src
export webdriver_test_htmlroot="common/src/web/"
python setup.py install
python firefox/test/py/api_examples.py