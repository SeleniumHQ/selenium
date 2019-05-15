# Licensed to the Software Freedom Conservancy (SFC) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The SFC licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.

from distutils.command.install import INSTALL_SCHEMES
from os.path import dirname, join, abspath
from setuptools import setup
from setuptools.command.install import install


for scheme in INSTALL_SCHEMES.values():
    scheme['data'] = scheme['purelib']

setup_args = {
    'cmdclass': {'install': install},
    'name': 'selenium',
    'version': "4.0.0a1",
    'license': 'Apache 2.0',
    'description': 'Python bindings for Selenium',
    'long_description': open(join(abspath(dirname(__file__)), "README.rst")).read(),
    'url': 'https://github.com/SeleniumHQ/selenium/',
    'classifiers': ['Development Status :: 5 - Production/Stable',
                    'Intended Audience :: Developers',
                    'License :: OSI Approved :: Apache Software License',
                    'Operating System :: POSIX',
                    'Operating System :: Microsoft :: Windows',
                    'Operating System :: MacOS :: MacOS X',
                    'Topic :: Software Development :: Testing',
                    'Topic :: Software Development :: Libraries',
                    'Programming Language :: Python',
                    'Programming Language :: Python :: 2.7',
                    'Programming Language :: Python :: 3.4',
                    'Programming Language :: Python :: 3.5',
                    'Programming Language :: Python :: 3.6'],
    'package_dir': {
        'selenium': 'selenium',
        'selenium.common': 'selenium/common',
        'selenium.webdriver': 'selenium/webdriver',
    },
    'packages': ['selenium',
                 'selenium.common',
                 'selenium.webdriver',
                 'selenium.webdriver.android',
                 'selenium.webdriver.chrome',
                 'selenium.webdriver.common',
                 'selenium.webdriver.common.html5',
                 'selenium.webdriver.support',
                 'selenium.webdriver.firefox',
                 'selenium.webdriver.ie',
                 'selenium.webdriver.edge',
                 'selenium.webdriver.opera',
                 'selenium.webdriver.phantomjs',
                 'selenium.webdriver.remote',
                 'selenium.webdriver.support', ],
    'include_package_data': True,
    'install_requires': ['urllib3'],
    'zip_safe': False
}

setup(**setup_args)
