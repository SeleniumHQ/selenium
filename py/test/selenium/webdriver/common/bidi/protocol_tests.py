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
is uniform): a plain command result and a deeply nested union/record result.

Event delivery is not covered here: the layer speaks commands (request/response)
only. Routing pushed events into their generated types is the facade piece that
stays out of scope, so there is nothing in `_bidi` to exercise yet.
"""

from selenium.webdriver.common._bidi.browsing_context import (
    BrowsingContext,
    CreateResult,
    CreateType,
    GetTreeResult,
    Info,
)


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
