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

from selenium.common.exceptions import InvalidSelectorException
from selenium.webdriver.common.by import By
from selenium.webdriver.remote.locator_converter import LocatorConverter
from selenium.webdriver.remote.shadowroot import ShadowRoot


def _convert(by, value):
    return LocatorConverter().convert(by, value)


def test_id_starting_with_a_digit_keeps_the_escaped_remainder():
    by, value = _convert(By.ID, "5a#b")

    assert by == By.CSS_SELECTOR
    assert value == "#\\35 a\\#b"


def test_id_starting_with_a_non_ascii_digit_is_left_alone():
    _, arabic = _convert(By.ID, "\u0665foo")
    _, ascii_five = _convert(By.ID, "5foo")

    assert arabic == "#\u0665foo"
    assert arabic != ascii_five


def test_class_name_starting_with_a_non_ascii_digit_is_left_alone():
    _, arabic = _convert(By.CLASS_NAME, "\u0665foo")
    _, ascii_five = _convert(By.CLASS_NAME, "5foo")

    assert arabic == ".\u0665foo"
    assert arabic != ascii_five


def test_id_with_a_space_is_escaped():
    _, value = _convert(By.ID, "one two")

    assert value == "#one\\ two"


@pytest.mark.parametrize(
    ("raw", "expected"),
    [
        ("a\nb", "#a\\a b"),
        ("a\rb", "#a\\d b"),
        ("a\fb", "#a\\c b"),
    ],
)
def test_line_break_in_an_id_is_hex_escaped(raw, expected):
    _, value = _convert(By.ID, raw)

    assert value == expected


def test_empty_id_stays_an_attribute_selector():
    by, value = _convert(By.ID, "")

    assert by == By.CSS_SELECTOR
    assert value == '[id=""]'


def test_id_uses_a_hash_selector():
    _, value = _convert(By.ID, "Foo")

    assert value == "#Foo"


def test_class_name_with_special_characters_is_escaped():
    _, value = _convert(By.CLASS_NAME, "cls-!@#$%^&*")

    assert value == ".cls\\-\\!\\@\\#\\$\\%\\^\\&\\*"


def test_class_name_starting_with_a_digit_is_a_single_class():
    _, value = _convert(By.CLASS_NAME, "1foo")

    assert value == ".\\31 foo"


def test_class_name_with_a_space_is_rejected():
    with pytest.raises(InvalidSelectorException):
        _convert(By.CLASS_NAME, "one two")


def test_class_name_with_only_a_leading_space_is_rejected():
    with pytest.raises(InvalidSelectorException):
        _convert(By.CLASS_NAME, " foo")


def test_name_with_a_space_is_escaped_inside_the_attribute():
    _, value = _convert(By.NAME, "frame 1")

    assert value == "*[name='frame\\ 1']"


def test_name_starting_with_a_digit_keeps_the_escaped_remainder():
    _, value = _convert(By.NAME, "1 a")

    assert value == "*[name='\\31 \\ a']"


def test_name_with_an_apostrophe_is_escaped_inside_the_attribute():
    _, value = _convert(By.NAME, "O'Brien")

    assert value == "*[name='O\\'Brien']"


def test_name_with_a_backslash_is_escaped_inside_the_attribute():
    _, value = _convert(By.NAME, "a\\b")

    assert value == "*[name='a\\\\b']"


def test_name_with_line_breaks_is_hex_escaped():
    _, value = _convert(By.NAME, "a\nb\rc\fd")

    assert value == "*[name='a\\a b\\d c\\c d']"


def test_name_starting_with_a_digit_and_a_percent_keeps_the_escaped_remainder():
    _, value = _convert(By.NAME, "50%off")

    assert value == "*[name='\\35 0\\%off']"


class _Session:
    def __init__(self, result, locator_converter=None):
        self._result = result
        self.params = None
        self.locator_converter = locator_converter or LocatorConverter()

    def execute(self, command, params):
        self.params = params
        return {"value": self._result}


class _CustomConverter:
    def convert(self, by, value):
        return By.CSS_SELECTOR, f"[data-custom='{value}']"


@pytest.mark.parametrize("method", ["find_element", "find_elements"])
def test_shadow_root_escapes_a_class_name(method):
    session = _Session("element" if method == "find_element" else [])
    root = ShadowRoot(session, "shadow-id")

    getattr(root, method)(By.CLASS_NAME, "1foo")

    assert session.params["using"] == By.CSS_SELECTOR
    assert session.params["value"] == ".\\31 foo"
    assert session.params["shadowId"] == "shadow-id"


def test_shadow_root_rejects_a_class_name_with_a_leading_space():
    root = ShadowRoot(_Session("element"), "shadow-id")

    with pytest.raises(InvalidSelectorException):
        root.find_element(By.CLASS_NAME, " foo")


@pytest.mark.parametrize("method", ["find_element", "find_elements"])
def test_shadow_root_uses_the_session_locator_converter(method):
    session = _Session("element" if method == "find_element" else [], _CustomConverter())
    root = ShadowRoot(session, "shadow-id")

    getattr(root, method)(By.ID, "foo")

    assert session.params["using"] == By.CSS_SELECTOR
    assert session.params["value"] == "[data-custom='foo']"
