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

package org.openqa.selenium.bidi.module;

import java.util.HashMap;
import java.util.Map;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.bidi.BiDi;
import org.openqa.selenium.bidi.Command;
import org.openqa.selenium.bidi.HasBiDi;
import org.openqa.selenium.bidi.permissions.PermissionState;
import org.openqa.selenium.internal.Require;

public class Permission {

  private final BiDi bidi;

  public Permission(WebDriver driver) {
    Require.nonNull("WebDriver", driver);

    if (!(driver instanceof HasBiDi)) {
      throw new IllegalArgumentException("WebDriver instance must support BiDi protocol");
    }

    this.bidi = ((HasBiDi) driver).getBiDi();
  }

  public void setPermission(
      Map<String, String> permissionDescriptor, PermissionState state, String origin) {
    this.setPermission(permissionDescriptor, state, origin, null);
  }

  public void setPermission(
      Map<String, String> permissionDescriptor,
      PermissionState state,
      String origin,
      String userContext) {
    Require.nonNull("Permission descriptor", permissionDescriptor);
    Require.nonNull("Permission state", state);
    Require.nonNull("Origin", origin);

    Map<String, Object> params =
        new HashMap<>(
            Map.of(
                "descriptor", permissionDescriptor,
                "state", state.toString(),
                "origin", origin));

    if (userContext != null) {
      params.put("userContext", userContext);
    }

    this.bidi.send(new Command<>("permissions.setPermission", params));
  }
}
