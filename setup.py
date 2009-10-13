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
                'webdriver_firefox': 'firefox/src/py',
                'webdriver_common': 'common/src/py',
                'webdriver_remote': 'remote/client/src/py',
                'webdriver_common_tests': 'common/test/py',
                'webdriver_firefox_tests': 'firefox/test/py',
                'webdriver_remote_tests': 'remote/client/test/py',
                },
   packages=['webdriver_common',
             'webdriver_firefox',
             'webdriver_remote',
             'webdriver_common_tests',
             'webdriver_firefox_tests',
             'webdriver_remote_tests'],
)
