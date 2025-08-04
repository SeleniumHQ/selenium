// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

package org.openqa.selenium.bidi.emulation;

import java.util.HashMap;
import java.util.Map;

public class GeolocationCoordinates {
  private final Map<String, Object> map = new HashMap<>();

  public GeolocationCoordinates(double latitude, double longitude) {
    if (latitude < -90.0 || latitude > 90.0) {
      throw new IllegalArgumentException("Latitude must be between -90.0 and 90.0");
    }
    if (longitude < -180.0 || longitude > 180.0) {
      throw new IllegalArgumentException("Longitude must be between -180.0 and 180.0");
    }

    map.put("latitude", latitude);
    map.put("longitude", longitude);
    map.put("accuracy", 1.0); // Default accuracy
  }

  public GeolocationCoordinates accuracy(double accuracy) {
    if (accuracy < 0.0) {
      throw new IllegalArgumentException("Accuracy must be >= 0.0");
    }
    map.put("accuracy", accuracy);
    return this;
  }

  public GeolocationCoordinates altitude(Double altitude) {
    if (altitude != null) {
      map.put("altitude", altitude);
    }
    return this;
  }

  public GeolocationCoordinates altitudeAccuracy(Double altitudeAccuracy) {
    if (altitudeAccuracy != null) {
      if (!map.containsKey("altitude")) {
        throw new IllegalArgumentException("altitudeAccuracy cannot be set without altitude");
      }
      if (altitudeAccuracy < 0.0) {
        throw new IllegalArgumentException("Altitude accuracy must be >= 0.0");
      }
      map.put("altitudeAccuracy", altitudeAccuracy);
    }
    return this;
  }

  public GeolocationCoordinates heading(Double heading) {
    if (heading != null) {
      if (heading < 0.0 || heading >= 360.0) {
        throw new IllegalArgumentException("Heading must be between 0.0 and 360.0");
      }
      map.put("heading", heading);
    }
    return this;
  }

  public GeolocationCoordinates speed(Double speed) {
    if (speed != null) {
      if (speed < 0.0) {
        throw new IllegalArgumentException("Speed must be >= 0.0");
      }
      map.put("speed", speed);
    }
    return this;
  }

  public double getLatitude() {
    return (Double) map.get("latitude");
  }

  public double getLongitude() {
    return (Double) map.get("longitude");
  }

  public double getAccuracy() {
    return (Double) map.get("accuracy");
  }

  public Double getAltitude() {
    return (Double) map.get("altitude");
  }

  public Double getAltitudeAccuracy() {
    return (Double) map.get("altitudeAccuracy");
  }

  public Double getHeading() {
    return (Double) map.get("heading");
  }

  public Double getSpeed() {
    return (Double) map.get("speed");
  }

  public Map<String, Object> toMap() {
    return Map.copyOf(map);
  }
}
