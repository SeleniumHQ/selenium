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

"""driver.accessibility_snapshot() and element.accessibility_snapshot() over BiDi (ADR 18205).

The shared corpus in common/src/web/accessibility is the cross-binding contract: every page
is snapshotted whole and compared with its recorded tree and text.
"""

import json
from pathlib import Path

import pytest

from selenium.common.exceptions import StaleElementReferenceException
from selenium.webdriver.common.by import By
from selenium.webdriver.remote.accessibility_snapshot import AccessibilityNode
from selenium.webdriver.remote.webelement import WebElement

CORPUS = Path(__file__).parents[6] / "common" / "src" / "web" / "accessibility"

# The atom records frames as leaves; the binding fills them in, so this page has its own test.
FRAMES_PAGE = "014-iframe"


def _corpus_pages():
    return [page for page in json.loads((CORPUS / "index.json").read_text(encoding="utf-8")) if page != FRAMES_PAGE]


def _engine(driver):
    name = driver.capabilities.get("browserName", "").lower()
    if "firefox" in name:
        return "firefox"
    if "safari" in name or "webkit" in name:
        return "webkit"
    return "chromium"


def _expected(driver, page, suffix):
    """The engine-specific expectation when one is recorded, else the shared one."""
    specific = CORPUS / f"{page}.expected.{_engine(driver)}.{suffix}"
    shared = CORPUS / f"{page}.expected.{suffix}"
    return (specific if specific.exists() else shared).read_text(encoding="utf-8")


def _serialize(node):
    """The corpus JSON form: every field written, `element` as the element's id."""
    out = {"role": node.role, "name": node.name, "description": node.description}
    if node.value is not None:
        out["value"] = node.value
    out["states"] = node.states
    if node.element is not None:
        out["element"] = node.element.get_attribute("id")
    out["children"] = [_serialize(child) for child in node.children]
    return out


@pytest.mark.parametrize("page", _corpus_pages())
def test_whole_page_snapshot_matches_the_corpus(driver, pages, page):
    pages.load(f"accessibility/{page}.html")

    tree = driver.accessibility_snapshot()

    assert _serialize(tree) == json.loads(_expected(driver, page, "json"))
    assert tree.to_text() + "\n" == _expected(driver, page, "txt")


def test_whole_page_snapshot_is_rooted_at_the_document(driver, pages):
    pages.load("accessibility/001-headings-and-landmarks.html")

    tree = driver.accessibility_snapshot()

    assert isinstance(tree, AccessibilityNode)
    assert tree.role == "document"
    assert isinstance(tree.element, WebElement)
    assert tree.element.tag_name == "html"


def test_element_references_are_usable(driver, pages):
    pages.load("accessibility/003-links-and-buttons.html")

    tree = driver.accessibility_snapshot()

    buttons = [node for node in _walk(tree) if node.role == "button"]
    assert buttons, "the page has buttons"
    assert buttons[0].element.tag_name in ("button", "input", "a")
    assert buttons[0].element.get_attribute("id") == _first_button_id(tree)


def test_subtree_snapshot_always_produces_a_node_for_its_root(driver, pages):
    pages.load("accessibility/005-lists.html")
    root = driver.find_element(By.TAG_NAME, "body")

    tree = root.accessibility_snapshot()

    assert tree.role == "generic"
    assert tree.element.tag_name == "body"
    assert any(node.role == "list" for node in _walk(tree))


def test_subtree_snapshot_of_a_node_from_an_earlier_snapshot(driver, pages):
    pages.load("accessibility/005-lists.html")
    first_list = next(node for node in _walk(driver.accessibility_snapshot()) if node.role == "list")

    tree = first_list.element.accessibility_snapshot()

    assert tree.role == "list"
    assert [child.role for child in tree.children] == [child.role for child in first_list.children]


def test_frames_are_stitched_in(driver, pages):
    pages.load(f"accessibility/{FRAMES_PAGE}.html")

    tree = driver.accessibility_snapshot()

    frames = [node for node in _walk(tree) if node.role == "iframe"]
    assert [frame.name for frame in frames] == ["Embedded content", ""]
    for frame in frames:
        assert len(frame.children) == 1, "a reachable frame carries its document as the one child"
        assert frame.children[0].role == "document"
        assert isinstance(frame.children[0].element, WebElement)
    # The text form renders the stitched tree; the atom-level expectation stops at the leaves.
    assert tree.to_text().count("- document") == 3
    # A reference inside a frame works through classic commands once that frame is current.
    driver.switch_to.frame(frames[0].element)
    try:
        assert frames[0].children[0].element.tag_name == "html"
    finally:
        driver.switch_to.default_content()


def test_subtree_snapshot_of_an_iframe_element_carries_its_document(driver, pages):
    pages.load(f"accessibility/{FRAMES_PAGE}.html")
    frame = driver.find_element(By.ID, "frame")

    tree = frame.accessibility_snapshot()

    assert tree.role == "iframe"
    assert tree.name == "Embedded content"
    assert [child.role for child in tree.children] == ["document"]


def test_subtree_snapshot_inside_a_frame(driver, pages):
    pages.load(f"accessibility/{FRAMES_PAGE}.html")
    driver.switch_to.frame("frame")
    try:
        body = driver.find_element(By.TAG_NAME, "body")
        tree = body.accessibility_snapshot()
        # The root is the frame's body, not the top document that owns the window.
        assert tree.role == "generic"
        assert tree.name == ""
        assert tree.element.tag_name == "body"
    finally:
        driver.switch_to.default_content()


def test_whole_page_snapshot_ignores_the_frame_the_driver_switched_to(driver, pages):
    pages.load(f"accessibility/{FRAMES_PAGE}.html")
    driver.switch_to.frame("frame")
    try:
        tree = driver.accessibility_snapshot()
    finally:
        driver.switch_to.default_content()

    assert tree.name == "Frames"


def test_a_stale_root_raises_the_stale_element_error(driver, pages):
    pages.load("accessibility/005-lists.html")
    root = driver.find_element(By.TAG_NAME, "body")
    pages.load("accessibility/001-headings-and-landmarks.html")

    with pytest.raises(StaleElementReferenceException):
        root.accessibility_snapshot()


def test_a_detached_root_raises_the_stale_element_error(driver, pages):
    pages.load("accessibility/005-lists.html")
    item = driver.find_element(By.TAG_NAME, "li")
    driver.execute_script("arguments[0].remove()", item)

    with pytest.raises(StaleElementReferenceException):
        item.accessibility_snapshot()


def test_a_snapshot_is_a_copy(driver, pages):
    pages.load("accessibility/005-lists.html")
    before = driver.accessibility_snapshot()
    driver.execute_script("document.querySelector('li').textContent = 'changed'")

    after = driver.accessibility_snapshot()

    assert before.to_text() != after.to_text()
    assert "changed" in after.to_text()


def _walk(node):
    yield node
    for child in node.children:
        yield from _walk(child)


def _first_button_id(tree):
    return next(node for node in _walk(tree) if node.role == "button").element.get_attribute("id")
