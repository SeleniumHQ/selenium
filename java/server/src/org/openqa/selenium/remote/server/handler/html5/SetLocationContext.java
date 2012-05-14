/*
Copyright 2007-2010 Selenium committers

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
 */

package org.openqa.selenium.remote.server.handler.html5;

import org.openqa.selenium.html5.Location;
import org.openqa.selenium.html5.LocationContext;
import org.openqa.selenium.remote.server.JsonParametersAware;
import org.openqa.selenium.remote.server.Session;
import org.openqa.selenium.remote.server.handler.WebDriverHandler;
import org.openqa.selenium.remote.server.rest.ResultType;

import java.util.Map;

public class SetLocationContext extends WebDriverHandler implements JsonParametersAware {
  private volatile Location location;

  public SetLocationContext(Session session) {
    super(session);
  }

  public ResultType call() throws Exception {
    ((LocationContext) getUnwrappedDriver()).setLocation(location);
    return ResultType.SUCCESS;
  }

  public void setJsonParameters(Map<String, Object> allParameters) throws Exception {
    Map<Object, Object> map = (Map<Object, Object>) allParameters.get("location");

    double latitude = (Double) map.get("latitude");
    double longitude = (Double) map.get("longitude");
    double altitude = (Double) map.get("altitude");

    location = new Location(latitude, longitude, altitude);
  }

  @Override
  public String toString() {
    return String.format("[set location context: %s]", location.toString());
  }

}
