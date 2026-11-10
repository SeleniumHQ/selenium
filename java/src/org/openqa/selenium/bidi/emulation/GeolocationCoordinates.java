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
import org.jspecify.annotations.Nullable;
import org.openqa.selenium.Beta;
import org.openqa.selenium.internal.Require;

@Beta
public class GeolocationCoordinates {
  private static final String ALTITUDE = "altitude";
  private static final double DEFAULT_ACCURACY = 1.0;
  private static final String ALTITUDE_ACCURACY = "altitudeAccuracy";
  private static final String HEADING = "heading";
  private static final String SPEED = "speed";
  private static final String ACCURACY = "accuracy";
  private static final String LATITUDE = "latitude";
  private static final String LONGITUDE = "longitude";

  private final Map<String, Object> map = new HashMap<>();

  public GeolocationCoordinates(double latitude, double longitude) {
    Require.inRangeInclusive("Latitude", latitude, -90.0, 90.0);
    Require.inRangeInclusive("Longitude", longitude, -180.0, 180.0);

    map.put(LATITUDE, latitude);
    map.put(LONGITUDE, longitude);
    map.put(ACCURACY, DEFAULT_ACCURACY);
  }

  public GeolocationCoordinates accuracy(double accuracy) {
    map.put(ACCURACY, Require.nonNegative("Accuracy", accuracy));
    return this;
  }

  public GeolocationCoordinates altitude(@Nullable Double altitude) {
    if (altitude != null) {
      map.put(ALTITUDE, altitude);
    }
    return this;
  }

  public GeolocationCoordinates altitudeAccuracy(@Nullable Double altitudeAccuracy) {
    if (altitudeAccuracy != null) {
      if (!map.containsKey(ALTITUDE)) {
        throw new IllegalArgumentException("altitudeAccuracy cannot be set without altitude");
      }
      map.put(ALTITUDE_ACCURACY, Require.nonNegative("Altitude accuracy", altitudeAccuracy));
    }
    return this;
  }

  public GeolocationCoordinates heading(@Nullable Double heading) {
    if (heading != null) {
      map.put(HEADING, Require.inRangeInclusive("Heading", heading, 0, 360));
    }
    return this;
  }

  public GeolocationCoordinates speed(@Nullable Double speed) {
    if (speed != null) {
      map.put(SPEED, Require.nonNegative("Speed", speed));
    }
    return this;
  }

  public double getLatitude() {
    return (Double) map.get(LATITUDE);
  }

  public double getLongitude() {
    return (Double) map.get(LONGITUDE);
  }

  public double getAccuracy() {
    return (Double) map.get(ACCURACY);
  }

  @Nullable
  public Double getAltitude() {
    return (Double) map.get(ALTITUDE);
  }

  @Nullable
  public Double getAltitudeAccuracy() {
    return (Double) map.get(ALTITUDE_ACCURACY);
  }

  @Nullable
  public Double getHeading() {
    return (Double) map.get(HEADING);
  }

  @Nullable
  public Double getSpeed() {
    return (Double) map.get(SPEED);
  }

  public Map<String, Object> toMap() {
    return Map.copyOf(map);
  }
}
