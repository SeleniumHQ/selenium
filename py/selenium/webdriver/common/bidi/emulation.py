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

from typing import Any, Optional, Union

from selenium.webdriver.common.bidi.common import command_builder


class GeolocationCoordinates:
    """Represents geolocation coordinates."""

    def __init__(
        self,
        latitude: float,
        longitude: float,
        accuracy: float = 1.0,
        altitude: Optional[float] = None,
        altitude_accuracy: Optional[float] = None,
        heading: Optional[float] = None,
        speed: Optional[float] = None,
    ):
        """Initialize GeolocationCoordinates.

        Parameters:
        -----------
            latitude: Latitude coordinate (-90.0 to 90.0).
            longitude: Longitude coordinate (-180.0 to 180.0).
            accuracy: Accuracy in meters (>= 0.0), defaults to 1.0.
            altitude: Altitude in meters or None, defaults to None.
            altitude_accuracy: Altitude accuracy in meters (>= 0.0) or None, defaults to None.
            heading: Heading in degrees (0.0 to 360.0) or None, defaults to None.
            speed: Speed in meters per second (>= 0.0) or None, defaults to None.

        Raises:
        ------
            ValueError: If coordinates are out of valid range or if altitude_accuracy is provided without altitude.
        """
        self.latitude = latitude
        self.longitude = longitude
        self.accuracy = accuracy
        self.altitude = altitude
        self.altitude_accuracy = altitude_accuracy
        self.heading = heading
        self.speed = speed

    @property
    def latitude(self):
        return self._latitude

    @latitude.setter
    def latitude(self, value):
        if not (-90.0 <= value <= 90.0):
            raise ValueError("latitude must be between -90.0 and 90.0")
        self._latitude = value

    @property
    def longitude(self):
        return self._longitude

    @longitude.setter
    def longitude(self, value):
        if not (-180.0 <= value <= 180.0):
            raise ValueError("longitude must be between -180.0 and 180.0")
        self._longitude = value

    @property
    def accuracy(self):
        return self._accuracy

    @accuracy.setter
    def accuracy(self, value):
        if value < 0.0:
            raise ValueError("accuracy must be >= 0.0")
        self._accuracy = value

    @property
    def altitude(self):
        return self._altitude

    @altitude.setter
    def altitude(self, value):
        self._altitude = value

    @property
    def altitude_accuracy(self):
        return self._altitude_accuracy

    @altitude_accuracy.setter
    def altitude_accuracy(self, value):
        if value is not None and self.altitude is None:
            raise ValueError("altitude_accuracy cannot be set without altitude")
        if value is not None and value < 0.0:
            raise ValueError("altitude_accuracy must be >= 0.0")
        self._altitude_accuracy = value

    @property
    def heading(self):
        return self._heading

    @heading.setter
    def heading(self, value):
        if value is not None and not (0.0 <= value < 360.0):
            raise ValueError("heading must be between 0.0 and 360.0")
        self._heading = value

    @property
    def speed(self):
        return self._speed

    @speed.setter
    def speed(self, value):
        if value is not None and value < 0.0:
            raise ValueError("speed must be >= 0.0")
        self._speed = value

    def to_dict(self) -> dict[str, Union[float, None]]:
        result: dict[str, Union[float, None]] = {
            "latitude": self.latitude,
            "longitude": self.longitude,
            "accuracy": self.accuracy,
        }

        if self.altitude is not None:
            result["altitude"] = self.altitude

        if self.altitude_accuracy is not None:
            result["altitudeAccuracy"] = self.altitude_accuracy

        if self.heading is not None:
            result["heading"] = self.heading

        if self.speed is not None:
            result["speed"] = self.speed

        return result


class GeolocationPositionError:
    """Represents a geolocation position error."""

    TYPE_POSITION_UNAVAILABLE = "positionUnavailable"

    def __init__(self, type: str = TYPE_POSITION_UNAVAILABLE):
        if type != self.TYPE_POSITION_UNAVAILABLE:
            raise ValueError(f'type must be "{self.TYPE_POSITION_UNAVAILABLE}"')
        self.type = type

    def to_dict(self) -> dict[str, str]:
        return {"type": self.type}


class Emulation:
    """
    BiDi implementation of the emulation module.
    """

    def __init__(self, conn):
        self.conn = conn

    def set_geolocation_override(
        self,
        coordinates: Optional[GeolocationCoordinates] = None,
        error: Optional[GeolocationPositionError] = None,
        contexts: Optional[list[str]] = None,
        user_contexts: Optional[list[str]] = None,
    ) -> None:
        """Set geolocation override for the given contexts or user contexts.

        Parameters:
        -----------
            coordinates: Geolocation coordinates to emulate, or None.
            error: Geolocation error to emulate, or None.
            contexts: List of browsing context IDs to apply the override to.
            user_contexts: List of user context IDs to apply the override to.

        Raises:
        ------
            ValueError: If both coordinates and error are provided, or if both contexts
                       and user_contexts are provided, or if neither contexts nor
                       user_contexts are provided.
        """
        if coordinates is not None and error is not None:
            raise ValueError("Cannot specify both coordinates and error")

        if contexts is not None and user_contexts is not None:
            raise ValueError("Cannot specify both contexts and userContexts")

        if contexts is None and user_contexts is None:
            raise ValueError("Must specify either contexts or userContexts")

        params: dict[str, Any] = {}

        if coordinates is not None:
            params["coordinates"] = coordinates.to_dict()
        elif error is not None:
            params["error"] = error.to_dict()

        if contexts is not None:
            params["contexts"] = contexts
        elif user_contexts is not None:
            params["userContexts"] = user_contexts

        self.conn.execute(command_builder("emulation.setGeolocationOverride", params))

    def set_timezone_override(
        self,
        timezone: Optional[str] = None,
        contexts: Optional[list[str]] = None,
        user_contexts: Optional[list[str]] = None,
    ) -> None:
        """Set timezone override for the given contexts or user contexts.

        Parameters:
        -----------
            timezone: Timezone identifier (IANA timezone name or offset string like '+01:00'),
                     or None to clear the override.
            contexts: List of browsing context IDs to apply the override to.
            user_contexts: List of user context IDs to apply the override to.

        Raises:
        ------
            ValueError: If both contexts and user_contexts are provided, or if neither
                       contexts nor user_contexts are provided.
        """
        if contexts is not None and user_contexts is not None:
            raise ValueError("Cannot specify both contexts and user_contexts")

        if contexts is None and user_contexts is None:
            raise ValueError("Must specify either contexts or user_contexts")

        params: dict[str, Any] = {"timezone": timezone}

        if contexts is not None:
            params["contexts"] = contexts
        elif user_contexts is not None:
            params["userContexts"] = user_contexts

        self.conn.execute(command_builder("emulation.setTimezoneOverride", params))
