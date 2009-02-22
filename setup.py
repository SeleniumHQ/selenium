#!/usr/bin/env python

from distutils.core import setup

setup(
   name='webdriver',
   version="0.0.1",
   description='Python bidings for WebDriver',
   url='http://code.google.com/p/webdriver/',
   package_dir={
                'webdriver_firefox': 'firefox/src/py',
                'webdriver_common': 'common/src/py',
                'webdriver_remote': 'remote/client/src/py',
                'webdriver_common_tests': 'common/test/py'},
   packages=['webdriver_common',
             'webdriver_firefox',
             'webdriver_remote',
             'webdriver_common_tests'],
)
