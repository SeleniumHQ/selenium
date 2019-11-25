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

package org.openqa.selenium.remote;

import com.google.common.collect.ImmutableMap;

import org.openqa.selenium.DeviceRotation;
import org.openqa.selenium.Rotatable;
import org.openqa.selenium.ScreenOrientation;

public class AddRotatable implements AugmenterProvider {

  @Override
  public Class<?> getDescribedInterface() {
    return Rotatable.class;
  }

  @Override
  public InterfaceImplementation getImplementation(Object value) {
    return (executeMethod, self, method, args) -> {
      String m = method.getName();
      Object response;
      switch(m) {
        case "rotate":
          if (args[0] instanceof ScreenOrientation) {
            response = executeMethod.execute(DriverCommand.SET_SCREEN_ORIENTATION, ImmutableMap.of("orientation", args[0]));
          } else if (args[0] instanceof DeviceRotation) {
            response = executeMethod.execute(DriverCommand.SET_SCREEN_ORIENTATION, ((DeviceRotation)args[0]).parameters());
          } else {
            throw new IllegalArgumentException("rotate parameter must be either of type 'ScreenOrientation' or 'DeviceRotation'");
          }
          break;
        case "getOrientation":
          response = ScreenOrientation.valueOf((String) executeMethod.execute(DriverCommand.GET_SCREEN_ORIENTATION, null));
          break;
        case "rotation":
          response = executeMethod.execute(DriverCommand.GET_SCREEN_ROTATION, null);
          break;
        default:
          throw new IllegalArgumentException(method.getName() + ", Not defined in rotatable interface");
      }
      return response;
    };
  }

}
