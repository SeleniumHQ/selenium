/*
Copyright 2010 Selenium committers

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

package org.openqa.selenium.remote;

import com.google.common.collect.ImmutableMap;

import org.openqa.selenium.Rotatable;
import org.openqa.selenium.ScreenOrientation;

import java.lang.reflect.Method;

public class AddRotatable implements AugmenterProvider {

  public Class<?> getDescribedInterface() {
    return Rotatable.class;
  }

  public InterfaceImplementation getImplementation(Object value) {
    return new InterfaceImplementation() {
      public Object invoke(ExecuteMethod executeMethod, Object self, Method method, Object... args) {
        if ("rotate".equals(method.getName())) {
          return executeMethod.execute(DriverCommand.SET_SCREEN_ORIENTATION,
              ImmutableMap.of("orientation", args[0]));
        } else if ("getOrientation".equals(method.getName())) {
          return ScreenOrientation.valueOf((String) executeMethod.execute(
              DriverCommand.GET_SCREEN_ORIENTATION, null));
        }
        return null;
      }
    };
  }

}
