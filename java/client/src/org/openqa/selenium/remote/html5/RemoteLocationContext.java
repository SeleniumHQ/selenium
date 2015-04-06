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

package org.openqa.selenium.remote.html5;

import com.google.common.collect.ImmutableMap;

import org.openqa.selenium.html5.Location;
import org.openqa.selenium.html5.LocationContext;
import org.openqa.selenium.remote.DriverCommand;
import org.openqa.selenium.remote.ExecuteMethod;

import java.util.Map;

public class RemoteLocationContext implements LocationContext {
  private final ExecuteMethod executeMethod;

  public RemoteLocationContext(ExecuteMethod executeMethod) {
    this.executeMethod = executeMethod;
  }

  @Override
  public Location location() {
    @SuppressWarnings("unchecked")
    Map<String, Double> result = (Map<String, Double>) executeMethod.execute(
        DriverCommand.GET_LOCATION, null);
    if (result == null) {
      return null;
    }
    return new Location(result.get("latitude"), result.get("longitude"), result.get("altitude"));
  }

  @Override
  public void setLocation (Location location) {
    Map<String, Location> args = ImmutableMap.of("location", location);
    executeMethod.execute(DriverCommand.SET_LOCATION, args);
  }
}
