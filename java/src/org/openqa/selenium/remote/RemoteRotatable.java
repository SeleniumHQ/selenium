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
import org.openqa.selenium.internal.Require;

import java.util.Map;

/**
 * @deprecated As this is only available only for mobile which is handled by the Appium project
 */
@Deprecated
class RemoteRotatable implements Rotatable {

  private final ExecuteMethod executeMethod;

  public RemoteRotatable(ExecuteMethod executeMethod) {
    this.executeMethod = Require.nonNull("Execute method", executeMethod);
  }

  @Override
  public void rotate(ScreenOrientation orientation) {
    executeMethod.execute(DriverCommand.SET_SCREEN_ORIENTATION, ImmutableMap.of("orientation", orientation));
  }

  @Override
  public ScreenOrientation getOrientation() {
    return ScreenOrientation.valueOf(
      (String) executeMethod.execute(DriverCommand.GET_SCREEN_ORIENTATION, null));
  }

  @Override
  public void rotate(DeviceRotation rotation) {
    executeMethod.execute(DriverCommand.SET_SCREEN_ROTATION, rotation.parameters());
  }

  @Override
  public DeviceRotation rotation() {
    Object result = executeMethod.execute(DriverCommand.GET_SCREEN_ROTATION, null);
    if (!(result instanceof Map)) {
      throw new IllegalStateException("Unexpected return value: " + result);
    }

    @SuppressWarnings("unchecked") Map<String, Number> raw = (Map<String, Number>) result;
    return new DeviceRotation(raw);
  }
}
