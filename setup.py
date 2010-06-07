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

from setuptools import setup
from setuptools.command.install import install

from os.path import dirname, join

def find_longdesc():
    for path in ("docs/api/py/index.rst", "docs/index.rst"):
        try:
            index = join(dirname(__file__), path)
            return open(index).read()
        except IOError:
            pass

    print "WARNING: Can't find index.rst"
    return ""

setup(
    cmdclass={'install': install},
    name='selenium',
    version="2.0-dev",
    description='Python bindings for WebDriver',
    long_description=find_longdesc(),
    url='http://code.google.com/p/selenium/',
    package_dir={
        'selenium':'.',
        'selenium.ie': 'jobbie/src/py',
        'selenium.firefox': 'firefox/src/py',
        'selenium.chrome' : 'chrome/src/py',
        'selenium.chrome_tests': 'chrome/test/py',
        'selenium.common': 'common/src/py',
        'selenium.docs': 'docs/api/py',
        'selenium.remote': 'remote/client/src/py',
        'selenium.common_tests': 'common/test/py',
        'selenium.common_web': 'common/src/web',
        'selenium.firefox_tests': 'firefox/test/py',
        'selenium.ie_tests': 'jobbie/test/py',
        'selenium.remote_tests': 'remote/client/test/py',
        'selenium.selenium': 'selenium/src/py',
    },
    packages=['selenium',
              'selenium.common',
              'selenium.docs',
              'selenium.firefox',
              'selenium.ie',
              'selenium.chrome',
              'selenium.remote',
              'selenium.common_tests',
              'selenium.common_web',
              'selenium.firefox_tests',
              'selenium.ie_tests',
              'selenium.chrome_tests',
              'selenium.remote_tests',
              'selenium.selenium'],

    include_package_data=True,
    install_requires=['distribute'],
    zip_safe=False,

)

# FIXME: Do manually
# == IE ==
# cp jobbie/prebuilt/Win32/Release/InternetExplorerDriver.dll \
#        build/lib.<platform>/webdriver/ie
# == Chrome ==
# cp chrome/src/extension build/lib.<platform>/webdriver/chrome
# On win32
# cp chrome/prebuilt/Win32/Release/npchromedriver.dll build/lib/webdriver/chrome
