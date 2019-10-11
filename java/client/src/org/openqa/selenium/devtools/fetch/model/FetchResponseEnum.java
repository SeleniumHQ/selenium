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
package org.openqa.selenium.devtools.fetch.model;

import org.openqa.selenium.devtools.DevToolsException;
import org.openqa.selenium.json.JsonInput;

import java.util.Arrays;
import java.util.Objects;

/**
 * The decision on what to do in response to the authorization challenge. Default means deferring to
 * the default behavior of the net stack, which will likely either the Cancel authentication or
 * display a popup dialog box.
 */
public enum FetchResponseEnum {
  Default,
  CancelAuth,
  ProvideCredentials;

  public static FetchResponseEnum getFetchResponseEnum(String val) {
    Objects.requireNonNull(val, "missing value to compare");
    return Arrays.stream(FetchResponseEnum.values())
        .filter(fr -> fr.name().equalsIgnoreCase(val))
        .findFirst()
        .orElseThrow(
            () -> new DevToolsException("Given value " + val + ", is not FetchResponseEnum"));
  }

  private static FetchResponseEnum fromJson(JsonInput input) {
    String in = input.nextString();
    return getFetchResponseEnum(in);
  }
}
