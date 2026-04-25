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

from selenium.webdriver.common.timeouts import Timeouts


class TestTimeoutsInit:
    """Tests for Timeouts initialization."""

    def test_defaults_are_zero(self):
        t = Timeouts()
        assert t.implicit_wait == 0
        assert t.page_load == 0
        assert t.script == 0

    def test_init_with_integers(self):
        t = Timeouts(implicit_wait=5, page_load=30, script=10)
        assert t.implicit_wait == 5
        assert t.page_load == 30
        assert t.script == 10

    def test_init_with_floats(self):
        t = Timeouts(implicit_wait=0.5, page_load=1.5, script=2.5)
        assert t.implicit_wait == 0.5
        assert t.page_load == 1.5
        assert t.script == 2.5

    def test_init_with_zero(self):
        t = Timeouts(implicit_wait=0, page_load=0, script=0)
        assert t.implicit_wait == 0
        assert t.page_load == 0
        assert t.script == 0


class TestTimeoutsConvert:
    """Tests for the _convert method (seconds to milliseconds, stored as int)."""

    def test_convert_int(self):
        t = Timeouts()
        assert t._convert(5) == 5000

    def test_convert_float(self):
        t = Timeouts()
        assert t._convert(0.5) == 500

    def test_convert_zero(self):
        t = Timeouts()
        assert t._convert(0) == 0

    def test_convert_float_truncates(self):
        t = Timeouts()
        # 0.001 * 1000 = 1.0, should be 1
        assert t._convert(0.001) == 1

    def test_convert_raises_on_string(self):
        t = Timeouts()
        with pytest.raises(TypeError, match="Timeouts can only be an int or a float"):
            t._convert("5")

    def test_convert_raises_on_none(self):
        t = Timeouts()
        with pytest.raises(TypeError, match="Timeouts can only be an int or a float"):
            t._convert(None)

    def test_convert_raises_on_list(self):
        t = Timeouts()
        with pytest.raises(TypeError, match="Timeouts can only be an int or a float"):
            t._convert([5])

    def test_internal_storage_is_milliseconds(self):
        t = Timeouts(implicit_wait=3)
        # The descriptor divides by 1000 on read, so internal should be 3000
        assert t._implicit_wait == 3000


class TestTimeoutsDescriptor:
    """Tests for _TimeoutsDescriptor get/set behavior."""

    def test_get_returns_seconds(self):
        t = Timeouts(implicit_wait=5)
        # stored as 5000ms, descriptor returns 5000/1000 = 5.0
        assert t.implicit_wait == 5.0

    def test_set_stores_as_milliseconds(self):
        t = Timeouts()
        t.implicit_wait = 10
        assert t._implicit_wait == 10000

    def test_set_with_float(self):
        t = Timeouts()
        t.page_load = 2.5
        assert t._page_load == 2500

    def test_get_set_roundtrip(self):
        t = Timeouts()
        t.script = 7
        assert t.script == 7.0

    def test_set_zero(self):
        t = Timeouts(implicit_wait=5)
        t.implicit_wait = 0
        assert t._implicit_wait == 0
        assert t.implicit_wait == 0

    def test_set_raises_on_invalid_type(self):
        t = Timeouts()
        with pytest.raises(TypeError):
            t.implicit_wait = "bad"

    def test_descriptor_on_page_load(self):
        t = Timeouts(page_load=15)
        assert t.page_load == 15.0
        t.page_load = 20
        assert t._page_load == 20000

    def test_descriptor_on_script(self):
        t = Timeouts(script=3)
        assert t.script == 3.0
        t.script = 0.5
        assert t._script == 500


class TestTimeoutsToJson:
    """Tests for _to_json serialization."""

    def test_empty_timeouts(self):
        t = Timeouts()
        assert t._to_json() == {}

    def test_implicit_only(self):
        t = Timeouts(implicit_wait=5)
        result = t._to_json()
        assert result == {"implicit": 5000}

    def test_page_load_only(self):
        t = Timeouts(page_load=30)
        result = t._to_json()
        assert result == {"pageLoad": 30000}

    def test_script_only(self):
        t = Timeouts(script=10)
        result = t._to_json()
        assert result == {"script": 10000}

    def test_all_set(self):
        t = Timeouts(implicit_wait=1, page_load=30, script=5)
        result = t._to_json()
        assert result == {"implicit": 1000, "pageLoad": 30000, "script": 5000}

    def test_zero_values_excluded(self):
        t = Timeouts(implicit_wait=0, page_load=30, script=0)
        result = t._to_json()
        assert "implicit" not in result
        assert "script" not in result
        assert result == {"pageLoad": 30000}

    def test_after_set_to_zero(self):
        t = Timeouts(implicit_wait=5)
        t.implicit_wait = 0
        assert t._to_json() == {}

    def test_json_uses_milliseconds(self):
        t = Timeouts(implicit_wait=0.5)
        result = t._to_json()
        assert result == {"implicit": 500}

    def test_float_truncation_in_json(self):
        t = Timeouts(implicit_wait=0.001)
        result = t._to_json()
        # 0.001s = 1ms
        assert result == {"implicit": 1}
