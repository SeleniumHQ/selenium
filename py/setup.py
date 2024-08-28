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
    'rust_extensions': [
        RustExtension(
            {"selenium-manager": "selenium.webdriver.common.selenium-manager"},
            binding=Binding.Exec
        )
    ],
}

setup(**setup_args)
