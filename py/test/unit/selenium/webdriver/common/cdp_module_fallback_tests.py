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

import logging
import re
import types

from selenium.webdriver.common.bidi.cdp import import_devtools


def test_missing_cdp_devtools_version_falls_back(caplog):
    with caplog.at_level(logging.DEBUG, logger="selenium"):
        assert isinstance(import_devtools("will_never_exist"), types.ModuleType)
    # assert the fallback occurred successfully offered up a v{n} option.
    assert re.match(r"Falling back to loading `devtools`: v\d+", caplog.records[-1].msg) is not None
