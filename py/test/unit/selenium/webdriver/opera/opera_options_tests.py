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

import pytest

from selenium.webdriver.opera.options import Options


@pytest.fixture
def options():
    return Options()


def test_set_android_package_name(options):
    options.android_package_name = 'bar'
    assert options._android_package_name == 'bar'


def test_get_android_package_name(options):
    options._android_package_name = 'bar'
    assert options.android_package_name == 'bar'


def test_set_android_device_socket(options):
    options.android_device_socket = 'bar'
    assert options._android_device_socket == 'bar'


def test_get_android_device_socket(options):
    options._android_device_socket = 'bar'
    assert options.android_device_socket == 'bar'


def test_set_android_command_line_file(options):
    options.android_command_line_file = 'bar'
    assert options._android_command_line_file == 'bar'


def test_get_android_command_line_file(options):
    options._android_command_line_file = 'bar'
    assert options.android_command_line_file == 'bar'


def test_creates_capabilities(options):
    options._arguments = ['foo']
    options._binary_location = '/bar'
    options._extensions = ['baz']
    options._debugger_address = '/foo/bar'
    options._experimental_options = {'foo': 'bar'}
    options._android_package_name = 'bar'
    options._android_command_line_file = 'foo'
    options._android_device_socket = 'spam'
    caps = options.to_capabilities()
    opts = caps.get(Options.KEY)
    assert opts
    assert 'foo' in opts['args']
    assert opts['binary'] == '/bar'
    assert 'baz' in opts['extensions']
    assert opts['debuggerAddress'] == '/foo/bar'
    assert opts['foo'] == 'bar'
    assert opts['androidPackage'] == 'bar'
    assert opts['androidCommandLineFile'] == 'foo'
    assert opts['androidDeviceSocket'] == 'spam'


def test_starts_with_default_capabilities(options):
    from selenium.webdriver import DesiredCapabilities
    caps = DesiredCapabilities.OPERA.copy()
    caps.update({"pageLoadStrategy": "normal"})
    assert options._caps == caps


def test_is_a_baseoptions(options):
    from selenium.webdriver.common.options import BaseOptions
    assert isinstance(options, BaseOptions)
