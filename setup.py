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
from setuptools import setup

TEST_WEB_DIR = 'common/src/web'

def get_extensions_list(in_dir):
    files_list = []
    for dirname, subdirs, filenames in os.walk(in_dir):
        if (dirname.find('.svn') == -1):
            files_list.extend(filenames)
    return set([t.split('.')[-1] for t in files_list if len(t.split('.')) > 0])

def get_dirs_list(in_dir):
    ret_list = []
    for dirname, subdirs, filenames in os.walk(in_dir):
        if (dirname.find('.svn') == -1):
            ret_list.append(dirname.replace(TEST_WEB_DIR + '/', ''))
    return ret_list

test_web_dirs = get_dirs_list(TEST_WEB_DIR)
test_web_extensions = get_extensions_list(TEST_WEB_DIR)

all_dirs_and_extensions = []
for dir in test_web_dirs:
    for ext in test_web_extensions:
        all_dirs_and_extensions.append(dir + '/*.' + ext)

setup(
   name='webdriver',
   version="0.7",
   description='Python bindings for WebDriver',
   url='http://code.google.com/p/selenium/',
   package_dir={
                'webdriver':'.',
                'webdriver.ie': 'jobbie/src/py',
                'webdriver.firefox': 'firefox/src/py',
                'webdriver.chrome' : 'chrome/src/py',
                'webdriver.chrome_tests': 'chrome/test/py',
                'webdriver.common': 'common/src/py',
                'webdriver.remote': 'remote/client/src/py',
                'webdriver.common_tests': 'common/test/py',
                'webdriver.common_web': 'common/src/web',
                'webdriver.firefox_tests': 'firefox/test/py',
                'webdriver.ie_tests': 'jobbie/test/py',
                'webdriver.remote_tests': 'remote/client/test/py',
                },
   packages=['webdriver',
             'webdriver.common',
             'webdriver.firefox',
             'webdriver.ie',
             'webdriver.chrome',
             'webdriver.remote',
             'webdriver.common_tests',
             'webdriver.common_web',
             'webdriver.firefox_tests',
             'webdriver.ie_tests',
             'webdriver.chrome_tests',
             'webdriver.remote_tests'],
   include_package_data=True,
   package_data={'': ['*.' + t for t in test_web_extensions], 
                'webdriver.common_web':all_dirs_and_extensions}
)

# FIXME: Do manually
# == IE ==
# cp jobbie/prebuilt/Win32/Release/InternetExplorerDriver.dll \
#        build/lib.<platform>/webdriver/ie
# == Chrome ==
# cp chrome/src/extension build/lib.<platform>/webdriver/chrome
# On win32
# cp chrome/prebuilt/Win32/Release/npchromedriver.dll build/lib/webdriver/chrome
