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

from selenium.webdriver import Proxy
from selenium.webdriver.common.options import ArgOptions
from selenium.webdriver.common.proxy import ProxyType


@pytest.fixture
def options():
    return ArgOptions()


def test_add_arguments(options):
    options.add_argument("foo")
    assert "foo" in options._arguments


def test_get_arguments(options):
    options._arguments = ["foo"]
    assert "foo" in options.arguments


def test_enables_mobile(options):
    options.enable_mobile(android_package="cheese")
    assert options.mobile_options["androidPackage"] == "cheese"
    assert not hasattr(options.mobile_options, "androidActivity")
    assert not hasattr(options.mobile_options, "androidDeviceSerial")


def test_enable_mobile_errors_without_package(options):
    with pytest.raises(AttributeError):
        options.enable_mobile()


def test_enable_mobile_with_activity(options):
    options.enable_mobile(android_package="sausages", android_activity="eating")
    assert options.mobile_options["androidActivity"] == "eating"


def test_enable_mobile_with_device_serial(options):
    options.enable_mobile(android_package="cheese", android_activity="crackers", device_serial="1234")
    options.mobile_options["androidDeviceSerial"] == "1234"


def test_missing_capabilities_return_false_rather_than_none():
    options = ArgOptions()
    assert options.strict_file_interactability is False
    assert options.set_window_rect is False
    assert options.accept_insecure_certs is False


def test_add_proxy():
    options = ArgOptions()
    proxy = Proxy({"proxyType": ProxyType.MANUAL})
    proxy.http_proxy = "http://user:password@http_proxy.com:8080"
    options.proxy = proxy
    caps = options.to_capabilities()

    assert options.proxy == proxy
    assert caps.get("proxy") == proxy.to_capabilities()
