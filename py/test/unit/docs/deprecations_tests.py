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
import re

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


def test_reads_a_replacement_offered_after_the_removal_notice():
    source = """
import warnings


def with_tag_name(tag_name):
    warnings.warn(
        "This method is deprecated and may be removed in future versions. Please use `locate_with` instead.",
        DeprecationWarning,
        stacklevel=2,
    )
"""
    (entry,) = gd.find_deprecations(source, "selenium.webdriver.support.relative_locator")

    assert entry["replacement"] == "use `locate_with` instead"


def test_reads_a_replacement_after_a_will_be_removed_clause():
    source = """
import warnings


def f():
    warnings.warn("f is deprecated and will be removed; use g instead", DeprecationWarning)
"""
    (entry,) = gd.find_deprecations(source, "selenium.foo")

    assert entry["deprecated"] == "f"
    assert entry["replacement"] == "use g instead"


def test_does_not_invent_a_replacement_for_a_removal_notice_that_names_none():
    source = """
import warnings


def realm():
    warnings.warn("realm is deprecated and will be removed; it is an implementation detail", DeprecationWarning)
"""
    (entry,) = gd.find_deprecations(source, "selenium.foo")

    assert entry["replacement"] is None


def test_publishes_each_command_a_replacement_table_forwards():
    """`driver.script` deprecates commands through `__getattr__`; the table is the real mapping."""
    source = """
import warnings

_REPLACEMENTS = {
    "evaluate": "driver.script.execute()",
}


class Script:
    def __getattr__(self, name):
        replacement = _REPLACEMENTS.get(name)
        advice = f"use {replacement} instead"
        warnings.warn(f"driver.script.{name} is deprecated and will be removed; {advice}", DeprecationWarning)
"""
    entries = gd.find_deprecations(source, "selenium.webdriver.remote.script")
    by_api = {entry["api"]: entry for entry in entries}

    evaluate = by_api["selenium.webdriver.remote.script.Script.evaluate"]
    assert evaluate["deprecated"] == "driver.script.evaluate"
    assert evaluate["replacement"] == "use driver.script.execute() instead"
    # Commands outside the table are still deprecated, with no replacement to name.
    assert "selenium.webdriver.remote.script.Script.__getattr__" in by_api


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


def test_omits_line_numbers_so_the_dataset_survives_edits_above_a_warning():
    """A published line number would be stale after any edit that shifted the code.

    CI evaluates a pull request as its merge with trunk, so a line number in the
    committed dataset breaks on trunk moving, not just on this branch changing.
    """
    source = """
import warnings


def f():
    warnings.warn("f is deprecated, use g instead", DeprecationWarning)
"""
    (entry,) = gd.find_deprecations(source, "selenium.foo")

    assert "line" not in entry


def test_reads_the_python_version_from_the_shared_version_file(tmp_path):
    version_bzl = tmp_path / "version.bzl"
    version_bzl.write_text('VERSIONS = {\n    "java": "4.53.0-SNAPSHOT",\n    "python": "4.53.0.dev0",\n}\n')

    assert gd.python_version(version_bzl) == "4.53.0.dev0"


def test_refuses_to_guess_when_the_version_file_has_no_python_entry(tmp_path):
    """A dataset stamped with a made-up version is worse than a failed build."""
    version_bzl = tmp_path / "version.bzl"
    version_bzl.write_text('VERSIONS = {\n    "java": "4.53.0-SNAPSHOT",\n}\n')

    with pytest.raises(SystemExit):
        gd.python_version(version_bzl)


def test_the_published_dataset_matches_the_source():
    """The dataset is committed, so it can drift; regenerate with `./go py:docs_generate`."""
    py_dir = pathlib.Path(gd.__file__).resolve().parent
    published = py_dir / "docs" / "source" / "_extra" / "deprecations.json"
    if not published.exists():
        pytest.skip("deprecations.json is not present in the runfiles")

    expected = gd.collect(str(py_dir / "selenium"))
    assert json.loads(published.read_text())["deprecations"] == expected, (
        "deprecations.json is out of date; regenerate it with `./go py:docs_generate`"
    )


def test_the_shipped_guidance_recommends_no_deprecated_driver_api():
    """`llms.txt` tells code generators what to use; naming a deprecated API there undoes its purpose."""
    py_dir = pathlib.Path(gd.__file__).resolve().parent
    guidance = (py_dir / "selenium" / "llms.txt").read_text()

    deprecated = set()
    for entry in gd.collect(str(py_dir / "selenium")):
        if entry["deprecated"] and entry["deprecated"].startswith("driver."):
            deprecated.add(entry["deprecated"])
        if entry["api"].startswith("selenium.webdriver.remote.webdriver.WebDriver."):
            deprecated.add("driver." + entry["api"].rsplit(".", 1)[1])

    named = sorted(name for name in deprecated if re.search(rf"(?<![\w.]){re.escape(name)}(?!\w)", guidance))
    assert not named, f"py/selenium/llms.txt recommends deprecated APIs: {named}"
