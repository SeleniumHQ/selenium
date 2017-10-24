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

package org.openqa.selenium.html5;

/**
 * Represents the physical location of the browser.
 */
public class Location {

  private final double latitude;
  private final double longitude;
  private final double altitude;

  public Location(double latitude, double longitude, double altitude) {
    this.latitude = latitude;
    this.longitude = longitude;
    this.altitude = altitude;
  }

  public double getLatitude() {
    return latitude;
  }

  public double getLongitude() {
    return longitude;
  }

  public double getAltitude() {
    return altitude;
  }

  @Override
  public String toString() {
    return String.format("Latitude: %s, Longitude: %s, Altitude: %s",
        latitude, longitude, altitude);
  }
}
