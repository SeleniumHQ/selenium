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
it. This module holds the parts that are the binding's: the public node type and
its text form, the decoder from the BiDi wire shape, frame stitching, and the
mapping of element references to :class:`WebElement`.

The output is *computed* from the DOM following WAI-ARIA, html-aam and accname;
it is not the browser's own accessibility tree and can differ from it at the
edges.
"""

from __future__ import annotations

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
# Where the atom is kept inside the sandbox realm once installed.
_GLOBAL = "__seleniumAccessibilitySnapshot"
_SERIALIZATION_OPTIONS = {"maxDomDepth": 0}

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


def node_from_remote_value(value: dict[str, Any], element_factory: Callable[[str], WebElement]) -> AccessibilityNode:
    """Decode a snapshot from the ``script.callFunction`` result that carries it.

    Args:
        value: The BiDi remote value of the atom's return value: an ``object`` whose
            value is a list of ``[key, value]`` pairs, with arrays as ``array`` and
            elements as ``node`` values carrying a ``sharedId``.
        element_factory: Makes the element for a shared id.

    Returns:
        The decoded node, with its subtree.
    """
    fields = _object_fields(value)
    element = None
    element_value = fields.get("element")
    if element_value is not None and element_value.get("type") == "node" and "sharedId" in element_value:
        element = element_factory(element_value["sharedId"])
    value_field = fields.get("value")
    return AccessibilityNode(
        role=_string(fields["role"]),
        name=_string(fields["name"]),
        description=_string(fields.get("description", {"type": "string", "value": ""})),
        value=_string(value_field) if value_field is not None else None,
        states={key: _state(state) for key, state in _object_fields(fields["states"]).items()},
        element=element,
        children=[node_from_remote_value(child, element_factory) for child in fields["children"].get("value", [])],
    )


def _object_fields(value: dict[str, Any]) -> dict[str, Any]:
    if value.get("type") != "object":
        raise WebDriverException(f"accessibility snapshot: expected an object remote value, got {value.get('type')!r}")
    return {_key(key): entry for key, entry in value.get("value", [])}


def _key(key: Any) -> str:
    # A property name is written as a plain string, or as a string remote value.
    return key if isinstance(key, str) else _string(key)


def _string(value: dict[str, Any]) -> str:
    return str(value.get("value", ""))


def _state(value: dict[str, Any]) -> StateValue:
    kind = value.get("type")
    raw = value.get("value")
    if kind == "boolean":
        return bool(raw)
    if kind == "number":
        return int(raw if raw is not None else 0)
    return str(raw)


def _atom() -> str:
    """The atom's source, a JavaScript function expression, read once from the package."""
    global _atom_source
    if _atom_source is None:
        package = ".".join(__name__.split(".")[:-1])
        data = pkgutil.get_data(package, "accessibilitySnapshot.js")
        if data is None:
            raise FileNotFoundError(f"Could not find accessibilitySnapshot.js in package {package}")
        _atom_source = data.decode("utf8")
    return _atom_source


class AccessibilitySnapshotter:
    """Takes snapshots for one driver.

    Installs the atom in the sandbox realm of each document and stitches child
    frames into the tree.
    """

    def __init__(self, driver: WebDriver) -> None:
        self._driver = driver
        self._preloaded = False

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
        self._ensure_preload()
        top = self._driver.current_window_handle
        if root is None:
            return self._snapshot_context(top, None)
        # The element may live in any frame of the window. Chromium resolves its shared
        # id only in the document that owns it; Firefox resolves it in any document of
        # the browsing context group, so the script checks ownership itself and each
        # context is tried until the owner is found.
        for context in self._contexts(top):
            try:
                return self._snapshot_context(context, root)
            except _NoSuchNode:
                continue
        raise StaleElementReferenceException("the snapshot root is no longer attached to a document")

    def _ensure_preload(self) -> None:
        # New documents get the atom installed as they load; documents that predate
        # the preload install it on first use, in _call.
        if self._preloaded:
            return
        try:
            self._driver.script.add_preload_script(
                function_declaration=f"() => {{ globalThis.{_GLOBAL} = ({_atom()}); }}", sandbox=_SANDBOX
            )
        except WebDriverException as e:
            # Left unset, so the next snapshot tries again.
            logger.debug("accessibility snapshot: preload not installed, falling back to on-demand install: %s", e)
            return
        self._preloaded = True

    def _snapshot_context(self, context: str, root: WebElement | None) -> AccessibilityNode:
        arguments = [{"sharedId": root.id}] if root is not None else []
        result = self._call(context, self._declaration(f"globalThis.{_GLOBAL}", root), arguments)
        if result is None:
            # The realm has no atom yet (a document loaded before the preload, or a
            # remote end without preload support): install it and run in one call.
            result = self._call(
                context, self._declaration(f"(globalThis.{_GLOBAL} = ({_atom()}))", root), arguments, final=True
            )
        assert result is not None
        if result.get("type") == "null":
            # Another document owns the root (Firefox resolves shared ids group-wide).
            raise _NoSuchNode()
        node = node_from_remote_value(result, self._element)
        self._stitch(context, node)
        return node

    @staticmethod
    def _declaration(atom: str, root: WebElement | None) -> str:
        """The function to call: the whole page, or a root this document owns, else null."""
        if root is None:
            return f"() => {atom}()"
        return f"(root) => root && root.ownerDocument === document ? {atom}(root) : null"

    def _call(self, context: str, declaration: str, arguments: list[Any], final: bool = False) -> dict[str, Any] | None:
        """Run ``declaration`` in the sandbox of ``context``; None when it threw and a retry may help."""
        try:
            raw = self._driver.script.call_function(
                function_declaration=declaration,
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
            text = str(details.get("text", details))
            if "detached" in text:
                raise StaleElementReferenceException("the snapshot root is no longer attached to a document")
            if not final:
                return None
            raise WebDriverException(f"accessibility snapshot failed in the page: {text}")
        return raw.get("result")

    def _stitch(self, context: str, node: AccessibilityNode) -> None:
        """Replace an ``iframe`` node's children, here or below, with its document's tree where reachable."""
        if node.role == "iframe" and node.element is not None:
            child_context = self._frame_context(context, node.element)
            if child_context is not None:
                try:
                    node.children = [self._snapshot_context(child_context, None)]
                except (_NoSuchNode, WebDriverException) as e:
                    # Gone between discovery and the call, or mid-navigation: the frame
                    # stays a leaf (ADR §1). Anything else is a real failure.
                    if not _frame_unreachable(e):
                        raise
                    logger.debug("accessibility snapshot: frame %s not reachable: %s", child_context, e)
            return
        for child in node.children:
            self._stitch(context, child)

    def _frame_context(self, context: str, frame: WebElement) -> str | None:
        """The browsing context id of a frame element, from its WindowProxy; None when it has none."""
        try:
            raw = self._driver.script.call_function(
                function_declaration="(frame) => frame.contentWindow",
                await_promise=False,
                target={"context": context, "sandbox": _SANDBOX},
                arguments=[{"sharedId": frame.id}],
                result_ownership="none",
            )
        except WebDriverException as e:
            if not _frame_unreachable(e):
                raise
            logger.debug("accessibility snapshot: no browsing context for frame: %s", e)
            return None
        if not isinstance(raw, dict) or raw.get("type") != "success":
            return None
        window = raw.get("result") or {}
        if window.get("type") != "window":
            return None
        return (window.get("value") or {}).get("context")

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
