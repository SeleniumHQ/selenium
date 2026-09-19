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

"""End-to-end checks for the generated `selenium.webdriver.common._bidi` layer.

These drive the generated protocol code directly against a real browser — the
one thing the serialization unit tests structurally cannot do, since a
fixture only ever confirms our model against itself. What a browser adds is
proof that the schema-derived field names, nesting, discriminators, and types
match what the browser actually sends, and that the strict inbound deserializer
accepts real payloads. Coverage is by wire *shape*, not by domain (the machinery
is uniform): a plain command result, a deeply nested union/record result, and a
pushed event — the payload the browser sends unprompted, which no command result
covers because nothing in the request shapes it.
"""

import pytest

from selenium.webdriver.common._bidi.browsing_context import (
    BrowsingContext,
    CreateResult,
    CreateType,
    GetTreeResult,
    Info,
)
from selenium.webdriver.common._bidi.log import ConsoleLogEntry, Level, Log
from selenium.webdriver.common._bidi.session import Session
from selenium.webdriver.support.wait import WebDriverWait


def test_create_result_round_trips(driver):
    """A plain command result deserializes into its generated value object."""
    context = BrowsingContext(driver)

    result = context.create(type=CreateType.TAB)

    assert isinstance(result, CreateResult)
    assert isinstance(result.context, str)
    assert result.context

    context.close(result.context)


def test_get_tree_deserializes_nested_records(driver, pages):
    """A nested list[Info] result deserializes end-to-end from the browser."""
    driver.get(pages.url("simpleTest.html"))

    tree = BrowsingContext(driver).get_tree()

    assert isinstance(tree, GetTreeResult)
    assert tree.contexts, "expected at least one browsing context"

    top = tree.contexts[0]
    assert isinstance(top, Info)
    assert isinstance(top.context, str)
    assert top.context
    assert isinstance(top.url, str)
    # children is required-nullable: a real browser sends a list or null, never omits it.
    assert top.children is None or all(isinstance(child, Info) for child in top.children)


@pytest.fixture
def console_entries(driver, pages):
    """Typed ``log.entryAdded`` payloads, collected from the browser as they arrive."""
    driver.get(pages.url("simpleTest.html"))
    entries = []
    log = Log(driver)
    Session(driver).subscribe(events=["log.entryAdded"])
    callback_id = log.on("entry_added", entries.append)
    try:
        yield entries
    finally:
        log.off("entry_added", callback_id)
        Session(driver).unsubscribe(events=["log.entryAdded"])


def test_a_pushed_event_deserializes_into_its_generated_type(driver, console_entries):
    """An event the browser sends unprompted arrives as its generated payload type."""
    driver.execute_script("console.log('from the browser')")

    WebDriverWait(driver, 5).until(lambda _: any(e.text == "from the browser" for e in console_entries))

    entry = next(e for e in console_entries if e.text == "from the browser")
    assert isinstance(entry, ConsoleLogEntry)
    assert entry.level is Level.INFO
    assert entry.method == "log"
    # timestamp is a js-uint: past 2^31, so this also proves the range survives the wire.
    assert isinstance(entry.timestamp, int) and entry.timestamp > 2**31


def test_a_pushed_event_dispatches_nested_unions(driver, console_entries):
    """A console argument is a script.RemoteValue union, resolved to its variant."""
    driver.execute_script("console.log('a string', 42)")

    WebDriverWait(driver, 5).until(lambda _: any(e.text and "a string" in e.text for e in console_entries))

    entry = next(e for e in console_entries if e.text and "a string" in e.text)
    text_arg, number_arg = entry.args[0], entry.args[1]
    assert text_arg.type == "string" and text_arg.value == "a string"
    assert number_arg.type == "number" and number_arg.value == 42
