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

import pytest

from selenium.webdriver.common.bidi._permissions_handlers import PermissionOverrideContext
from selenium.webdriver.common.bidi.permissions import PermissionDescriptor, Permissions, PermissionState


class FakeConnection:
    def __init__(self):
        self.commands = []

    def execute(self, cmd):
        payload = next(cmd)
        self.commands.append(payload)
        try:
            cmd.send({})
        except StopIteration as exc:
            return exc.value
        raise AssertionError("BiDi command generator did not finish")

    def commands_named(self, method):
        return [c for c in self.commands if c["method"] == method]

    def last_set_permission(self):
        cmds = self.commands_named("permissions.setPermission")
        return cmds[-1]["params"] if cmds else None


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def make_permissions(conn=None):
    """Return a Permissions instance backed by *conn* (creates a new one if omitted)."""
    if conn is None:
        conn = FakeConnection()
    return Permissions(conn, driver=None), conn


# ---------------------------------------------------------------------------
# PermissionsManager unit tests (via the full Permissions class)
# ---------------------------------------------------------------------------


class TestGrant:
    def test_single_string(self):
        perms, conn = make_permissions()
        perms.grant("geolocation", origin="https://example.com")
        params = conn.last_set_permission()
        assert params["state"] == "granted"
        assert params["descriptor"] == {"name": "geolocation"}
        assert params["origin"] == "https://example.com"

    def test_single_permission_descriptor(self):
        perms, conn = make_permissions()
        perms.grant(PermissionDescriptor("camera"), origin="https://example.com")
        params = conn.last_set_permission()
        assert params["descriptor"] == {"name": "camera"}
        assert params["state"] == "granted"

    def test_list_of_strings(self):
        perms, conn = make_permissions()
        perms.grant(["geolocation", "camera"], origin="https://example.com")
        cmds = conn.commands_named("permissions.setPermission")
        names = {c["params"]["descriptor"]["name"] for c in cmds}
        assert names == {"geolocation", "camera"}
        assert all(c["params"]["state"] == "granted" for c in cmds)

    def test_list_of_permission_descriptors(self):
        perms, conn = make_permissions()
        perms.grant([PermissionDescriptor("geolocation"), PermissionDescriptor("camera")])
        cmds = conn.commands_named("permissions.setPermission")
        names = {c["params"]["descriptor"]["name"] for c in cmds}
        assert names == {"geolocation", "camera"}

    def test_list_scoped_to_same_origin(self):
        perms, conn = make_permissions()
        perms.grant(["geolocation", "camera"], origin="https://example.com")
        cmds = conn.commands_named("permissions.setPermission")
        assert all(c["params"]["origin"] == "https://example.com" for c in cmds)

    def test_origin_is_optional(self):
        perms, conn = make_permissions()
        perms.grant("notifications")
        params = conn.last_set_permission()
        assert params["state"] == "granted"
        assert "origin" not in params

    def test_user_context_is_optional(self):
        perms, conn = make_permissions()
        perms.grant("geolocation", user_context="ctx-1")
        params = conn.last_set_permission()
        assert params["userContext"] == "ctx-1"
        assert "origin" not in params

    def test_tracks_single_override(self):
        perms, conn = make_permissions()
        perms.grant("geolocation", origin="https://example.com")
        assert ("geolocation", "https://example.com", None) in perms._manager._active_overrides

    def test_tracks_each_override_in_list(self):
        perms, conn = make_permissions()
        perms.grant(["geolocation", "camera"], origin="https://example.com")
        assert ("geolocation", "https://example.com", None) in perms._manager._active_overrides
        assert ("camera", "https://example.com", None) in perms._manager._active_overrides


class TestDeny:
    def test_sends_denied_state(self):
        perms, conn = make_permissions()
        perms.deny("camera", origin="https://example.com")
        params = conn.last_set_permission()
        assert params["state"] == "denied"
        assert params["descriptor"] == {"name": "camera"}

    def test_origin_is_optional(self):
        perms, conn = make_permissions()
        perms.deny("microphone")
        params = conn.last_set_permission()
        assert params["state"] == "denied"
        assert "origin" not in params

    def test_tracks_override(self):
        perms, conn = make_permissions()
        perms.deny("camera", origin="https://example.com")
        assert ("camera", "https://example.com", None) in perms._manager._active_overrides


class TestReset:
    def test_single_string(self):
        perms, conn = make_permissions()
        perms.grant("geolocation", origin="https://example.com")
        perms.reset("geolocation", origin="https://example.com")
        params = conn.last_set_permission()
        assert params["state"] == "prompt"

    def test_list_of_strings(self):
        perms, conn = make_permissions()
        perms.grant(["geolocation", "camera"], origin="https://example.com")
        conn.commands.clear()
        perms.reset(["geolocation", "camera"], origin="https://example.com")
        cmds = conn.commands_named("permissions.setPermission")
        assert len(cmds) == 2
        assert all(c["params"]["state"] == "prompt" for c in cmds)

    def test_no_args_resets_all_tracked(self):
        perms, conn = make_permissions()
        perms.grant("geolocation", origin="https://a.com")
        perms.deny("camera", origin="https://b.com")
        conn.commands.clear()

        perms.reset()

        set_cmds = conn.commands_named("permissions.setPermission")
        states = {c["params"]["descriptor"]["name"]: c["params"]["state"] for c in set_cmds}
        assert states["geolocation"] == "prompt"
        assert states["camera"] == "prompt"

    def test_no_args_clears_tracking_dict(self):
        perms, conn = make_permissions()
        perms.grant("geolocation", origin="https://a.com")
        perms.deny("camera")
        perms.reset()
        assert perms._manager._active_overrides == {}

    def test_no_args_with_no_overrides_is_safe(self):
        perms, conn = make_permissions()
        perms.reset()
        assert conn.commands_named("permissions.setPermission") == []

    def test_removes_from_tracking(self):
        perms, conn = make_permissions()
        perms.grant("geolocation", origin="https://example.com")
        perms.reset("geolocation", origin="https://example.com")
        assert ("geolocation", "https://example.com", None) not in perms._manager._active_overrides

    def test_reset_untracked_permission_is_safe(self):
        perms, conn = make_permissions()
        perms.reset("geolocation", origin="https://example.com")
        params = conn.last_set_permission()
        assert params["state"] == "prompt"


class TestOverrideContextManager:
    def test_sets_permission_on_enter(self):
        perms, conn = make_permissions()
        with perms.override("geolocation", "granted", origin="https://example.com"):
            params = conn.last_set_permission()
            assert params["state"] == "granted"

    def test_resets_to_prompt_on_exit(self):
        perms, conn = make_permissions()
        with perms.override("geolocation", "granted", origin="https://example.com"):
            pass
        params = conn.last_set_permission()
        assert params["state"] == "prompt"

    def test_resets_on_exception(self):
        perms, conn = make_permissions()
        with pytest.raises(RuntimeError):
            with perms.override("geolocation", "granted", origin="https://example.com"):
                raise RuntimeError("test error")
        params = conn.last_set_permission()
        assert params["state"] == "prompt"

    def test_returns_context_object(self):
        perms, conn = make_permissions()
        with perms.override("geolocation", "denied") as ctx:
            assert isinstance(ctx, PermissionOverrideContext)

    def test_origin_and_user_context_are_optional(self):
        perms, conn = make_permissions()
        with perms.override("geolocation", "granted"):
            params = conn.last_set_permission()
            assert params["state"] == "granted"
            assert "origin" not in params
        params = conn.last_set_permission()
        assert params["state"] == "prompt"

    def test_does_not_track_after_exit(self):
        perms, conn = make_permissions()
        with perms.override("geolocation", "granted", origin="https://example.com"):
            pass
        assert ("geolocation", "https://example.com", None) not in perms._manager._active_overrides


# ---------------------------------------------------------------------------
# set_permission (existing behaviour, unchanged)
# ---------------------------------------------------------------------------


class TestSetPermission:
    def test_invalid_state_raises(self):
        perms, conn = make_permissions()
        with pytest.raises(ValueError, match="Invalid permission state"):
            perms.set_permission("geolocation", "invalid", "https://example.com")

    def test_accepts_permission_descriptor(self):
        perms, conn = make_permissions()
        perms.set_permission(PermissionDescriptor("geolocation"), PermissionState.GRANTED, "https://example.com")
        params = conn.last_set_permission()
        assert params["descriptor"] == {"name": "geolocation"}
        assert params["state"] == "granted"

    def test_embedded_origin_is_keyword_only(self):
        perms, conn = make_permissions()
        with pytest.raises(TypeError):
            perms.set_permission("geolocation", "granted", "https://example.com", None, "https://example.com")

    def test_embedded_origin_accepted_as_keyword(self):
        perms, conn = make_permissions()
        perms.set_permission(
            "geolocation",
            "granted",
            "https://example.com",
            embedded_origin="https://example.com",
        )
        params = conn.last_set_permission()
        assert params["embeddedOrigin"] == "https://example.com"


# ---------------------------------------------------------------------------
# PermissionDescriptor
# ---------------------------------------------------------------------------


class TestPermissionDescriptor:
    def test_stores_name(self):
        d = PermissionDescriptor("geolocation")
        assert d.name == "geolocation"

    def test_repr(self):
        d = PermissionDescriptor("camera")
        assert repr(d) == "PermissionDescriptor(name='camera')"


# ---------------------------------------------------------------------------
# PermissionState constants
# ---------------------------------------------------------------------------


class TestPermissionState:
    def test_constants(self):
        assert PermissionState.GRANTED == "granted"
        assert PermissionState.DENIED == "denied"
        assert PermissionState.PROMPT == "prompt"
