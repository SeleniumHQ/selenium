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

from os.path import dirname, join, isfile
from shutil import copy
import re
import sys

def setup_python3():
    # Taken from "distribute" setup.py
    from distutils.filelist import FileList
    from distutils import dir_util, file_util, util, log

    tmp_src = join("build", "src")
    log.set_verbosity(1)
    fl = FileList()
    for line in open("MANIFEST.in"):
        if not line.strip():
            continue
        fl.process_template_line(line)
    dir_util.create_tree(tmp_src, fl.files)
    outfiles_2to3 = []
    for f in fl.files:
        outf, copied = file_util.copy_file(f, join(tmp_src, f), update=1)
        if copied and outf.endswith(".py"):
            outfiles_2to3.append(outf)

    util.run_2to3(outfiles_2to3)

    # arrange setup to use the copy
    sys.path.insert(0, tmp_src)

    return tmp_src

def find_longdesc():
    for path in ("docs/api/py/index.rst", "docs/index.rst"):
        try:
            index = join(dirname(__file__), path)
            return open(index).read()
        except IOError:
            pass

    print("WARNING: Can't find index.rst")
    return ""

def revision():
    # svn_rev is updated by subversion using svn:keywords
    svn_rev = "$Revision$"
    match = re.search("\d+", svn_rev)
    return match and match.group() or "unknown"

def _copy_ext_file(driver, name):
    filename = join("build", driver, name)
    if not isfile(filename):
        return 0
    dest = join(driver, "src", "py")
    copy(filename, dest)
    return 1

def _copy_ie_dlls():
    num_copied = 0
    dll = "InternetExplorerDriver.dll"
    for platform in ("Win32", "x64"):
        filename = join("jobbie", "prebuilt", platform, "Release", dll)
        if not isfile(filename):
            continue
        arch = platform[-2:]
        dest = join("jobbie", "src", "py", dll.replace(".dll", arch + ".dll"))
        copy(filename, dest)
        num_copied += 1

    return num_copied == 2

if sys.version_info >= (3,):
    src_root = setup_python3()
else:
    src_root = "."

# FIXME: We silently fail since on sdist this will work and on install will
# fail, find a better way
_copy_ext_file("firefox", "webdriver.xpi")
# FIXME: We need to find a solution for x64, currently IMO the zip contains the
# Win32 dll
_copy_ext_file("chrome", "chrome-extension.zip")
_copy_ie_dlls()

setup(
    cmdclass={'install': install},
    name='selenium',
    version="2.0-dev-%s" % revision(),
    description='Python bindings for Selenium',
    long_description=find_longdesc(),
    url='http://code.google.com/p/selenium/',
    src_root=src_root,
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
    package_data = {
        'selenium.firefox':['*.xpi']
    },
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
