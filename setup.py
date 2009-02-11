#!/usr/bin/env python

from distutils.core import setup

setup(
   name='webdriver',
   version="0.0.1",
   description='Python bidings for WebDriver',
   url='http://code.google.com/p/webdriver/',
   package_dir={'webdriver.firefox' : 'firefox/src/py',
                'webdriver' : 'common/src/py'},
   packages=['webdriver.firefox', 'webdriver'],
)
