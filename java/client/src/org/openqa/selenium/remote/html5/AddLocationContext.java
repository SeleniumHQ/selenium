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

package org.openqa.selenium.remote.html5;

import com.google.common.collect.ImmutableMap;

import org.openqa.selenium.html5.Location;
import org.openqa.selenium.html5.LocationContext;
import org.openqa.selenium.remote.AugmenterProvider;
import org.openqa.selenium.remote.DriverCommand;
import org.openqa.selenium.remote.ExecuteMethod;
import org.openqa.selenium.remote.InterfaceImplementation;

import java.lang.reflect.Method;
import java.util.Map;

public class AddLocationContext implements AugmenterProvider {

  public Class<?> getDescribedInterface() {
    return LocationContext.class;
  }

  public InterfaceImplementation getImplementation(Object value) {
    return new InterfaceImplementation() {

      public Object invoke(ExecuteMethod executeMethod, Object self, Method method, Object... args) {
        if ("location".equals(method.getName())) {
          Map<Object, Object> map =
              (Map<Object, Object>) executeMethod.execute(DriverCommand.GET_LOCATION, null);
          double latitude = Long.valueOf((Long) map.get("latitude")).doubleValue();
          double longitude = Long.valueOf((Long) map.get("longitude")).doubleValue();
          double altitude = Long.valueOf((Long) map.get("altitude")).doubleValue();
          return new Location(latitude, longitude, altitude);
        } else if ("setLocation".equals(method.getName())) {
          return executeMethod.execute(DriverCommand.SET_LOCATION,
              ImmutableMap.of("location", args[0]));
        }
        return null;
      }
    };
  }

}
