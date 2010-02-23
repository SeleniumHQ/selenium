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
import os, shutil
import subprocess
from setuptools import setup
from setuptools.command.install import install as _install

class install(_install):
    def run(self):
        _install.run(self)

        # Ugly hack to use rake to build webdriver-extension.zip
        # and put it where we're looking for it
        root_dir = os.path.abspath(os.path.dirname(__file__))
        artifacts_dir = os.path.join(root_dir, 'build/lib/selenium/build_artifacts')
        webdriver_extension = os.path.join(root_dir, 'build/webdriver-extension.zip')
        os.chdir(root_dir)
        subprocess.call(['rake', 'firefox_xpi'])
        try:
            os.makedirs(artifacts_dir)
        except OSError:
            # Dir was already created
            pass
        shutil.copy(webdriver_extension, artifacts_dir)

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
   cmdclass={'install': install},
   name='selenium',
   version="2.0-dev",
   description='Python bindings for WebDriver',
   url='http://code.google.com/p/selenium/',
   package_dir={
                'selenium':'.',
                'selenium.ie': 'jobbie/src/py',
                'selenium.firefox': 'firefox/src/py',
                'selenium.chrome' : 'chrome/src/py',
                'selenium.chrome_tests': 'chrome/test/py',
                'selenium.common': 'common/src/py',
                'selenium.remote': 'remote/client/src/py',
                'selenium.common_tests': 'common/test/py',
                'selenium.common_web': 'common/src/web',
                'selenium.firefox_tests': 'firefox/test/py',
                'selenium.ie_tests': 'jobbie/test/py',
                'selenium.remote_tests': 'remote/client/test/py',
                },
   packages=['selenium',
             'selenium.common',
             'selenium.firefox',
             'selenium.ie',
             'selenium.chrome',
             'selenium.remote',
             'selenium.common_tests',
             'selenium.common_web',
             'selenium.firefox_tests',
             'selenium.ie_tests',
             'selenium.chrome_tests',
             'selenium.remote_tests'],
   include_package_data=True,
   package_data={'': ['*.' + t for t in test_web_extensions],
                'selenium.common_web':all_dirs_and_extensions}
)

# FIXME: Do manually
# == IE ==
# cp jobbie/prebuilt/Win32/Release/InternetExplorerDriver.dll \
#        build/lib.<platform>/webdriver/ie
# == Chrome ==
# cp chrome/src/extension build/lib.<platform>/webdriver/chrome
# On win32
# cp chrome/prebuilt/Win32/Release/npchromedriver.dll build/lib/webdriver/chrome
