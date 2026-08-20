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

"""High-level permission management helpers for the WebDriver BiDi permissions module.

This module is copied verbatim into the generated ``selenium.webdriver.common.bidi``
package by Bazel (see ``create-bidi-src`` in ``py/BUILD.bazel``).  The generated
``permissions`` module imports :class:`PermissionsManager` and instantiates it in
``__init__``, adding a convenience layer on top of the CDDL-generated
``permissions.setPermission`` command.

:class:`PermissionsManager` keeps a client-side record of every override that has
been applied so that ``reset()`` with no descriptor argument can restore the browser
to its default ``prompt`` state without the caller having to track permission names
or origins themselves.

:class:`PermissionOverrideContext` is returned by :meth:`PermissionsManager.override`
and implements the context-manager protocol: it applies the requested state on
``__enter__`` and resets to ``prompt`` on ``__exit__``.
"""

from __future__ import annotations

import logging
from typing import Any, Literal

logger = logging.getLogger(__name__)


def _descriptor_name(descriptor: Any) -> str:
    """Extract the permission name from a string or PermissionDescriptor."""
    if isinstance(descriptor, str):
        return descriptor
    return descriptor.name


def _is_single_descriptor(descriptor: Any) -> bool:
    """Return True if *descriptor* is a single permission (str or PermissionDescriptor-like).

    Strings are iterable in Python, so a plain ``isinstance(d, Iterable)`` check
    would misidentify a permission name string as a collection.  We treat anything
    with a ``.name`` attribute as a ``PermissionDescriptor`` and anything that is a
    ``str`` as a bare permission name — both are "single" descriptors.
    """
    return isinstance(descriptor, str) or hasattr(descriptor, "name")


class PermissionOverrideContext:
    """Context manager for a temporary permission override.

    Returned by :meth:`PermissionsManager.override`; not normally instantiated
    directly.  The permission is applied on ``__enter__`` and reset to
    ``prompt`` (browser default) on ``__exit__``, regardless of whether the
    body raised an exception.
    """

    def __init__(
        self,
        manager: PermissionsManager,
        descriptor: Any,
        state: str,
        *,
        origin: str | None = None,
        user_context: str | None = None,
    ) -> None:
        self._manager = manager
        self._descriptor = descriptor
        self._state = state
        self._origin = origin
        self._user_context = user_context

    def __enter__(self) -> PermissionOverrideContext:
        self._manager._apply(self._descriptor, self._state, self._origin, self._user_context)
        return self

    def __exit__(self, exc_type: Any, exc_val: Any, exc_tb: Any) -> Literal[False]:
        self._manager.reset(self._descriptor, origin=self._origin, user_context=self._user_context)
        return False


class PermissionsManager:
    """Tracks and manages browser permission overrides.

    Instantiated once per ``Permissions`` module instance and stored as
    ``self._manager``.  All client-facing convenience methods on the generated
    ``Permissions`` class delegate here.

    The manager maintains a client-side dict of active overrides keyed by
    ``(permission_name, origin, user_context)``.  This enables
    :meth:`reset_all` to clean up every override without requiring the caller
    to keep their own records.
    """

    def __init__(self, permissions_module: Any, driver: Any) -> None:
        self._permissions = permissions_module
        self._driver = driver
        # (descriptor_name, origin, user_context) → state
        self._active_overrides: dict[tuple[str, str | None, str | None], str] = {}

    def _apply(
        self,
        descriptor: Any,
        state: str,
        origin: str | None,
        user_context: str | None,
    ) -> None:
        """Send the BiDi command and update the tracking dict."""
        self._permissions.set_permission(descriptor, state, origin=origin, user_context=user_context)
        name = _descriptor_name(descriptor)
        if state == "prompt":
            self._active_overrides.pop((name, origin, user_context), None)
        else:
            self._active_overrides[(name, origin, user_context)] = state
        logger.debug(
            "Permission %r set to %r (origin=%r, user_context=%r)",
            name,
            state,
            origin,
            user_context,
        )

    def grant(
        self,
        descriptor: Any,
        *,
        origin: str | None = None,
        user_context: str | None = None,
    ) -> None:
        """Grant one or more permissions.

        Args:
            descriptor: A single permission name string, a single
                ``PermissionDescriptor``, or an iterable of either.
            origin: Optional origin to scope the grant(s) to.
            user_context: Optional user context ID to scope the grant(s) to.
        """
        if _is_single_descriptor(descriptor):
            self._apply(descriptor, "granted", origin, user_context)
        else:
            for d in descriptor:
                self._apply(d, "granted", origin, user_context)

    def deny(
        self,
        descriptor: Any,
        *,
        origin: str | None = None,
        user_context: str | None = None,
    ) -> None:
        """Deny a permission.

        Args:
            descriptor: The permission name string or a ``PermissionDescriptor``.
            origin: Optional origin to scope the denial to.
            user_context: Optional user context ID to scope the denial to.
        """
        self._apply(descriptor, "denied", origin, user_context)

    def reset(
        self,
        descriptor: Any = None,
        *,
        origin: str | None = None,
        user_context: str | None = None,
    ) -> None:
        """Reset one or more permissions to ``prompt`` (the browser default).

        Called with no positional argument, resets every tracked override back
        to ``prompt`` — equivalent to the former ``reset_all()``.  Only
        overrides applied through the manager (``grant``, ``deny``, or
        ``override``) are tracked; overrides applied directly via
        ``set_permission`` are not.

        Called with a descriptor (or iterable of descriptors), resets only
        those specific permissions.

        Args:
            descriptor: A single permission name string, a single
                ``PermissionDescriptor``, an iterable of either, or ``None``
                to reset all tracked overrides.
            origin: Optional origin the override was scoped to (ignored when
                resetting all).
            user_context: Optional user context ID the override was scoped to
                (ignored when resetting all).
        """
        if descriptor is None:
            for name, o, uc in list(self._active_overrides):
                self._permissions.set_permission(name, "prompt", origin=o, user_context=uc)
                logger.debug(
                    "Permission %r reset (origin=%r, user_context=%r)",
                    name,
                    o,
                    uc,
                )
            self._active_overrides.clear()
        elif _is_single_descriptor(descriptor):
            self._apply(descriptor, "prompt", origin, user_context)
        else:
            for d in descriptor:
                self._apply(d, "prompt", origin, user_context)

    def override(
        self,
        descriptor: Any,
        state: str,
        *,
        origin: str | None = None,
        user_context: str | None = None,
    ) -> PermissionOverrideContext:
        """Return a context manager that applies *state* on enter and resets on exit.

        Args:
            descriptor: The permission name string or a ``PermissionDescriptor``.
            state: The desired permission state (``"granted"``, ``"denied"``, or
                ``"prompt"``).
            origin: Optional origin to scope the override to.
            user_context: Optional user context ID to scope the override to.

        Example::

            with driver.permissions.override("geolocation", "granted", origin=origin):
                # geolocation is granted inside this block
                ...
            # geolocation is reset to prompt here
        """
        return PermissionOverrideContext(
            self,
            descriptor,
            state,
            origin=origin,
            user_context=user_context,
        )
