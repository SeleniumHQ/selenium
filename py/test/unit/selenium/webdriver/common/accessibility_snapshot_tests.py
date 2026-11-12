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

"""The pure parts of the accessibility snapshot (ADR 18205).

The text renderer is held to the shared corpus, and the decoder to the BiDi wire shape.
"""

import json
from pathlib import Path

import pytest

from selenium.webdriver.remote.accessibility_snapshot import AccessibilityNode, node_from_wire

CORPUS = Path(__file__).parents[6] / "common" / "src" / "web" / "accessibility"


def _node_from_json(data):
    """The corpus JSON as nodes; `element` holds the recorded id, which the text form never renders."""
    return AccessibilityNode(
        role=data["role"],
        name=data["name"],
        description=data["description"],
        value=data.get("value"),
        url=data.get("url"),
        states=data["states"],
        element=data.get("element"),
        children=[_node_from_json(child) for child in data["children"]],
    )


def _corpus_pages():
    return json.loads((CORPUS / "index.json").read_text(encoding="utf-8"))


@pytest.mark.parametrize("form", ["", ".full"], ids=["pruned", "full"])
@pytest.mark.parametrize("page", _corpus_pages())
def test_to_text_matches_the_corpus(page, form):
    """Every expected.txt is the reference renderer's output over its expected.json; the port must agree."""
    tree = _node_from_json(json.loads((CORPUS / f"{page}.expected{form}.json").read_text(encoding="utf-8")))
    expected = (CORPUS / f"{page}.expected{form}.txt").read_text(encoding="utf-8")
    assert tree.to_text() + "\n" == expected


def test_to_text_does_not_render_the_url():
    node = AccessibilityNode(role="link", name="Docs", url="https://example.com/docs")

    assert node.to_text() == '- link "Docs"'


def test_to_text_line_grammar():
    node = AccessibilityNode(
        role="textbox",
        name='Say "hi" \\ bye',
        states={"focused": True, "disabled": True, "level": 2, "selected": False, "pressed": "mixed"},
        value="line one\nline two\\",
    )
    expected = (
        '- textbox "Say \\"hi\\" \\\\ bye" [pressed=mixed] [level=2] [disabled] [focused]: line one\\nline two\\\\'
    )
    assert node.to_text() == expected
    assert AccessibilityNode(role="list", name="").to_text() == "- list"
    assert AccessibilityNode(role="text", name="plain words").to_text() == "- text: plain words"
    assert AccessibilityNode(role="textbox", name="Empty", value="").to_text() == '- textbox "Empty"'


def test_to_text_indents_children_two_spaces_per_level():
    tree = AccessibilityNode(
        role="list",
        name="",
        children=[
            AccessibilityNode(
                role="listitem",
                name="",
                children=[AccessibilityNode(role="text", name="one"), AccessibilityNode(role="link", name="more")],
            )
        ],
    )
    assert tree.to_text() == '- list\n  - listitem\n    - text: one\n    - link "more"'


def test_node_from_wire_builds_the_tree_and_resolves_the_indices():
    """The atom's wire form: element indices into the elements list, a frame index for frame nodes."""
    data = {
        "role": "generic",
        "name": "",
        "description": "",
        "states": {},
        "element": 0,
        "children": [
            {"role": "text", "name": "Intro", "description": "", "states": {}, "children": []},
            {
                "role": "textbox",
                "name": "Email",
                "description": "Where to write",
                "value": "a@b.c",
                "states": {"focused": True, "level": 2, "pressed": "mixed", "selected": False},
                "element": 1,
                "children": [],
            },
            {
                "role": "iframe",
                "name": "Embedded",
                "description": "",
                "states": {},
                "element": 2,
                "frame": 0,
                "children": [],
            },
            {
                "role": "link",
                "name": "Docs",
                "description": "",
                "url": "https://example.com/docs",
                "states": {},
                "element": 3,
                "children": [],
            },
        ],
    }
    elements = ["element:0", "element:1", "element:2", "element:3"]
    stitched = []

    def frame_children(index):
        stitched.append(index)
        return [AccessibilityNode(role="document", name="Inner")]

    node = node_from_wire(data, elements, frame_children)

    assert node.role == "generic"
    assert node.element == "element:0"
    text, textbox, frame, link = node.children
    assert link.url == "https://example.com/docs"
    assert textbox.url is None
    assert text.role == "text"
    assert text.element is None
    assert text.children == []
    assert textbox.element == "element:1"
    assert textbox.value == "a@b.c"
    assert textbox.description == "Where to write"
    assert textbox.states == {"focused": True, "level": 2, "pressed": "mixed", "selected": False}
    assert isinstance(textbox.states["level"], int)
    assert frame.element == "element:2"
    assert [child.name for child in frame.children] == ["Inner"], "the frame's children come from the binding"
    assert stitched == [0]


def test_node_from_wire_keeps_absent_fields_absent():
    node = node_from_wire({"role": "list", "name": "", "states": {}, "children": []}, [], lambda index: [])

    assert node.description == ""
    assert node.value is None
    assert node.url is None
    assert node.element is None
    assert node.children == []


_ONE_NODE = '{"role":"document","name":"T","description":"","states":{},"element":0,"children":[]}'


def _wire_result(shared_id="shared-1"):
    return {
        "type": "success",
        "result": {
            "type": "object",
            "value": [
                ["json", {"type": "string", "value": _ONE_NODE}],
                ["elements", {"type": "array", "value": [{"type": "node", "sharedId": shared_id}]}],
                ["windows", {"type": "array", "value": []}],
            ],
        },
    }


class _Connection:
    """A stand-in for the session websocket: records each BiDi command and answers from ``replies``."""

    def __init__(self, replies=None):
        self.commands = []
        self.replies = replies or {}

    def send_cmd(self, method, params):
        self.commands.append((method, params))
        if method == "browsingContext.getTree":
            return self.replies.get(method, {"result": {"contexts": [{"context": "window-1", "children": []}]}})
        answer = self.replies.get((method, params["target"]["context"]))
        return answer if answer is not None else {"result": _wire_result()}

    def calls(self):
        return [params for method, params in self.commands if method == "script.callFunction"]


class _Driver:
    """Has no public ``script`` or ``browsing_context``: the snapshot must not go through them."""

    current_window_handle = "window-1"
    caps = {"webSocketUrl": "ws://localhost/session/1"}

    def __init__(self, connection=None):
        self._websocket_connection = connection or _Connection()

    def execute_script(self, script, *args):
        # How Classic serializes the top-level window: a window reference to its handle.
        return {"window-fcc6-11e5-b4f8-330a88ab9d7f": self.current_window_handle}


@pytest.mark.parametrize("interesting_only", [True, False])
def test_snapshotter_passes_interesting_only_to_the_atom_first(interesting_only):
    from selenium.webdriver.remote.accessibility_snapshot import AccessibilitySnapshotter

    driver = _Driver()

    node = AccessibilitySnapshotter(driver).snapshot(None, interesting_only)

    assert node.role == "document"
    (call,) = driver._websocket_connection.calls()
    assert call["arguments"][0] == {"type": "boolean", "value": interesting_only}
    assert call["functionDeclaration"].startswith("(interestingOnly, root) =>")
    assert call["target"] == {"context": "window-1", "sandbox": "selenium"}
    assert call["serializationOptions"] == {"maxDomDepth": 0}
    assert call["resultOwnership"] == "none"


def test_snapshotter_defaults_to_the_pruned_tree():
    from selenium.webdriver.remote.accessibility_snapshot import AccessibilitySnapshotter

    driver = _Driver()

    AccessibilitySnapshotter(driver).snapshot(None)

    assert driver._websocket_connection.calls()[0]["arguments"] == [{"type": "boolean", "value": True}]


def test_snapshotter_finds_the_frame_that_owns_a_subtree_root():
    from selenium.webdriver.remote.accessibility_snapshot import AccessibilitySnapshotter

    tree = {"contexts": [{"context": "window-1", "children": [{"context": "frame-1", "children": []}]}]}
    connection = _Connection(
        {
            "browsingContext.getTree": {"result": tree},
            ("script.callFunction", "window-1"): {"error": "no such node", "message": "not in this document"},
        }
    )
    driver = _Driver(connection)
    root = type("Root", (), {"id": "shared-root"})()

    node = AccessibilitySnapshotter(driver).snapshot(root)

    assert node.role == "document"
    assert [call["target"]["context"] for call in connection.calls()] == ["window-1", "frame-1"]
    assert connection.calls()[1]["arguments"][1] == {"sharedId": "shared-root"}


def test_snapshotter_raises_the_stale_error_when_no_frame_owns_the_root():
    from selenium.common.exceptions import StaleElementReferenceException
    from selenium.webdriver.remote.accessibility_snapshot import AccessibilitySnapshotter

    connection = _Connection({("script.callFunction", "window-1"): {"error": "no such node", "message": "gone"}})
    root = type("Root", (), {"id": "shared-root"})()

    with pytest.raises(StaleElementReferenceException):
        AccessibilitySnapshotter(_Driver(connection)).snapshot(root)


def test_snapshotter_reports_other_bidi_errors():
    from selenium.common.exceptions import WebDriverException
    from selenium.webdriver.remote.accessibility_snapshot import AccessibilitySnapshotter

    connection = _Connection({("script.callFunction", "window-1"): {"error": "no such frame", "message": "closed"}})

    with pytest.raises(WebDriverException, match="no such frame: closed"):
        AccessibilitySnapshotter(_Driver(connection)).snapshot(None)
