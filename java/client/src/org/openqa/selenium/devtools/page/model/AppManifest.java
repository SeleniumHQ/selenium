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
package org.openqa.selenium.devtools.page.model;

import org.openqa.selenium.devtools.DevToolsException;
import org.openqa.selenium.json.JsonInput;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

public class AppManifest {

  private final String url;

  private final List<AppManifestError> errors;

  private final String data;

  public AppManifest(String url,
                     List<AppManifestError> errors, String data) {
    this.url = Objects.requireNonNull(url, "url is require");
    this.errors = validateErrors(errors);
    this.data = data;
  }

  private static AppManifest fromJson(JsonInput input) {
    String url = input.nextString();
    List<AppManifestError> errors = null;
    String data = null;
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "errors":
          errors = new ArrayList<>();
          input.beginArray();
          while (input.hasNext()) {
            errors.add(input.read(AppManifestError.class));
          }
          input.endArray();
          break;
        case "data":
          data = input.nextString();
          break;
        default:
          input.skipValue();
          break;
      }

    }
    return new AppManifest(url, errors, data);
  }

  private List<AppManifestError> validateErrors(List<AppManifestError> errors) {
    Objects.requireNonNull(errors, "errors is required ");
    if (errors.isEmpty()) {
      throw new DevToolsException("errors is empty");
    }
    return errors;
  }
}
