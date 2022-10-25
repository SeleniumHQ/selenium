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

from selenium.webdriver.wpewebkit.options import Options


@pytest.fixture
def options():
    return Options()


def test_set_binary_location(options):
    options.binary_location = "/foo/bar"
    assert options._binary_location == "/foo/bar"


def test_get_binary_location(options):
    options._binary_location = "/foo/bar"
    assert options.binary_location == "/foo/bar"


def test_creates_capabilities(options):
    options._arguments = ["foo"]
    options._binary_location = "/bar"
    caps = options.to_capabilities()
    opts = caps.get(Options.KEY)
    assert opts
    assert "foo" in opts["args"]
    assert opts["binary"] == "/bar"


def test_is_a_baseoptions(options):
    from selenium.webdriver.common.options import BaseOptions

    assert isinstance(options, BaseOptions)
