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

from selenium.webdriver.remote.accessibility_snapshot import AccessibilityNode, node_from_remote_value

CORPUS = Path(__file__).parents[6] / "common" / "src" / "web" / "accessibility"


def _node_from_json(data):
    """The corpus JSON as nodes; `element` holds the recorded id, which the text form never renders."""
    return AccessibilityNode(
        role=data["role"],
        name=data["name"],
        description=data["description"],
        value=data.get("value"),
        states=data["states"],
        element=data.get("element"),
        children=[_node_from_json(child) for child in data["children"]],
    )


def _corpus_pages():
    return json.loads((CORPUS / "index.json").read_text(encoding="utf-8"))


@pytest.mark.parametrize("page", _corpus_pages())
def test_to_text_matches_the_corpus(page):
    """Every expected.txt is the reference renderer's output over its expected.json; the port must agree."""
    tree = _node_from_json(json.loads((CORPUS / f"{page}.expected.json").read_text(encoding="utf-8")))
    expected = (CORPUS / f"{page}.expected.txt").read_text(encoding="utf-8")
    assert tree.to_text() + "\n" == expected


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


def _remote(type_, value=None, **extra):
    out = {"type": type_}
    if value is not None:
        out["value"] = value
    out.update(extra)
    return out


def _remote_object(**fields):
    return _remote("object", [[key, value] for key, value in fields.items()])


def test_node_from_remote_value_decodes_the_wire_shape():
    """A script.callFunction result: objects as key/value pairs, arrays, nodes with a sharedId."""
    wire = _remote_object(
        role=_remote("string", "button"),
        name=_remote("string", "Save"),
        description=_remote("string", "Saves the form"),
        states=_remote_object(pressed=_remote("string", "mixed"), disabled=_remote("boolean", True)),
        element=_remote("node", {"nodeType": 1}, sharedId="f.1.e.42"),
        children=_remote(
            "array",
            [
                _remote_object(
                    role=_remote("string", "text"),
                    name=_remote("string", "Save"),
                    description=_remote("string", ""),
                    states=_remote_object(),
                    children=_remote("array", []),
                ),
                _remote_object(
                    role=_remote("string", "heading"),
                    name=_remote("string", "H"),
                    description=_remote("string", ""),
                    value=_remote("string", "v"),
                    states=_remote_object(level=_remote("number", 2)),
                    element=_remote("node", {"nodeType": 1}, sharedId="f.1.e.43"),
                    children=_remote("array", []),
                ),
            ],
        ),
    )
    made = []

    def factory(shared_id):
        made.append(shared_id)
        return f"element:{shared_id}"

    node = node_from_remote_value(wire, factory)

    assert node.role == "button"
    assert node.name == "Save"
    assert node.description == "Saves the form"
    assert node.value is None
    assert node.states == {"pressed": "mixed", "disabled": True}
    assert node.element == "element:f.1.e.42"
    text, heading = node.children
    assert text.role == "text"
    assert text.element is None
    assert text.children == []
    assert heading.value == "v"
    assert heading.states == {"level": 2}
    assert isinstance(heading.states["level"], int)
    assert made == ["f.1.e.42", "f.1.e.43"]
