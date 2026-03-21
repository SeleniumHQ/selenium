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

import importlib
import logging
import re
from types import ModuleType

from selenium.webdriver.common.bidi.cdp import import_devtools


def test_missing_cdp_devtools_version_falls_back(caplog):
    """This test verifies the most recent devtools module is imported if an unknown devtools version is requested."""
    with caplog.at_level(logging.DEBUG, logger="selenium"):
        devtools_module = import_devtools("will_never_exist")
    assert isinstance(devtools_module, ModuleType)
    # assert the fallback occurred successfully offered up a v{n} option.
    assert re.match(r"Falling back to loading `devtools`: v\d+", caplog.records[-1].getMessage()) is not None


def test_import_latest_cdp_devtools():
    """This test verifies the `latest` devtools module can be imported and it contains submodules."""
    latest_module = importlib.import_module("selenium.webdriver.common.devtools.latest")
    assert isinstance(latest_module, ModuleType)
    devtools_submodules = [
        getattr(latest_module, name)
        for name in dir(latest_module)
        if isinstance(getattr(latest_module, name), ModuleType)
    ]
    assert len(devtools_submodules) > 1
