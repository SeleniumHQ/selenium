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

"""Tests for the deprecation dataset published with the API documentation."""

import json
import pathlib

import generate_deprecations as gd
import pytest


def test_reads_a_deprecated_method_with_its_replacement():
    source = """
import warnings


class Log:
    def add_listener(self):
        warnings.warn(
            "add_listener is deprecated, use driver.script.add_console_message_handler() instead",
            DeprecationWarning,
            stacklevel=2,
        )
"""
    (entry,) = gd.find_deprecations(source, "selenium.webdriver.common.log")

    assert entry["api"] == "selenium.webdriver.common.log.Log.add_listener"
    assert entry["deprecated"] == "add_listener"
    assert entry["replacement"] == "use driver.script.add_console_message_handler() instead"


def test_reads_a_warning_raised_through_the_warnings_module_alias():
    source = """
from warnings import warn

warn("Foo is deprecated, use Bar instead", category=DeprecationWarning)
"""
    (entry,) = gd.find_deprecations(source, "selenium.foo")

    assert entry["api"] == "selenium.foo"
    assert entry["replacement"] == "use Bar instead"


def test_joins_a_message_split_across_lines():
    source = """
import warnings


def f():
    warnings.warn(
        "using ignore_local_proxy_environment_variables in Options has been deprecated, "
        "instead, create a Proxy instance with ProxyType.DIRECT",
        DeprecationWarning,
    )
"""
    (entry,) = gd.find_deprecations(source, "selenium.webdriver.common.options")

    assert entry["deprecated"] == "using ignore_local_proxy_environment_variables in Options"
    assert entry["replacement"] == "instead, create a Proxy instance with ProxyType.DIRECT"


def test_keeps_an_entry_whose_message_has_no_recognisable_replacement():
    source = """
import warnings


def f():
    warnings.warn("Support for this is going away", DeprecationWarning)
"""
    (entry,) = gd.find_deprecations(source, "selenium.foo")

    assert entry["message"] == "Support for this is going away"
    assert entry["replacement"] is None


def test_ignores_warnings_that_are_not_deprecations():
    source = """
import warnings


def f():
    warnings.warn("something is slow", UserWarning)
    warnings.simplefilter("ignore", DeprecationWarning)
"""
    assert gd.find_deprecations(source, "selenium.foo") == []


def test_reports_deprecations_in_source_order():
    source = """
import warnings


def first():
    warnings.warn("first is deprecated, use a instead", DeprecationWarning)


def second():
    warnings.warn("second is deprecated, use b instead", DeprecationWarning)
"""
    entries = gd.find_deprecations(source, "selenium.foo")

    assert [entry["deprecated"] for entry in entries] == ["first", "second"]


@pytest.mark.parametrize(
    ("path", "expected"),
    [
        ("selenium/webdriver/remote/webdriver.py", "selenium.webdriver.remote.webdriver"),
        ("selenium/webdriver/__init__.py", "selenium.webdriver"),
        ("selenium/__init__.py", "selenium"),
    ],
)
def test_maps_a_source_path_to_its_module_name(path, expected):
    assert gd.module_name(path, "selenium") == expected


def test_the_published_dataset_matches_the_source():
    """The dataset is committed, so it can drift; regenerate with `./go py:docs_generate`."""
    py_dir = pathlib.Path(gd.__file__).resolve().parent
    published = py_dir / "docs" / "source" / "_extra" / "deprecations.json"
    if not published.exists():
        pytest.skip("deprecations.json is not present in the runfiles")

    expected = gd.collect(str(py_dir / "selenium"))
    assert json.loads(published.read_text())["deprecations"] == expected
