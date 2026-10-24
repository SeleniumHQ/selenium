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

"""Accessibility snapshots computed in the page (ADR 18205).

The tree is computed by the ``accessibility-snapshot`` atom of ``@selenium/atoms``,
run over WebDriver BiDi in a sandbox realm so page scripts cannot interfere with
it. The atom's wire entry hands the tree back as one JSON string beside the
element and frame references, so this module holds only what is the binding's:
the public node type and its text form, the mapping of references to
:class:`WebElement`, and frame stitching across browsing contexts.

The output is *computed* from the DOM following WAI-ARIA, html-aam and accname;
it is not the browser's own accessibility tree and can differ from it at the
edges.
"""

from __future__ import annotations

import json
import logging
import pkgutil
from collections.abc import Callable, Iterator
from dataclasses import dataclass, field
from typing import TYPE_CHECKING, Any

from selenium.common.exceptions import StaleElementReferenceException, WebDriverException

if TYPE_CHECKING:
    from selenium.webdriver.remote.webdriver import WebDriver
    from selenium.webdriver.remote.webelement import WebElement

logger = logging.getLogger(__name__)

StateValue = bool | int | str
"""A value in :attr:`AccessibilityNode.states`: ``True``/``False``, a level, or ``"mixed"``."""

# The order the text form writes states in (ADR 18205 §1).
_STATE_ORDER = ("checked", "pressed", "expanded", "selected", "level", "disabled", "focused")

# The sandbox realm the atom runs in: page scripts cannot reach its prototypes.
_SANDBOX = "selenium"
_SERIALIZATION_OPTIONS = {"maxDomDepth": 0}
_STALE_MESSAGE = "the snapshot root is no longer attached to a document"

_atom_source: str | None = None


@dataclass
class AccessibilityNode:
    """One node of an accessibility snapshot.

    Attributes:
        role: The WAI-ARIA role token; ``"text"`` for text leaves and ``"iframe"``
            for frames, under which the frame's own tree is attached.
        name: The computed accessible name, ``""`` when there is none.
        description: The computed accessible description, ``""`` when there is none.
        value: The current value for textbox, searchbox, combobox and range roles;
            ``None`` where the role has none. A password field's value is masked.
        states: ``checked``, ``pressed``, ``expanded``, ``selected``, ``level``,
            ``disabled`` and ``focused``, each present only when it applies; new keys
            may be added in any release, so ignore keys you do not recognise.
        element: The element the node is backed by, usable for further commands,
            or ``None`` for text leaves. An element inside a child frame can be
            used through classic commands only once the driver has switched to
            that frame.
        children: The child nodes, ``[]`` for leaves.
    """

    role: str
    name: str
    description: str = ""
    value: str | None = None
    states: dict[str, StateValue] = field(default_factory=dict)
    element: WebElement | None = None
    children: list[AccessibilityNode] = field(default_factory=list)

    def to_text(self) -> str:
        """Render the tree as text, one node per line.

        The line grammar is ``- role "name" [state] [state=value]: value``, children
        indented two spaces, text leaves written as ``- text: content``. An empty
        name is left out, as is an absent or empty value; a ``True`` state is
        written bare, a ``False`` one left out, any other value spelled. A line
        break or backslash in a value is escaped so a node never spans two lines.
        The description and element references are not rendered.

        Returns:
            The text form, without a trailing newline.
        """
        return "\n".join(self._lines(""))

    def _lines(self, indent: str) -> Iterator[str]:
        yield indent + self._line()
        for child in self.children:
            yield from child._lines(indent + "  ")

    def _line(self) -> str:
        if self.role == "text":
            return f"- text: {self.name}"
        out = f"- {self.role}"
        if self.name != "":
            out += " " + _quote(self.name)
        for key in _STATE_ORDER:
            if key not in self.states:
                continue
            state = self.states[key]
            if state is True:
                out += f" [{key}]"
            elif state is not False:
                out += f" [{key}={state}]"
        if self.value:
            out += ": " + _one_line(self.value)
        return out


def _quote(name: str) -> str:
    return '"' + name.replace("\\", "\\\\").replace('"', '\\"') + '"'


def _one_line(value: str) -> str:
    return value.replace("\\", "\\\\").replace("\r", "\\r").replace("\n", "\\n")


def node_from_wire(
    data: dict[str, Any],
    elements: list[WebElement],
    frame_children: Callable[[int], list[AccessibilityNode]],
) -> AccessibilityNode:
    """Build the node tree from the atom's wire form.

    Args:
        data: The parsed JSON of the tree: the node's fields, with ``element`` an
            index into ``elements`` and, on a frame node, ``frame`` an index the
            binding resolves to the frame's own tree.
        elements: The elements the tree references, in the atom's order.
        frame_children: The children of a frame node, from its ``frame`` index: the
            frame's document, or nothing when it cannot be reached.

    Returns:
        The node, with its subtree.
    """
    element_index = data.get("element")
    if "frame" in data:
        children = frame_children(data["frame"])
    else:
        children = [node_from_wire(child, elements, frame_children) for child in data["children"]]
    return AccessibilityNode(
        role=data["role"],
        name=data["name"],
        description=data.get("description", ""),
        value=data.get("value"),
        states=dict(data["states"]),
        element=elements[element_index] if element_index is not None else None,
        children=children,
    )


def _atom() -> str:
    """The atom's wire entry, a JavaScript function expression, read once from the package."""
    global _atom_source
    if _atom_source is None:
        package = ".".join(__name__.split(".")[:-1])
        data = pkgutil.get_data(package, "accessibilitySnapshot.js")
        if data is None:
            raise FileNotFoundError(f"Could not find accessibilitySnapshot.js in package {package}")
        _atom_source = data.decode("utf8")
    return _atom_source


class AccessibilitySnapshotter:
    """Takes snapshots for one driver: runs the atom in each document and stitches child frames into the tree."""

    def __init__(self, driver: WebDriver) -> None:
        self._driver = driver

    def snapshot(self, root: WebElement | None) -> AccessibilityNode:
        """Snapshot the whole page, or the subtree under ``root``.

        Args:
            root: The element whose subtree to snapshot, or ``None`` for the page
                of the current window's top-level browsing context.

        Returns:
            The snapshot, with every reachable child frame's tree attached under
            its ``iframe`` node.

        Raises:
            StaleElementReferenceException: When ``root`` no longer belongs to a document.
        """
        top = self._driver.current_window_handle
        if root is None:
            node = self._snapshot_context(top, None)
            if node is None:
                raise WebDriverException("accessibility snapshot: the script returned nothing")
            return node
        # The element may live in any frame of the window. Chromium resolves its shared
        # id only in the document that owns it; Firefox resolves it in any document of
        # the browsing context group, so the atom checks ownership itself and each
        # context is tried until the owner is found.
        for context in self._contexts(top):
            try:
                node = self._snapshot_context(context, root.id)
            except _NoSuchNode:
                continue
            if node is not None:
                return node
        raise StaleElementReferenceException(_STALE_MESSAGE)

    def _snapshot_context(self, context: str, root_id: str | None) -> AccessibilityNode | None:
        """The snapshot of ``context``, or None when another document owns the root."""
        arguments = [{"sharedId": root_id}] if root_id is not None else []
        result = self._call(context, arguments)
        if result.get("type") == "null":
            return None
        fields = _object_fields(result)
        if "error" in fields:
            # The only error the atom reports as data: the root left its document.
            raise StaleElementReferenceException(_STALE_MESSAGE)
        elements = [self._element(_shared_id(node)) for node in fields["elements"].get("value", [])]
        windows = [_context_of(window) for window in fields["windows"].get("value", [])]
        return node_from_wire(
            json.loads(_string(fields["json"])),
            elements,
            lambda index: self._stitch(windows[index]),
        )

    def _call(self, context: str, arguments: list[Any]) -> dict[str, Any]:
        """Run the atom's wire entry in the sandbox of ``context`` and return the remote value of its result."""
        try:
            raw = self._driver.script.call_function(
                function_declaration=f"(root) => ({_atom()})(root)",
                await_promise=False,
                target={"context": context, "sandbox": _SANDBOX},
                arguments=arguments,
                result_ownership="none",
                serialization_options=_SERIALIZATION_OPTIONS,
            )
        except WebDriverException as e:
            # The BiDi "no such node" error: the document of this context does not own
            # the root's shared id, either because the root lives in another frame or
            # because its document is gone.
            if "no such node" in str(e):
                raise _NoSuchNode() from e
            raise
        if not isinstance(raw, dict):
            raise WebDriverException(f"accessibility snapshot: unexpected script result {raw!r}")
        if raw.get("type") == "exception":
            details = raw.get("exceptionDetails") or {}
            raise WebDriverException(f"accessibility snapshot failed in the page: {details.get('text', details)}")
        return raw.get("result") or {}

    def _stitch(self, context: str | None) -> list[AccessibilityNode]:
        """The document of a frame as the frame node's one child, or no children when unreachable."""
        if context is None:
            return []
        try:
            document = self._snapshot_context(context, None)
        except (_NoSuchNode, WebDriverException) as e:
            # Gone between discovery and the call, or mid-navigation: the frame stays
            # a leaf (ADR §1). Anything else is a real failure.
            if not _frame_unreachable(e):
                raise
            logger.debug("accessibility snapshot: frame %s not reachable: %s", context, e)
            return []
        return [document] if document is not None else []

    def _contexts(self, top: str) -> Iterator[str]:
        """The window's browsing contexts, top-level first, then each frame depth-first."""
        yield top
        stack = list(self._driver.browsing_context.get_tree(root=top) or [])
        while stack:
            info = stack.pop(0)
            if info.context != top:
                yield info.context
            stack = list(info.children or []) + stack

    def _element(self, shared_id: str) -> WebElement:
        from selenium.webdriver.remote.webelement import WebElement

        return WebElement(self._driver, shared_id)


class _NoSuchNode(Exception):
    """A shared id that the targeted document does not own."""


def _frame_unreachable(e: Exception) -> bool:
    """Whether an error says a frame or its document is gone, rather than that a command failed."""
    message = str(e)
    return isinstance(e, _NoSuchNode) or "no such frame" in message or "no such node" in message


def _object_fields(value: dict[str, Any]) -> dict[str, Any]:
    if value.get("type") != "object":
        raise WebDriverException(f"accessibility snapshot: expected an object remote value, got {value.get('type')!r}")
    # A property name is written as a plain string, or as a string remote value.
    return {key if isinstance(key, str) else _string(key): entry for key, entry in value.get("value", [])}


def _string(value: dict[str, Any]) -> str:
    return str(value.get("value", ""))


def _shared_id(node: dict[str, Any]) -> str:
    shared_id = node.get("sharedId")
    if node.get("type") != "node" or not shared_id:
        raise WebDriverException("accessibility snapshot: expected a node reference in the elements list")
    return str(shared_id)


def _context_of(window: dict[str, Any]) -> str | None:
    """The browsing context id of a window remote value; None for a frame with no reachable context."""
    if window.get("type") != "window":
        return None
    return (window.get("value") or {}).get("context")
