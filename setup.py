#!/usr/bin/env python
# Copyright 2008-2009 WebDriver committers
# Copyright 2008-2009 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

from glob import glob
import os
from distutils.core import setup

setup(
   name='webdriver',
   version="0.6",
   description='Python bidings for WebDriver',
   url='http://code.google.com/p/selenium/',
   package_dir={
                'webdriver':'',
                'webdriver.firefox': 'firefox/src/py',
                'webdriver.common': 'common/src/py',
                'webdriver.remote': 'remote/client/src/py',
                'webdriver.common_tests': 'common/test/py',
                'webdriver.firefox_tests': 'firefox/test/py',
                'webdriver.remote_tests': 'remote/client/test/py',
                },
   packages=['webdriver', 
             'webdriver.common',
             'webdriver.firefox',
             'webdriver.remote',
             'webdriver.common_tests',
             'webdriver.firefox_tests',
             'webdriver.remote_tests'],
)
