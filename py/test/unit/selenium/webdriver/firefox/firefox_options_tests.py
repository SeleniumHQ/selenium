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

from selenium.common.exceptions import InvalidArgumentException
from selenium.webdriver.common.proxy import Proxy, ProxyType
from selenium.webdriver.firefox.firefox_binary import FirefoxBinary
from selenium.webdriver.firefox.firefox_profile import FirefoxProfile
from selenium.webdriver.firefox.options import Options


@pytest.fixture
def options():
    return Options()


def test_set_binary_with_firefox_binary(options):
    binary = FirefoxBinary('foo')
    options.binary = binary
    assert options._binary == binary


def test_set_binary_with_path(options):
    options.binary = '/foo'
    assert options._binary._start_cmd == '/foo'


def test_get_binary(options):
    options.binary = '/foo'
    assert options.binary._start_cmd == '/foo'


def test_set_binary_location(options):
    options.binary_location = '/foo'
    assert options._binary._start_cmd == '/foo'


def test_get_binary_location(options):
    options._binary = FirefoxBinary('/foo')
    assert options.binary_location == '/foo'


def test_set_preference(options):
    options.set_preference('foo', 'bar')
    assert options._preferences['foo'] == 'bar'


def test_get_preferences(options):
    options._preferences = {'foo': 'bar'}
    assert options.preferences['foo'] == 'bar'


def test_set_proxy(options):
    proxy = Proxy({'proxyType': ProxyType.MANUAL})
    options.proxy = proxy
    assert options._proxy == proxy


def test_raises_exception_if_proxy_is_not_proxy_object(options):
    with pytest.raises(InvalidArgumentException):
        options.proxy = 'foo'


def test_get_proxy(options):
    options._proxy = 'foo'
    assert options.proxy == 'foo'


def test_set_profile_with_firefox_profile(options):
    profile = FirefoxProfile()
    options.profile = profile
    assert options._profile == profile


def test_set_profile_with_path(options):
    options.profile = None
    assert isinstance(options._profile, FirefoxProfile)


def test_get_profile(options):
    options._profile = 'foo'
    assert options.profile == 'foo'


def test_add_arguments(options):
    options.add_argument('foo')
    assert 'foo' in options._arguments


def test_get_arguments(options):
    options._arguments = ['foo']
    assert 'foo' in options.arguments


def test_raises_exception_if_argument_is_falsy(options):
    with pytest.raises(ValueError):
        options.add_argument(None)


def test_set_log_level(options):
    options.log.level = 'debug'
    assert options.log.level == 'debug'


def test_set_headless(options):
    options.headless = True
    assert '-headless' in options._arguments


def test_unset_headless(options):
    options._arguments = ['-headless']
    options.headless = False
    assert '-headless' not in options._arguments


def test_get_headless(options):
    options._arguments = ['-headless']
    assert options.headless


def test_creates_capabilities(options):
    profile = FirefoxProfile()
    options._arguments = ['foo']
    options._binary = FirefoxBinary('/bar')
    options._preferences = {'foo': 'bar'}
    options._proxy = Proxy({'proxyType': ProxyType.MANUAL})
    options._profile = profile
    options.log.level = 'debug'
    caps = options.to_capabilities()
    opts = caps.get(Options.KEY)
    assert opts
    assert 'foo' in opts['args']
    assert opts['binary'] == '/bar'
    assert opts['prefs']['foo'] == 'bar'
    assert opts['profile'] == profile.encoded
    assert caps['proxy']['proxyType'] == ProxyType.MANUAL['string']
    assert opts['log']['level'] == 'debug'


def test_starts_with_default_capabilities(options):
    from selenium.webdriver import DesiredCapabilities
    caps = DesiredCapabilities.FIREFOX.copy()
    caps.update({"pageLoadStrategy": "normal"})
    assert options._caps == caps


def test_is_a_baseoptions(options):
    from selenium.webdriver.common.options import BaseOptions
    assert isinstance(options, BaseOptions)


def test_raises_exception_with_invalid_page_load_strategy(options):
    with pytest.raises(ValueError):
        options.page_load_strategy = 'never'


def test_set_page_load_strategy(options):
    options.page_load_strategy = 'normal'
    assert options._caps["pageLoadStrategy"] == 'normal'


def test_get_page_load_strategy(options):
    options._page_load_strategy = 'normal'
    assert options._caps["pageLoadStrategy"] == 'normal'


def test_creates_capabilities_with_page_load_strategy(options):
    options.page_load_strategy = 'eager'
    caps = options.to_capabilities()
    assert caps['pageLoadStrategy'] == 'eager'
