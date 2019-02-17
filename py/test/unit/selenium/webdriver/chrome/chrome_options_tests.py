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
import platform
from os import path

import pytest

from selenium.webdriver.chrome.options import Options


@pytest.fixture
def options():
    return Options()


def test_set_binary_location(options):
    options.binary_location = '/foo/bar'
    assert options._binary_location == '/foo/bar'


def test_get_binary_location(options):
    options._binary_location = '/foo/bar'
    assert options.binary_location == '/foo/bar'


def test_set_debugger_address(options):
    options.debugger_address = '/foo/bar'
    assert options._debugger_address == '/foo/bar'


def test_get_debugger_address(options):
    options._debugger_address = '/foo/bar'
    assert options.debugger_address == '/foo/bar'


def test_add_arguments(options):
    options.add_argument('foo')
    assert 'foo' in options._arguments


def test_get_arguments(options):
    options._arguments = ['foo']
    assert 'foo' in options.arguments


def test_raises_exception_if_argument_is_falsy(options):
    with pytest.raises(ValueError):
        options.add_argument(None)


def test_raises_exception_if_extension_is_falsy(options):
    with pytest.raises(ValueError):
        options.add_extension(None)


def test_raises_exception_if_extension_does_not_exist(options):
    with pytest.raises(IOError):
        options.add_extension(path.join(path.abspath(path.curdir), 'fakepath'))


def test_add_extension(options, mocker):
    pth = path.abspath(path.expanduser('/foo/bar'))
    mocker.patch('os.path.exists').return_value = True
    options.add_extension(pth)
    assert pth in options._extension_files


def test_raises_exception_if_encoded_extension_is_falsy(options):
    with pytest.raises(ValueError):
        options.add_encoded_extension(None)


def test_add_encoded_extension(options):
    options.add_encoded_extension('/foo/bar')
    assert '/foo/bar' in options._extensions


def test_get_extensions_from_extension_files(options, mocker):
    null = 'NUL' if platform.system().lower() == 'windows' else '/dev/null'
    mocker.patch(
        'selenium.webdriver.chrome.options.open'.format(__name__)).return_value = open(null)
    mocker.patch('base64.b64encode').return_value = 'foo'.encode()
    options._extension_files = ['foo']
    assert 'foo' in options.extensions


def test_get_extensions_from_encoded_extensions(options, mocker):
    options._extensions = ['foo']
    assert 'foo' in options.extensions


def test_add_experimental_options(options):
    options.add_experimental_option('foo', 'bar')
    assert options._experimental_options['foo'] == 'bar'


def test_get_experimental_options(options):
    options._experimental_options = {'foo': 'bar'}
    assert options.experimental_options['foo'] == 'bar'


def test_set_headless(options):
    options.headless = True
    assert '--headless' in options._arguments


def test_unset_headless(options):
    options._arguments = ['--headless']
    options.headless = False
    assert '--headless' not in options._arguments


def test_get_headless(options):
    options._arguments = ['--headless']
    assert options.headless is True


def test_creates_capabilities(options):
    options._arguments = ['foo']
    options._binary_location = '/bar'
    options._extensions = ['baz']
    options._debugger_address = '/foo/bar'
    options._experimental_options = {'foo': 'bar'}
    caps = options.to_capabilities()
    opts = caps.get(Options.KEY)
    assert opts
    assert 'foo' in opts['args']
    assert opts['binary'] == '/bar'
    assert 'baz' in opts['extensions']
    assert opts['debuggerAddress'] == '/foo/bar'
    assert opts['foo'] == 'bar'


def test_starts_with_default_capabilities(options):
    from selenium.webdriver import DesiredCapabilities
    assert options._caps == DesiredCapabilities.CHROME


def test_is_a_baseoptions(options):
    from selenium.webdriver.common.options import BaseOptions
    assert isinstance(options, BaseOptions)
