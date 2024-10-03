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
from setuptools_rust import Binding, RustExtension


for scheme in INSTALL_SCHEMES.values():
    scheme['data'] = scheme['purelib']

setup_args = {
    'cmdclass': {'install': install},
    'name': 'selenium',
    'version': "4.26.0.dev202409202351",
    'license': 'Apache 2.0',
    'description': 'Official Python bindings for Selenium WebDriver.',
    'long_description': open(join(abspath(dirname(__file__)), "README.rst")).read(),
    'url': 'https://github.com/SeleniumHQ/selenium/',
    'project_urls': {
        'Bug Tracker': 'https://github.com/SeleniumHQ/selenium/issues',
        'Changes': 'https://github.com/SeleniumHQ/selenium/blob/trunk/py/CHANGES',
        'Documentation': 'https://www.selenium.dev/documentation/overview/',
        'Source Code': 'https://github.com/SeleniumHQ/selenium/tree/trunk/py',
    },
    'python_requires': '~=3.8',
    'classifiers': ['Development Status :: 5 - Production/Stable',
                    'Intended Audience :: Developers',
                    'License :: OSI Approved :: Apache Software License',
                    'Operating System :: POSIX',
                    'Operating System :: Microsoft :: Windows',
                    'Operating System :: MacOS :: MacOS X',
                    'Topic :: Software Development :: Testing',
                    'Topic :: Software Development :: Libraries',
                    'Programming Language :: Python',
                    'Programming Language :: Python :: 3.8',
                    'Programming Language :: Python :: 3.9',
                    'Programming Language :: Python :: 3.10',
                    'Programming Language :: Python :: 3.11',
                    'Programming Language :: Python :: 3.12',
                    ],
    'package_dir': {
        'selenium': 'selenium',
        'selenium.common': 'selenium/common',
        'selenium.webdriver': 'selenium/webdriver',
    },
    'packages': ['selenium',
                 'selenium.common',
                 'selenium.webdriver',
                 'selenium.webdriver.chrome',
                 'selenium.webdriver.chromium',
                 'selenium.webdriver.common',
                 'selenium.webdriver.edge',
                 'selenium.webdriver.firefox',
                 'selenium.webdriver.ie',
                 'selenium.webdriver.remote',
                 'selenium.webdriver.safari',
                 'selenium.webdriver.support',
                 'selenium.webdriver.webkitgtk',
                 'selenium.webdriver.wpewebkit',
                 ],
    'include_package_data': True,
    'install_requires': [
        "urllib3[socks]>=1.26,<3",
        "trio~=0.17",
        "trio-websocket~=0.9",
        "certifi>=2021.10.8",
        "typing_extensions~=4.9",
        "websocket-client~=1.8",
    ],
    'rust_extensions': [
        RustExtension(
            {"selenium-manager": "selenium.webdriver.common.selenium-manager"},
            binding=Binding.Exec
        )
    ],
    'zip_safe': False
}

setup(**setup_args)
