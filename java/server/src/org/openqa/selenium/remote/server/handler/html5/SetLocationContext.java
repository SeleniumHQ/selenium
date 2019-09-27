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

package org.openqa.selenium.remote.server.handler.html5;

import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.html5.Location;
import org.openqa.selenium.remote.server.Session;
import org.openqa.selenium.remote.server.handler.WebDriverHandler;

import java.util.Map;

public class SetLocationContext extends WebDriverHandler<Void> {
  private volatile Location location;

  public SetLocationContext(Session session) {
    super(session);
  }

  @Override
  public void setJsonParameters(Map<String, Object> allParameters) throws Exception {
    super.setJsonParameters(allParameters);
    @SuppressWarnings("unchecked")
    Map<Object, Object> locationMap = (Map<Object, Object>) allParameters.get("location");

    double latitude;
    try {
      latitude = ((Number) locationMap.get("latitude")).doubleValue();
    } catch (ClassCastException ex) {
      throw new WebDriverException("Illegal (non-double) latitude location passed: " + locationMap.get("latitude"), ex);
    }

    double longitude;
    try {
      longitude = ((Number) locationMap.get("longitude")).doubleValue();
    } catch (ClassCastException ex) {
      throw new WebDriverException("Illegal (non-double) longitude location passed: " + locationMap.get("longitude"), ex);
    }

    double altitude;
    try {
      altitude = ((Number) locationMap.get("altitude")).doubleValue();
    } catch (ClassCastException ex) {
      throw new WebDriverException("Illegal (non-double) altitude location passed: " + locationMap.get("altitude"), ex);
    }

    location = new Location(latitude, longitude, altitude);
  }

  @Override
  public Void call() {
    Utils.getLocationContext(getUnwrappedDriver()).setLocation(location);
    return null;
  }

  @Override
  public String toString() {
    return String.format("[set location context: %s]", location.toString());
  }

}
