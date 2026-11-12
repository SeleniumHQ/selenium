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

from selenium.webdriver.support.select import Select


@pytest.fixture
def escape():
    # _escape_string does not use the wrapped element, so no browser is needed.
    return Select.__new__(Select)._escape_string


@pytest.mark.parametrize(
    ("value", "expected"),
    [
        ("plain", '"plain"'),
        ('say "hi', "'say \"hi'"),
        ("it's", '"it\'s"'),
    ],
)
def test_escape_string_quotes_values_with_one_kind_of_quote(escape, value, expected):
    assert escape(value) == expected


@pytest.mark.parametrize(
    ("value", "expected"),
    [
        ("a'b\"c", 'concat("a\'b", \'"\', "c")'),
        ('it\'s "quoted"', 'concat("it\'s ", \'"\', "quoted", \'"\')'),
        ("x'\"", "concat(\"x'\", '\"')"),
        ('x\'""', "concat(\"x'\", '\"', '\"')"),
        ('"it\'s"', "concat('\"', \"it's\", '\"')"),
    ],
)
def test_escape_string_uses_concat_for_values_with_both_kinds_of_quote(escape, value, expected):
    assert escape(value) == expected
