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


from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from selenium.webdriver.common.bidi.common import command_builder


class ForcedColorsModeTheme:
    """ForcedColorsModeTheme."""

    LIGHT = "light"
    DARK = "dark"


class ScreenOrientationNatural:
    """ScreenOrientationNatural."""

    PORTRAIT = "portrait"
    LANDSCAPE = "landscape"


class ScreenOrientationType:
    """ScreenOrientationType."""

    PORTRAIT_PRIMARY = "portrait-primary"
    PORTRAIT_SECONDARY = "portrait-secondary"
    LANDSCAPE_PRIMARY = "landscape-primary"
    LANDSCAPE_SECONDARY = "landscape-secondary"


@dataclass
class SetForcedColorsModeThemeOverrideParameters:
    """SetForcedColorsModeThemeOverrideParameters."""

    theme: Any | None = None
    contexts: list[Any] = field(default_factory=list)
    user_contexts: list[Any] = field(default_factory=list)


@dataclass
class SetGeolocationOverrideParameters:
    """SetGeolocationOverrideParameters."""

    contexts: list[Any] = field(default_factory=list)
    user_contexts: list[Any] = field(default_factory=list)


@dataclass
class GeolocationCoordinates:
    """GeolocationCoordinates."""

    latitude: Any | None = None
    longitude: Any | None = None
    accuracy: Any | None = None
    altitude: Any | None = None
    altitude_accuracy: Any | None = None
    heading: Any | None = None
    speed: Any | None = None


@dataclass
class GeolocationPositionError:
    """GeolocationPositionError."""

    type: str = field(default="positionUnavailable", init=False)


@dataclass
class SetLocaleOverrideParameters:
    """SetLocaleOverrideParameters."""

    locale: Any | None = None
    contexts: list[Any] = field(default_factory=list)
    user_contexts: list[Any] = field(default_factory=list)


@dataclass
class NetworkConditionsOffline:
    """NetworkConditionsOffline."""

    type: str = field(default="offline", init=False)


@dataclass
class ScreenArea:
    """ScreenArea."""

    width: Any | None = None
    height: Any | None = None


@dataclass
class SetScreenSettingsOverrideParameters:
    """SetScreenSettingsOverrideParameters."""

    screen_area: Any | None = None
    contexts: list[Any] = field(default_factory=list)
    user_contexts: list[Any] = field(default_factory=list)


@dataclass
class ScreenOrientation:
    """ScreenOrientation."""

    natural: Any | None = None
    type: Any | None = None


@dataclass
class SetScreenOrientationOverrideParameters:
    """SetScreenOrientationOverrideParameters."""

    screen_orientation: Any | None = None
    contexts: list[Any] = field(default_factory=list)
    user_contexts: list[Any] = field(default_factory=list)


@dataclass
class SetUserAgentOverrideParameters:
    """SetUserAgentOverrideParameters."""

    user_agent: Any | None = None
    contexts: list[Any] = field(default_factory=list)
    user_contexts: list[Any] = field(default_factory=list)


@dataclass
class SetScriptingEnabledParameters:
    """SetScriptingEnabledParameters."""

    enabled: Any | None = None
    contexts: list[Any] = field(default_factory=list)
    user_contexts: list[Any] = field(default_factory=list)


@dataclass
class SetScrollbarTypeOverrideParameters:
    """SetScrollbarTypeOverrideParameters."""

    scrollbar_type: Any | None = None
    contexts: list[Any] = field(default_factory=list)
    user_contexts: list[Any] = field(default_factory=list)


@dataclass
class SetTimezoneOverrideParameters:
    """SetTimezoneOverrideParameters."""

    timezone: Any | None = None
    contexts: list[Any] = field(default_factory=list)
    user_contexts: list[Any] = field(default_factory=list)


@dataclass
class SetTouchOverrideParameters:
    """SetTouchOverrideParameters."""

    contexts: list[Any] = field(default_factory=list)
    user_contexts: list[Any] = field(default_factory=list)


@dataclass
class SetNetworkConditionsParameters:
    """SetNetworkConditionsParameters."""

    network_conditions: Any | None = None
    contexts: list[Any] = field(default_factory=list)
    user_contexts: list[Any] = field(default_factory=list)


# Backward-compatible alias for existing imports
setNetworkConditionsParameters = SetNetworkConditionsParameters


class Emulation:
    """WebDriver BiDi emulation module."""

    def __init__(self, conn) -> None:
        self._conn = conn

    def set_forced_colors_mode_theme_override(
        self,
        theme: Any | None = None,
        contexts: list[Any] | None = None,
        user_contexts: list[Any] | None = None,
    ):
        """Execute emulation.setForcedColorsModeThemeOverride."""
        if theme is None:
            raise TypeError("set_forced_colors_mode_theme_override() missing required argument: 'theme'")

        params = {
            "theme": theme,
            "contexts": contexts,
            "userContexts": user_contexts,
        }
        params = {k: v for k, v in params.items() if v is not None}
        cmd = command_builder("emulation.setForcedColorsModeThemeOverride", params)
        result = self._conn.execute(cmd)
        return result

    def set_locale_override(
        self,
        locale: Any | None = None,
        contexts: list[Any] | None = None,
        user_contexts: list[Any] | None = None,
    ):
        """Execute emulation.setLocaleOverride."""
        if locale is None:
            raise TypeError("set_locale_override() missing required argument: 'locale'")

        params = {
            "locale": locale,
            "contexts": contexts,
            "userContexts": user_contexts,
        }
        params = {k: v for k, v in params.items() if v is not None}
        cmd = command_builder("emulation.setLocaleOverride", params)
        result = self._conn.execute(cmd)
        return result

    def set_scrollbar_type_override(
        self,
        scrollbar_type: Any | None = None,
        contexts: list[Any] | None = None,
        user_contexts: list[Any] | None = None,
    ):
        """Execute emulation.setScrollbarTypeOverride."""
        if scrollbar_type is None:
            raise TypeError("set_scrollbar_type_override() missing required argument: 'scrollbar_type'")

        params = {
            "scrollbarType": scrollbar_type,
            "contexts": contexts,
            "userContexts": user_contexts,
        }
        params = {k: v for k, v in params.items() if v is not None}
        cmd = command_builder("emulation.setScrollbarTypeOverride", params)
        result = self._conn.execute(cmd)
        return result

    def set_touch_override(self, contexts: list[Any] | None = None, user_contexts: list[Any] | None = None):
        """Execute emulation.setTouchOverride."""
        params = {
            "contexts": contexts,
            "userContexts": user_contexts,
        }
        params = {k: v for k, v in params.items() if v is not None}
        cmd = command_builder("emulation.setTouchOverride", params)
        result = self._conn.execute(cmd)
        return result

    def set_geolocation_override(
        self,
        coordinates=None,
        error=None,
        contexts: list[Any] | None = None,
        user_contexts: list[Any] | None = None,
    ):
        """Execute emulation.setGeolocationOverride.

        Sets or clears the geolocation override for specified browsing or user contexts.

        Args:
            coordinates: A GeolocationCoordinates instance (or dict) to override the
                position, or ``None`` to clear a previously-set override.
            error: A GeolocationPositionError instance (or dict) to simulate a
                position-unavailable error.  Mutually exclusive with *coordinates*.
            contexts: List of browsing context IDs to target.
            user_contexts: List of user context IDs to target.
        """
        params: dict[str, Any] = {}
        if coordinates is not None:
            if isinstance(coordinates, dict):
                coords_dict = coordinates
            else:
                coords_dict = {}
                if coordinates.latitude is not None:
                    coords_dict["latitude"] = coordinates.latitude
                if coordinates.longitude is not None:
                    coords_dict["longitude"] = coordinates.longitude
                if coordinates.accuracy is not None:
                    coords_dict["accuracy"] = coordinates.accuracy
                if coordinates.altitude is not None:
                    coords_dict["altitude"] = coordinates.altitude
                if coordinates.altitude_accuracy is not None:
                    coords_dict["altitudeAccuracy"] = coordinates.altitude_accuracy
                if coordinates.heading is not None:
                    coords_dict["heading"] = coordinates.heading
                if coordinates.speed is not None:
                    coords_dict["speed"] = coordinates.speed
            params["coordinates"] = coords_dict
        if error is not None:
            if isinstance(error, dict):
                params["error"] = error
            else:
                params["error"] = {"type": error.type if error.type is not None else "positionUnavailable"}
        if contexts is not None:
            params["contexts"] = contexts
        if user_contexts is not None:
            params["userContexts"] = user_contexts
        cmd = command_builder("emulation.setGeolocationOverride", params)
        result = self._conn.execute(cmd)
        return result

    def set_timezone_override(
        self,
        timezone=None,
        contexts: list[Any] | None = None,
        user_contexts: list[Any] | None = None,
    ):
        """Execute emulation.setTimezoneOverride.

        Sets or clears the timezone override for specified browsing or user contexts.
        Pass ``timezone=None`` (or omit it) to clear a previously-set override.

        Args:
            timezone: IANA timezone string (e.g. ``"America/New_York"``) or ``None``
                to clear the override.
            contexts: List of browsing context IDs to target.
            user_contexts: List of user context IDs to target.
        """
        params: dict[str, Any] = {"timezone": timezone}
        if contexts is not None:
            params["contexts"] = contexts
        if user_contexts is not None:
            params["userContexts"] = user_contexts
        cmd = command_builder("emulation.setTimezoneOverride", params)
        return self._conn.execute(cmd)

    def set_scripting_enabled(
        self,
        enabled=None,
        contexts: list[Any] | None = None,
        user_contexts: list[Any] | None = None,
    ):
        """Execute emulation.setScriptingEnabled.

        Enables or disables scripting for specified browsing or user contexts.
        Pass ``enabled=None`` to restore the default behaviour.

        Args:
            enabled: ``True`` to enable scripting, ``False`` to disable it, or
                ``None`` to clear the override.
            contexts: List of browsing context IDs to target.
            user_contexts: List of user context IDs to target.
        """
        params: dict[str, Any] = {"enabled": enabled}
        if contexts is not None:
            params["contexts"] = contexts
        if user_contexts is not None:
            params["userContexts"] = user_contexts
        cmd = command_builder("emulation.setScriptingEnabled", params)
        return self._conn.execute(cmd)

    def set_user_agent_override(
        self,
        user_agent=None,
        contexts: list[Any] | None = None,
        user_contexts: list[Any] | None = None,
    ):
        """Execute emulation.setUserAgentOverride.

        Overrides the User-Agent string for specified browsing or user contexts.
        Pass ``user_agent=None`` to clear a previously-set override.

        Args:
            user_agent: Custom User-Agent string, or ``None`` to clear the override.
            contexts: List of browsing context IDs to target.
            user_contexts: List of user context IDs to target.
        """
        params: dict[str, Any] = {"userAgent": user_agent}
        if contexts is not None:
            params["contexts"] = contexts
        if user_contexts is not None:
            params["userContexts"] = user_contexts
        cmd = command_builder("emulation.setUserAgentOverride", params)
        return self._conn.execute(cmd)

    def set_screen_orientation_override(
        self,
        screen_orientation=None,
        contexts: list[Any] | None = None,
        user_contexts: list[Any] | None = None,
    ):
        """Execute emulation.setScreenOrientationOverride.

        Sets or clears the screen orientation override for specified browsing or
        user contexts.

        Args:
            screen_orientation: A :class:`ScreenOrientation` instance (or dict with
                ``natural`` and ``type`` keys) to lock the orientation, or ``None``
                to clear a previously-set override.
            contexts: List of browsing context IDs to target.
            user_contexts: List of user context IDs to target.
        """
        if screen_orientation is None:
            so_value = None
        elif isinstance(screen_orientation, dict):
            so_value = screen_orientation
        else:
            natural = screen_orientation.natural
            orientation_type = screen_orientation.type
            so_value = {
                "natural": natural.lower() if isinstance(natural, str) else natural,
                "type": orientation_type.lower() if isinstance(orientation_type, str) else orientation_type,
            }
        params: dict[str, Any] = {"screenOrientation": so_value}
        if contexts is not None:
            params["contexts"] = contexts
        if user_contexts is not None:
            params["userContexts"] = user_contexts
        cmd = command_builder("emulation.setScreenOrientationOverride", params)
        return self._conn.execute(cmd)

    def set_network_conditions(
        self,
        network_conditions=None,
        offline: bool | None = None,
        contexts: list[Any] | None = None,
        user_contexts: list[Any] | None = None,
    ):
        """Execute emulation.setNetworkConditions.

        Sets or clears network condition emulation for specified browsing or user
        contexts.

        Args:
            network_conditions: A dict with the raw ``networkConditions`` value
                (e.g. ``{"type": "offline"}``), or ``None`` to clear the override.
                Mutually exclusive with *offline*.
            offline: Convenience bool — ``True`` sets offline conditions,
                ``False`` clears them (sends ``null``).  When provided, this takes
                precedence over *network_conditions*.
            contexts: List of browsing context IDs to target.
            user_contexts: List of user context IDs to target.
        """
        if offline is not None:
            nc_value = {"type": "offline"} if offline else None
        else:
            nc_value = network_conditions
        params: dict[str, Any] = {"networkConditions": nc_value}
        if contexts is not None:
            params["contexts"] = contexts
        if user_contexts is not None:
            params["userContexts"] = user_contexts
        cmd = command_builder("emulation.setNetworkConditions", params)
        return self._conn.execute(cmd)

    def set_screen_settings_override(
        self,
        width: int | None = None,
        height: int | None = None,
        contexts: list[Any] | None = None,
        user_contexts: list[Any] | None = None,
    ):
        """Execute emulation.setScreenSettingsOverride.

        Sets or clears the screen settings override for specified browsing or user
        contexts.

        Args:
            width: The screen width in pixels, or ``None`` to clear the override.
            height: The screen height in pixels, or ``None`` to clear the override.
            contexts: List of browsing context IDs to target.
            user_contexts: List of user context IDs to target.
        """
        screen_area = None
        if width is not None or height is not None:
            screen_area = {}
            if width is not None:
                screen_area["width"] = width
            if height is not None:
                screen_area["height"] = height
        params: dict[str, Any] = {"screenArea": screen_area}
        if contexts is not None:
            params["contexts"] = contexts
        if user_contexts is not None:
            params["userContexts"] = user_contexts
        cmd = command_builder("emulation.setScreenSettingsOverride", params)
        return self._conn.execute(cmd)
